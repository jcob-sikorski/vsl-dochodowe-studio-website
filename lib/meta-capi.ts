/* -------------------------------------------------------------------------- *
 * src/lib/meta-capi.ts
 *
 * The ONLY place that talks to the Meta Conversions API.
 *
 * Events this app sends:
 *   - "SubmitApplication"  form submitted      (/api/register, server-side)
 *   - "PageView"           route change        (pixel component -> server action)
 *   - "Lead"               call booked         (/api/conversion, GHL webhook)
 *   - "Purchase"           deal won            (/api/conversion, GHL webhook)
 *
 * Nothing else is ever sent — ALLOWED_EVENTS is enforced at runtime.
 * The two offline events can only be triggered by an authenticated GHL webhook,
 * never by a browser.
 *
 * SERVER ONLY. Importing this from a "use client" file will leak your token.
 * -------------------------------------------------------------------------- */

import crypto from "crypto";

import { buildFbcFromClickId, hasPaidClick, type Attribution } from "./attribution";
import { describeError, fetchWithRetry, safeJson, safeText } from "./http";

/* -------------------------------------------------------------------------- *
 * Config
 * -------------------------------------------------------------------------- */

const GRAPH_VERSION = process.env.META_GRAPH_API_VERSION?.trim() || "v21.0";
const PIXEL_ID = (process.env.NEXT_PUBLIC_META_PIXEL_ID || process.env.META_PIXEL_ID || "").trim();
const ACCESS_TOKEN = (process.env.META_CAPI_ACCESS_TOKEN || "").trim();
/** Set ONLY while debugging in Events Manager -> Test Events. Leave unset in prod. */
const TEST_EVENT_CODE = process.env.META_CAPI_TEST_EVENT_CODE?.trim();

/**
 * OFF by default: every conversion is reported and Meta decides which ones it
 * can attribute to an ad.
 *
 * Gating on fbclid/fbc looks tidy but discards real conversions. The whole point
 * of CAPI is that Meta can match a person on hashed email/phone once the click
 * ID is gone — someone who clicked on a phone and bought on a laptop, or whose
 * _fbc aged out under Safari's 7-day cap while this funnel ran VSL -> call ->
 * close. Those conversions belong to the ad, and withholding them also starves
 * optimisation, which learns from the Purchase events you actually send.
 *
 * Sending them does not pollute Ads Manager: ad-level columns only ever credit
 * conversions Meta itself attributes. Every event carries
 * `traffic_type: "paid" | "organic"` in custom_data, so a custom conversion
 * filtered on "paid" still gives you the click-only view on demand.
 *
 * Set META_ONLY_PAID_TRAFFIC=true to suppress organic conversions instead.
 */
const ONLY_PAID_TRAFFIC =
  (process.env.META_ONLY_PAID_TRAFFIC ?? "false").trim().toLowerCase() === "true";

/**
 * The complete allow-list of events this codebase may send.
 *
 *   SubmitApplication - form submitted (fired by /api/register)
 *   PageView          - route change (fired by the pixel component)
 *   Lead              - call booked (NOT showed; see META_EVENT_FOR_STAGE)
 *   Purchase          - deal won              (fired by /api/conversion)
 *
 * Anything not on this list is refused at runtime.
 */
export const ALLOWED_EVENTS = ["SubmitApplication", "PageView", "Lead", "Purchase"] as const;
export type MetaEventName = (typeof ALLOWED_EVENTS)[number];

/** Meta's accepted action_source values. */
export type MetaActionSource =
  | "website"
  | "email"
  | "phone_call"
  | "chat"
  | "physical_store"
  | "system_generated"
  | "business_messaging"
  | "other";

/** Meta rejects events older than 7 days. Stay a little inside the edge. */
const MAX_EVENT_AGE_SECONDS = 7 * 24 * 60 * 60 - 3_600;

export interface MetaResult {
  ok: boolean;
  /** true when the call was intentionally not made (missing env, bad event). */
  skipped?: boolean;
  eventsReceived?: number;
  fbTraceId?: string;
  error?: string;
}

export interface MetaUserInput {
  email?: string;
  /** Digits only, including country code, e.g. "48500123456". */
  phone?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  state?: string;
  zip?: string;
  /** ISO-3166-1 alpha-2, e.g. "pl". */
  country?: string;
  externalId?: string;
}

export interface SendMetaEventArgs {
  eventName: MetaEventName;
  /** Must match the browser pixel's eventID for deduplication. */
  eventId: string;
  sourceUrl?: string;
  clientIp?: string;
  clientUserAgent?: string;
  fbp?: string;
  fbc?: string;
  user?: MetaUserInput;
  attribution?: Attribution;
  customData?: Record<string, string | number>;
  /** Unix seconds. Defaults to now. Clamped into Meta's 7-day window. */
  eventTime?: number;
  /** Defaults to "website". Offline/CRM conversions should pass "system_generated". */
  actionSource?: MetaActionSource;
  /** Purchase value. Emitted into custom_data alongside `currency`. */
  value?: number;
  /** ISO-4217, e.g. "PLN". Required by Meta whenever `value` is set. */
  currency?: string;
}

