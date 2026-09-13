/* -------------------------------------------------------------------------- *
 * src/lib/attribution.ts
 *
 * Isomorphic. The pure helpers (normalizeAttribution, buildFbcFromClickId)
 * are imported by the server; the browser helpers are guarded by a
 * `typeof window` check so importing this file on the server is always safe.
 *
 * Captures last-touch AND first-touch, plus the Meta _fbp/_fbc cookies, so the
 * same object can feed both GoHighLevel and the Conversions API.
 * -------------------------------------------------------------------------- */

export const ATTRIBUTION_STORAGE_KEY = "ds_attribution";
export const ATTRIBUTION_FIRST_TOUCH_KEY = "ds_attribution_first";

export const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "utm_id",
] as const;

export const CLICK_ID_KEYS = ["fbclid", "gclid", "msclkid", "ttclid", "twclid", "li_fat_id"] as const;

export type UtmKey = (typeof UTM_KEYS)[number];
export type ClickIdKey = (typeof CLICK_ID_KEYS)[number];

export interface Attribution {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  utm_id?: string;

  fbclid?: string;
  gclid?: string;
  msclkid?: string;
  ttclid?: string;
  twclid?: string;
  li_fat_id?: string;

  /** Meta browser cookies, read client-side and forwarded to the server. */
  fbp?: string;
  fbc?: string;

  landing_url?: string;
  referrer?: string;
  captured_at?: string;

  /** First page of the very first visit in this browser. */
  first_landing_url?: string;
  first_referrer?: string;
  first_captured_at?: string;
  first_utm_source?: string;
  first_utm_campaign?: string;
}

/** Field length caps — protects GHL/Meta from absurd or hostile query strings. */
const MAX_LEN: Record<string, number> = {
  fbclid: 512,
  gclid: 512,
  msclkid: 512,
  ttclid: 512,
  twclid: 512,
  li_fat_id: 255,
  fbp: 255,
  fbc: 600,
  landing_url: 1024,
  first_landing_url: 1024,
  referrer: 1024,
  first_referrer: 1024,
};

const DEFAULT_MAX_LEN = 255;

/** Strips control characters, trims, and caps length. Returns undefined when empty. */
export function sanitizeAttrValue(value: unknown, maxLen = DEFAULT_MAX_LEN): string | undefined {
  if (typeof value !== "string") return undefined;
  // eslint-disable-next-line no-control-regex
  const cleaned = value.replace(/[\u0000-\u001F\u007F]/g, "").trim();
  if (!cleaned) return undefined;
  return cleaned.slice(0, maxLen);
}

/**
 * Server- and client-safe: takes whatever arrived in the request body and
 * returns a whitelisted, length-capped Attribution object. Unknown keys are
 * dropped, so a malicious client cannot inject arbitrary fields into GHL.
 */
export function normalizeAttribution(input: unknown): Attribution {
  const raw = (input ?? {}) as Record<string, unknown>;
  const out: Attribution = {};

  const keys: (keyof Attribution)[] = [
    ...UTM_KEYS,
    ...CLICK_ID_KEYS,
    "fbp",
    "fbc",
    "landing_url",
    "referrer",
    "captured_at",
    "first_landing_url",
    "first_referrer",
    "first_captured_at",
    "first_utm_source",
    "first_utm_campaign",
  ];

  for (const key of keys) {
    const value = sanitizeAttrValue(raw[key], MAX_LEN[key] ?? DEFAULT_MAX_LEN);
    if (value) out[key] = value;
  }

  // captured_at must be a real ISO timestamp or nothing at all.
  if (out.captured_at && !Number.isFinite(Date.parse(out.captured_at))) delete out.captured_at;
  if (out.first_captured_at && !Number.isFinite(Date.parse(out.first_captured_at))) {
    delete out.first_captured_at;
  }

  return out;
}

/**
 * Meta's documented format for building `fbc` yourself when you have the
 * fbclid but not the _fbc cookie: fb.<subdomain_index>.<creation_time_ms>.<fbclid>
 * subdomain_index is 1 for a standard apex/www domain.
 */
export function buildFbcFromClickId(fbclid: string, capturedAtIso?: string): string {
  const parsed = capturedAtIso ? Date.parse(capturedAtIso) : NaN;
  const timestamp = Number.isFinite(parsed) ? parsed : Date.now();
  return `fb.1.${timestamp}.${fbclid}`;
}

/* -------------------------------------------------------------------------- *
 * Browser-only helpers
 * -------------------------------------------------------------------------- */

