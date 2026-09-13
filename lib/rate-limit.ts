/* -------------------------------------------------------------------------- *
 * src/lib/rate-limit.ts
 *
 * Tiny in-memory sliding-window limiter. Good enough to stop a script hammering
 * the form from one IP on a single long-lived instance.
 *
 * NOTE: serverless deployments run many isolated instances, so this is a speed
 * bump, not a wall. For a hard guarantee put Upstash/Redis behind the same
 * interface — `checkRateLimit` is the only thing the route calls.
 * -------------------------------------------------------------------------- */

interface Bucket {
  hits: number[];
}

const buckets = new Map<string, Bucket>();
const MAX_TRACKED_KEYS = 10_000;

export interface RateLimitOptions {
  limit?: number;
  windowMs?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export function checkRateLimit(key: string, options: RateLimitOptions = {}): RateLimitResult {
  const { limit = 6, windowMs = 60_000 } = options;
  const now = Date.now();
  const cutoff = now - windowMs;

  if (buckets.size > MAX_TRACKED_KEYS) sweep(cutoff);

  const bucket = buckets.get(key) ?? { hits: [] };
  bucket.hits = bucket.hits.filter((t) => t > cutoff);

  if (bucket.hits.length >= limit) {
    buckets.set(key, bucket);
    const oldest = bucket.hits[0] ?? now;
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((oldest + windowMs - now) / 1000)),
    };
  }

  bucket.hits.push(now);
  buckets.set(key, bucket);

  return { allowed: true, remaining: limit - bucket.hits.length, retryAfterSeconds: 0 };
}

function sweep(cutoff: number): void {
  for (const [key, bucket] of buckets) {
    const live = bucket.hits.filter((t) => t > cutoff);
    if (live.length === 0) buckets.delete(key);
    else bucket.hits = live;
  }
}

/** Best-effort client IP from the proxy chain. Always returns something. */
export function getClientIp(headers: Headers): string {
  const candidates = [
    headers.get("cf-connecting-ip"),
    headers.get("true-client-ip"),
    headers.get("x-real-ip"),
    headers.get("x-forwarded-for"),
    headers.get("x-vercel-forwarded-for"),
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;
    const first = candidate.split(",")[0]?.trim();
    if (first && isIpLike(first)) return first;
  }

  return "0.0.0.0";
}

function isIpLike(value: string): boolean {
  if (value.length > 45) return false;
  // IPv4
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(value)) {
    return value.split(".").every((octet) => Number(octet) <= 255);
  }
  // IPv6 (loose, but enough to reject junk headers)
  return /^[0-9A-Fa-f:]+$/.test(value) && value.includes(":");
}