/* -------------------------------------------------------------------------- *
 * Normalisation + hashing (per Meta's Advanced Matching spec)
 * -------------------------------------------------------------------------- */

function sha256(value: string): string {
  return crypto.createHash("sha256").update(value, "utf8").digest("hex");
}

/** Already-hashed values must be passed through untouched. */
function isSha256(value: string): boolean {
  return /^[a-f0-9]{64}$/i.test(value);
}

function hash(value: string | undefined | null): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return isSha256(trimmed) ? trimmed.toLowerCase() : sha256(trimmed);
}

function normEmail(value?: string): string | undefined {
  const email = value?.trim().toLowerCase();
  if (!email || !email.includes("@")) return undefined;
  return email;
}

function normPhone(value?: string): string | undefined {
  if (!value) return undefined;
  const digits = value.replace(/\D/g, "").replace(/^0+/, "");
  if (digits.length < 8 || digits.length > 15) return undefined;
  return digits;
}

function normName(value?: string): string | undefined {
  if (!value) return undefined;
  // Lowercase, strip punctuation/digits, keep Unicode letters (diacritics stay:
  // Meta hashes the UTF-8 string, so "łukasz" must not become "ukasz").
  const cleaned = value
    .toLowerCase()
    .normalize("NFC")
    .replace(/[^\p{L}\p{M}\s'-]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned || undefined;
}

function normCountry(value?: string): string | undefined {
  const country = value?.trim().toLowerCase();
  return country && /^[a-z]{2}$/.test(country) ? country : undefined;
}

function normZip(value?: string): string | undefined {
  const zip = value?.trim().toLowerCase().replace(/\s+/g, "");
  return zip || undefined;
}

/* -------------------------------------------------------------------------- *
 * Payload builder
 * -------------------------------------------------------------------------- */

function buildUserData(args: SendMetaEventArgs): Record<string, unknown> {
  const { user = {}, attribution = {} } = args;

  const fbc =
    args.fbc ||
    attribution.fbc ||
    (attribution.fbclid ? buildFbcFromClickId(attribution.fbclid, attribution.captured_at) : undefined);

  const fbp = args.fbp || attribution.fbp;

  const userData: Record<string, unknown> = {};

  if (args.clientIp && args.clientIp !== "0.0.0.0") userData.client_ip_address = args.clientIp;
  if (args.clientUserAgent) userData.client_user_agent = args.clientUserAgent.slice(0, 500);
  if (fbp) userData.fbp = fbp;
  if (fbc) userData.fbc = fbc;

  const email = normEmail(user.email);
  if (email) userData.em = [hash(email)!];

  const phone = normPhone(user.phone);
  if (phone) userData.ph = [hash(phone)!];

  const firstName = normName(user.firstName);
  if (firstName) userData.fn = [hash(firstName)!];

  const lastName = normName(user.lastName);
  if (lastName) userData.ln = [hash(lastName)!];

  const city = normName(user.city);
  if (city) userData.ct = [hash(city.replace(/\s|-/g, ""))!];

  const state = normName(user.state);
  if (state) userData.st = [hash(state.replace(/\s|-/g, ""))!];

  const zip = normZip(user.zip);
  if (zip) userData.zp = [hash(zip)!];

  const country = normCountry(user.country);
  if (country) userData.country = [hash(country)!];

  // external_id: stable, hashed. Email is the best identifier we have.
  const externalIdSource = user.externalId || email;
  if (externalIdSource) userData.external_id = [hash(externalIdSource.toLowerCase())!];

  return userData;
}

/** Did this person reach us through a Meta ad click? */
function isPaid(args: SendMetaEventArgs): boolean {
  return hasPaidClick({ ...(args.attribution ?? {}), fbc: args.fbc || args.attribution?.fbc });
}

function buildCustomData(args: SendMetaEventArgs): Record<string, unknown> {
  const attr = args.attribution ?? {};
  const custom: Record<string, unknown> = { ...(args.customData ?? {}) };

  const passthrough: (keyof Attribution)[] = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
    "utm_id",
  ];

  for (const key of passthrough) {
    const value = attr[key];
    if (value) custom[key] = value;
  }

  // Segmentation lever: filter a custom conversion on traffic_type = "paid" to
  // see ad-driven conversions alone, without withholding the organic ones.
  custom.traffic_type = isPaid(args) ? "paid" : "organic";

  // Meta requires the pair: a value without a currency is silently dropped.
  if (typeof args.value === "number" && Number.isFinite(args.value) && args.value >= 0) {
    custom.value = Number(args.value.toFixed(2));
    custom.currency = (args.currency || process.env.META_DEFAULT_CURRENCY || "PLN")
      .trim()
      .toUpperCase()
      .slice(0, 3);
  }

  return custom;
}

/** Keeps event_time inside the window Meta will accept. */
function resolveEventTime(requested?: number): number {
  const now = Math.floor(Date.now() / 1000);
  if (!requested || !Number.isFinite(requested)) return now;

  const seconds = requested > 1e11 ? Math.floor(requested / 1000) : Math.floor(requested);
  if (seconds > now) return now;
  if (seconds < now - MAX_EVENT_AGE_SECONDS) {
    console.warn("[meta-capi] event_time older than 7 days; clamping to the window edge");
    return now - MAX_EVENT_AGE_SECONDS;
  }
  return seconds;
}

/* -------------------------------------------------------------------------- *
 * Public API
 * -------------------------------------------------------------------------- */

/**
 * Sends one event to the Conversions API.
 * Never throws — analytics must never break a user-facing request.
 */
export async function sendMetaEvent(args: SendMetaEventArgs): Promise<MetaResult> {
  if (!ALLOWED_EVENTS.includes(args.eventName)) {
    console.warn(`[meta-capi] refused to send unknown event "${args.eventName}"`);
    return { ok: false, skipped: true, error: "event_not_allowed" };
  }

  // Opt-in organic gate. OFF by default; see ONLY_PAID_TRAFFIC above.
  if (ONLY_PAID_TRAFFIC && !isPaid(args)) {
    console.info(`[meta-capi] ${args.eventName} not sent — no fbclid/fbc (organic traffic)`);
    return { ok: false, skipped: true, error: "no_paid_click" };
  }

  if (!PIXEL_ID || !ACCESS_TOKEN) {
    console.warn("[meta-capi] NEXT_PUBLIC_META_PIXEL_ID / META_CAPI_ACCESS_TOKEN missing — skipping");
    return { ok: false, skipped: true, error: "missing_credentials" };
  }

  if (!args.eventId) {
    console.warn("[meta-capi] missing eventId — browser/server deduplication would break; skipping");
    return { ok: false, skipped: true, error: "missing_event_id" };
  }

  const userData = buildUserData(args);

  // Meta rejects events with no identifiers at all; don't waste the call.
  if (Object.keys(userData).length === 0) {
    return { ok: false, skipped: true, error: "no_user_data" };
  }

  const customData = buildCustomData(args);

  const payload: Record<string, unknown> = {
    data: [
      {
        event_name: args.eventName,
        event_time: resolveEventTime(args.eventTime),
        event_id: args.eventId,
        action_source: args.actionSource ?? "website",
        ...(args.sourceUrl ? { event_source_url: args.sourceUrl } : {}),
        user_data: userData,
        ...(Object.keys(customData).length > 0 ? { custom_data: customData } : {}),
      },
    ],
  };

  if (TEST_EVENT_CODE) payload.test_event_code = TEST_EVENT_CODE;

  // Token travels in the POST body, never in the query string — that keeps it
  // out of proxy/CDN access logs.
  payload.access_token = ACCESS_TOKEN;

  const url = `https://graph.facebook.com/${GRAPH_VERSION}/${encodeURIComponent(PIXEL_ID)}/events`;

  try {
    const res = await fetchWithRetry(
      url,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
      { label: `meta-capi:${args.eventName}`, attempts: 3, timeoutMs: 6_000 }
    );

    if (!res.ok) {
      const body = await safeText(res, 600);
      console.error(`[meta-capi] ${args.eventName} rejected (HTTP ${res.status}): ${body}`);
      return { ok: false, error: `http_${res.status}` };
    }

    const data = await safeJson<{ events_received?: number; fbtrace_id?: string }>(res);
    return {
      ok: true,
      eventsReceived: data?.events_received,
      fbTraceId: data?.fbtrace_id,
    };
  } catch (err) {
    console.error(`[meta-capi] ${args.eventName} failed: ${describeError(err)}`);
    return { ok: false, error: describeError(err) };
  }
}

/** Convenience wrapper — the one conversion event this funnel reports. */
export function sendSubmitApplication(
  args: Omit<SendMetaEventArgs, "eventName">
): Promise<MetaResult> {
  return sendMetaEvent({ ...args, eventName: "SubmitApplication" });
}

export function sendPageView(args: Omit<SendMetaEventArgs, "eventName">): Promise<MetaResult> {
  return sendMetaEvent({ ...args, eventName: "PageView" });
}

/**
 * Offline conversion: the lead booked a call.
 *
 * action_source is "website" rather than "system_generated" on purpose. The
 * conversion originates from a lead who came through the site, and Meta's
 * tooling handles "website" far better — Test Events silently omits
 * system_generated events, which makes every future debugging session harder
 * than it needs to be. Attribution quality is unaffected either way; the fbc
 * does the matching. Override per call with `actionSource` when the booking
 * genuinely happened elsewhere (e.g. "phone_call").
 */
export function sendLead(args: Omit<SendMetaEventArgs, "eventName">): Promise<MetaResult> {
  return sendMetaEvent({ actionSource: "website", ...args, eventName: "Lead" });
}

/** Offline conversion: the deal closed. See sendLead on action_source. */
export function sendPurchase(args: Omit<SendMetaEventArgs, "eventName">): Promise<MetaResult> {
  return sendMetaEvent({ actionSource: "website", ...args, eventName: "Purchase" });
}