const isBrowser = () => typeof window !== "undefined" && typeof document !== "undefined";

function readStorage(key: string): Attribution {
  if (!isBrowser()) return {};
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? normalizeAttribution(parsed) : {};
  } catch {
    return {};
  }
}

function writeStorage(key: string, value: Attribution): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Private mode / storage blocked — the value still works for THIS
    // submission, it just won't survive a reload.
  }
}

/** Reads a cookie value without a dependency. */
export function readCookie(name: string): string | undefined {
  if (!isBrowser()) return undefined;
  try {
    const match = document.cookie.match(
      new RegExp(`(?:^|;\\s*)${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}=([^;]*)`)
    );
    return match ? decodeURIComponent(match[1]) : undefined;
  } catch {
    return undefined;
  }
}

/** The two cookies the Meta pixel drops. Both massively improve match quality. */
export function readFbCookies(): { fbp?: string; fbc?: string } {
  return {
    fbp: sanitizeAttrValue(readCookie("_fbp"), MAX_LEN.fbp),
    fbc: sanitizeAttrValue(readCookie("_fbc"), MAX_LEN.fbc),
  };
}

/**
 * Reads UTMs / click IDs straight off the current URL — no cookies involved.
 * Called on every page mount and again right before form submission, so a live
 * ad click always wins even if localStorage was cleared mid-session.
 *
 * Returns null when the URL carries no attribution at all.
 */
export function captureAttributionFromUrl(): Attribution | null {
  if (!isBrowser()) return null;

  let params: URLSearchParams;
  try {
    params = new URLSearchParams(window.location.search);
  } catch {
    return null;
  }

  const incoming: Attribution = {};
  let hasAny = false;

  for (const key of UTM_KEYS) {
    const value = sanitizeAttrValue(params.get(key), MAX_LEN[key] ?? DEFAULT_MAX_LEN);
    if (value) {
      incoming[key] = value;
      hasAny = true;
    }
  }

  for (const key of CLICK_ID_KEYS) {
    const value = sanitizeAttrValue(params.get(key), MAX_LEN[key] ?? DEFAULT_MAX_LEN);
    if (value) {
      incoming[key] = value;
      hasAny = true;
    }
  }

  if (!hasAny) return null;

  incoming.landing_url = sanitizeAttrValue(
    `${window.location.origin}${window.location.pathname}${window.location.search}`,
    MAX_LEN.landing_url
  );
  incoming.referrer = sanitizeAttrValue(document.referrer, MAX_LEN.referrer);
  incoming.captured_at = new Date().toISOString();

  writeStorage(ATTRIBUTION_STORAGE_KEY, incoming);

  // First touch is written exactly once and never overwritten.
  const firstTouch = readStorage(ATTRIBUTION_FIRST_TOUCH_KEY);
  if (!firstTouch.first_captured_at) {
    writeStorage(ATTRIBUTION_FIRST_TOUCH_KEY, {
      first_landing_url: incoming.landing_url,
      first_referrer: incoming.referrer,
      first_captured_at: incoming.captured_at,
      first_utm_source: incoming.utm_source,
      first_utm_campaign: incoming.utm_campaign,
    });
  }

  return incoming;
}

export function getStoredAttribution(): Attribution {
  return readStorage(ATTRIBUTION_STORAGE_KEY);
}

export function getFirstTouchAttribution(): Attribution {
  return readStorage(ATTRIBUTION_FIRST_TOUCH_KEY);
}

/**
 * The one function the form calls. Prefers whatever is live in the current URL,
 * falls back to earlier-in-visit storage, and always layers on first-touch
 * context plus the current _fbp/_fbc cookies.
 */
export function resolveAttribution(): Attribution {
  const lastTouch = captureAttributionFromUrl() ?? getStoredAttribution();
  const firstTouch = getFirstTouchAttribution();
  const cookies = readFbCookies();

  const merged: Attribution = {
    ...firstTouch,
    ...lastTouch,
    ...cookies,
  };

  // If Meta hasn't set _fbc yet but we have the click ID, build it ourselves.
  if (!merged.fbc && merged.fbclid) {
    merged.fbc = buildFbcFromClickId(merged.fbclid, merged.captured_at);
  }

  if (!merged.referrer && isBrowser()) {
    merged.referrer = sanitizeAttrValue(document.referrer, MAX_LEN.referrer);
  }

  if (!merged.landing_url && isBrowser()) {
    merged.landing_url = sanitizeAttrValue(window.location.href, MAX_LEN.landing_url);
  }

  return normalizeAttribution(merged);
}
