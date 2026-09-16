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

/**
 * Platform object IDs, passed through the ad's URL parameters.
 *
 * These are what make per-creative cost reporting possible: ad and campaign
 * NAMES get edited, duplicated and renamed, but the IDs never change. Set them
 * in Meta's URL parameters field with {{ad.id}}, {{adset.id}}, {{campaign.id}}.
 */
export const PLATFORM_ID_KEYS = ["ad_id", "adset_id", "campaign_id"] as const;

export type UtmKey = (typeof UTM_KEYS)[number];
export type ClickIdKey = (typeof CLICK_ID_KEYS)[number];
export type PlatformIdKey = (typeof PLATFORM_ID_KEYS)[number];

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

  /** Meta object IDs from the ad's URL parameters — stable across renames. */
  ad_id?: string;
  adset_id?: string;
  campaign_id?: string;

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
  fbclid: 1000,
  gclid: 1000,
  msclkid: 1000,
  ttclid: 1000,
  twclid: 1000,
  li_fat_id: 255,
  fbp: 255,
  fbc: 1000,
  landing_url: 1024,
  first_landing_url: 1024,
  referrer: 1024,
  first_referrer: 1024,
};

const DEFAULT_MAX_LEN = 255;

/**
 * Identifiers that must be dropped rather than truncated when oversized.
 *
 * Slicing a click ID does not shorten it, it corrupts it: the result is a
 * different identifier that Meta reports as "Server sending modified fbclid
 * value in fbc parameter", and the conversion stops matching to its click.
 * Dropping is the safer failure — the event still matches on hashed email and
 * phone, and nothing malformed reaches Meta.
 */
const NEVER_TRUNCATE = new Set<string>([
  "fbc",
  "fbp",
  "fbclid",
  "gclid",
  "msclkid",
  "ttclid",
  "twclid",
  "li_fat_id",
]);

/**
 * Strips control characters, trims, and caps length. Returns undefined when
 * empty — or, when `onOverflow` is "drop", when the value exceeds `maxLen`.
 */
export function sanitizeAttrValue(
  value: unknown,
  maxLen = DEFAULT_MAX_LEN,
  onOverflow: "truncate" | "drop" = "truncate"
): string | undefined {
  if (typeof value !== "string") return undefined;
  // eslint-disable-next-line no-control-regex
  const cleaned = value.replace(/[\u0000-\u001F\u007F]/g, "").trim();
  if (!cleaned) return undefined;
  if (cleaned.length <= maxLen) return cleaned;
  return onOverflow === "drop" ? undefined : cleaned.slice(0, maxLen);
}

/** Applies the right cap and the right overflow rule for a given key. */
function sanitizeForKey(value: unknown, key: string): string | undefined {
  return sanitizeAttrValue(
    value,
    MAX_LEN[key] ?? DEFAULT_MAX_LEN,
    NEVER_TRUNCATE.has(key) ? "drop" : "truncate"
  );
}

/**
 * Reads a query parameter without URLSearchParams' "+"-to-space substitution.
 *
 * URLSearchParams applies form-encoding rules, where "+" means a space. A URL is
 * not a form: if a click ID contains "+", URLSearchParams hands back a string
 * with a space in it — a different identifier. Percent escapes are still
 * decoded, because those are genuine URI escapes.
 */
