/* -------------------------------------------------------------------------- *
 * src/lib/http.ts
 *
 * Shared fetch hardening used by every outbound integration:
 *   - per-attempt timeout (a hung upstream can never hang the request)
 *   - bounded retries with exponential backoff + jitter
 *   - honours Retry-After on 429
 *   - always drains response bodies so sockets are released
 *   - never throws raw secrets into logs
 *
 * Server-side only. Do not import from a "use client" module.
 * -------------------------------------------------------------------------- */

export interface RetryOptions {
  /** Total attempts including the first one. Default 3. */
  attempts?: number;
  /** Per-attempt timeout in ms. Default 8000. */
  timeoutMs?: number;
  /** Base backoff in ms. Default 300. */
  baseDelayMs?: number;
  /** Backoff ceiling in ms. Default 4000. */
  maxDelayMs?: number;
  /** Label used in logs. */
  label?: string;
  /** Which HTTP statuses are worth retrying. */
  retryOnStatus?: (status: number) => boolean;
}

const DEFAULT_RETRY_STATUS = (status: number) =>
  status === 408 || status === 425 || status === 429 || status >= 500;

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function backoff(attempt: number, base: number, max: number): number {
  const exponential = Math.min(max, base * 2 ** (attempt - 1));
  // Full jitter — avoids thundering-herd retries when an upstream wobbles.
  return Math.floor(Math.random() * exponential) + Math.floor(exponential / 2);
}

function retryAfterMs(res: Response): number | null {
  const header = res.headers.get("retry-after");
  if (!header) return null;

  const seconds = Number(header);
  if (Number.isFinite(seconds)) return Math.min(10_000, Math.max(0, seconds * 1000));

  const date = Date.parse(header);
  if (Number.isFinite(date)) return Math.min(10_000, Math.max(0, date - Date.now()));

  return null;
}

export function describeError(err: unknown): string {
  if (err instanceof Error) {
    if (err.name === "AbortError" || err.name === "TimeoutError") return "timeout";
    return `${err.name}: ${err.message}`;
  }
  return String(err);
}

/**
 * fetch() with timeout + retry. Throws only when every attempt fails at the
 * transport level; an HTTP error response is returned to the caller so it can
 * decide what to do with the status and body.
 */
export async function fetchWithRetry(
  url: string,
  init: RequestInit = {},
  options: RetryOptions = {}
): Promise<Response> {
  const {
    attempts = 3,
    timeoutMs = 8_000,
    baseDelayMs = 300,
    maxDelayMs = 4_000,
    label = "http",
    retryOnStatus = DEFAULT_RETRY_STATUS,
  } = options;

  let lastError: unknown = new Error(`[${label}] request failed`);

  for (let attempt = 1; attempt <= attempts; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url, {
        ...init,
        signal: controller.signal,
        cache: "no-store",
      });
      clearTimeout(timer);

      if (res.ok || !retryOnStatus(res.status) || attempt === attempts) {
        return res;
      }

      const wait = retryAfterMs(res) ?? backoff(attempt, baseDelayMs, maxDelayMs);
      // Drain so the connection can be reused / released.
      await res.text().catch(() => undefined);
      console.warn(`[${label}] attempt ${attempt}/${attempts} -> HTTP ${res.status}; retry in ${wait}ms`);
      await sleep(wait);
    } catch (err) {
      clearTimeout(timer);
      lastError = err;

      if (attempt === attempts) break;

      const wait = backoff(attempt, baseDelayMs, maxDelayMs);
      console.warn(
        `[${label}] attempt ${attempt}/${attempts} failed (${describeError(err)}); retry in ${wait}ms`
      );
      await sleep(wait);
    }
  }

  throw lastError instanceof Error ? lastError : new Error(`[${label}] request failed`);
}

/** Reads a response body as JSON without ever throwing. */
export async function safeJson<T = any>(res: Response): Promise<T | null> {
  try {
    const text = await res.text();
    if (!text) return null;
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

/** Reads a response body as text without ever throwing. Truncated for logs. */
export async function safeText(res: Response, maxLen = 1_000): Promise<string> {
  try {
    const text = await res.text();
    return text.length > maxLen ? `${text.slice(0, maxLen)}…` : text;
  } catch {
    return "";
  }
}