function readRawQueryParam(search: string, key: string): string | undefined {
  const query = search.startsWith("?") ? search.slice(1) : search;
  if (!query) return undefined;

  for (const pair of query.split("&")) {
    const eq = pair.indexOf("=");
    if ((eq === -1 ? pair : pair.slice(0, eq)) !== key) continue;
    const raw = eq === -1 ? "" : pair.slice(eq + 1);
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  }
  return undefined;
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
    ...PLATFORM_ID_KEYS,
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
    const value = sanitizeForKey(raw[key], key);
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
 * A click older than this is treated as implausible rather than real.
 */
const MAX_CLICK_AGE_MS = 400 * 24 * 60 * 60 * 1000;

/**
 * Is this a well-formed `fbc` that Meta will accept?
 *
 * Deliberately permissive about the click ID's character set — being strict
 * there would discard valid values and cost attribution. It rejects only what is
 * definitely broken: the wrong shape, whitespace inside the click ID (the
 * signature of a "+" that got decoded into a space), or a timestamp in the
 * future or implausibly far past.
 */
export function isValidFbc(value: string | undefined | null): value is string {
  if (!value) return false;

  const parts = value.split(".");
  if (parts.length !== 4) return false;

  const [prefix, index, ms, clickId] = parts;
  if (prefix !== "fb") return false;
  if (!/^\d+$/.test(index)) return false;
  if (!/^\d{10,16}$/.test(ms)) return false;
  if (!clickId || /\s/.test(clickId)) return false;

  const timestamp = Number(ms);
  const now = Date.now();
  return timestamp <= now + 60_000 && timestamp > now - MAX_CLICK_AGE_MS;
}

/**
 * Meta's format for building `fbc` yourself when you have the fbclid but not the
 * _fbc cookie: fb.<subdomain_index>.<click_time_ms>.<fbclid>
 *
 * The click time is REQUIRED, and that is the point. The timestamp must be when
 * the click actually happened. Stamping it with "now" — which is what this did
 * whenever `captured_at` was missing — produces a value Meta reports as a
 * modified fbclid, and the conversion stops matching to its click. Returning
 * undefined is the better failure: no fbc still matches on hashed email and
 * phone, whereas a wrong fbc poisons the match AND flags the whole dataset.
 *
 * subdomain_index 1 is correct while _fbc is set on the registrable domain
 * (dochodowestudio.com), which is what Meta's pixel does by default.
 */
export function buildFbcFromClickId(fbclid: string, clickTimeIso?: string): string | undefined {
  const clickTime = clickTimeIso ? Date.parse(clickTimeIso) : NaN;
  if (!Number.isFinite(clickTime)) return undefined;

  const candidate = `fb.1.${clickTime}.${fbclid.trim()}`;
  return isValidFbc(candidate) ? candidate : undefined;
}

/**
 * Was this visitor sent by a Meta ad?
 *
 * Isomorphic, so the same rule gates the browser pixel and the server events.
 *
 * Counts as paid:
 *   - `fbclid` in the URL (a click that happened on this visit)
 *   - a well-formed `fbc` (the _fbc cookie Meta wrote on an earlier ad click,
 *     or one we built from a previous fbclid — good for its 90-day lifetime)
 *
 * Does NOT count: `fbp`. The pixel writes that for every visitor, organic
 * included, so treating it as a paid signal would let everything through.
 */
export function hasPaidClick(attribution: Attribution | null | undefined): boolean {
  if (!attribution) return false;
  if (attribution.fbclid) return true;

  const fbc = attribution.fbc;
  return Boolean(fbc && /^fb\.\d+\.\d+\..+/.test(fbc));
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

  // Read click IDs off the raw query string, NOT via params.get(): see
  // readRawQueryParam for why URLSearchParams would corrupt a "+" in an fbclid.
  for (const key of CLICK_ID_KEYS) {
    const value = sanitizeForKey(readRawQueryParam(window.location.search, key), key);
    if (value) {
      incoming[key] = value;
      hasAny = true;
    }
  }

  for (const key of PLATFORM_ID_KEYS) {
    const value = sanitizeAttrValue(params.get(key), 64);
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

  // If Meta hasn't set _fbc yet but we have the click ID, build it ourselves —
  // only when captured_at gives us the real click time. See buildFbcFromClickId.
  if (!merged.fbc && merged.fbclid) {
    const built = buildFbcFromClickId(merged.fbclid, merged.captured_at);
    if (built) merged.fbc = built;
  }

  if (!merged.referrer && isBrowser()) {
    merged.referrer = sanitizeAttrValue(document.referrer, MAX_LEN.referrer);
  }

  if (!merged.landing_url && isBrowser()) {
    merged.landing_url = sanitizeAttrValue(window.location.href, MAX_LEN.landing_url);
  }

  return normalizeAttribution(merged);
}
