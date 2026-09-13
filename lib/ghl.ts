/* -------------------------------------------------------------------------- *
 * src/lib/ghl.ts
 *
 * GoHighLevel / LeadConnector v2 client.
 *
 * Every scrap of attribution we have goes here:
 *   1. the native `attributionSource` object (what GHL's own reporting reads)
 *   2. your custom fields (what your workflows / smart lists read)
 *
 * SERVER ONLY.
 * -------------------------------------------------------------------------- */

import { normalizeAttribution, type Attribution } from "./attribution";
import { describeError, fetchWithRetry, safeJson, safeText } from "./http";
import type { NormalizedPhone } from "./phone";

const GHL_BASE = "https://services.leadconnectorhq.com";
const GHL_API_VERSION = "2021-07-28";

const API_KEY = (process.env.GHL_API_KEY || "").trim();
const LOCATION_ID = (process.env.GHL_LOCATION_ID || "").trim();
const SOURCE_LABEL = process.env.GHL_SOURCE_LABEL?.trim() || "Website Form";
const PIPELINE_TAG = process.env.GHL_WEBINAR_TAG?.trim();

export interface GhlContactInput {
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: NormalizedPhone;
  attribution: Attribution;
  clientCategory?: string;
  /** Meta event_id, stored so you can reconcile GHL rows with Events Manager. */
  eventId?: string;
  clientIp?: string;
  userAgent?: string;
  sourceUrl?: string;
  extraTags?: (string | undefined)[];
}

export interface GhlResult {
  ok: boolean;
  contactId?: string;
  isNew?: boolean;
  skipped?: boolean;
  error?: string;
}

function headers(): Record<string, string> {
  return {
    Authorization: `Bearer ${API_KEY}`,
    Version: GHL_API_VERSION,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

export function isGhlConfigured(): boolean {
  return Boolean(API_KEY && LOCATION_ID);
}

/* -------------------------------------------------------------------------- *
 * Custom field mapping
 * -------------------------------------------------------------------------- */

interface CustomFieldSpec {
  id?: string;
  value?: string;
}

function buildCustomFields(input: GhlContactInput): { id: string; field_value: string }[] {
  const a = input.attribution;

  const specs: CustomFieldSpec[] = [
    { id: process.env.GHL_UTM_SOURCE_FIELD_ID, value: a.utm_source },
    { id: process.env.GHL_UTM_MEDIUM_FIELD_ID, value: a.utm_medium },
    { id: process.env.GHL_UTM_CAMPAIGN_FIELD_ID, value: a.utm_campaign },
    { id: process.env.GHL_UTM_CONTENT_FIELD_ID, value: a.utm_content },
    { id: process.env.GHL_UTM_TERM_FIELD_ID, value: a.utm_term },
    { id: process.env.GHL_UTM_ID_FIELD_ID, value: a.utm_id },
    { id: process.env.GHL_FBCLID_FIELD_ID, value: a.fbclid },
    { id: process.env.GHL_GCLID_FIELD_ID, value: a.gclid },
    { id: process.env.GHL_TTCLID_FIELD_ID, value: a.ttclid },
    { id: process.env.GHL_FBC_FIELD_ID, value: a.fbc },
    { id: process.env.GHL_FBP_FIELD_ID, value: a.fbp },
    { id: process.env.GHL_LANDING_URL_FIELD_ID, value: a.landing_url },
    { id: process.env.GHL_REFERRER_FIELD_ID, value: a.referrer },
    { id: process.env.GHL_FIRST_TOUCH_SOURCE_FIELD_ID, value: a.first_utm_source },
    { id: process.env.GHL_FIRST_TOUCH_CAMPAIGN_FIELD_ID, value: a.first_utm_campaign },
    { id: process.env.GHL_FIRST_TOUCH_AT_FIELD_ID, value: a.first_captured_at },
    { id: process.env.GHL_CAPTURED_AT_FIELD_ID, value: a.captured_at },
    { id: process.env.GHL_META_EVENT_ID_FIELD_ID, value: input.eventId },
    { id: process.env.GHL_CLIENT_CATEGORY_FIELD_ID, value: input.clientCategory },
  ];

  return specs
    .filter((spec): spec is { id: string; value: string } =>
      Boolean(spec.id && spec.id.trim() && spec.value && String(spec.value).trim())
    )
    .map((spec) => ({ id: spec.id.trim(), field_value: String(spec.value).slice(0, 1_000) }));
}

/* -------------------------------------------------------------------------- *
 * Native attribution object
 * -------------------------------------------------------------------------- */

function buildAttributionSource(input: GhlContactInput): Record<string, string> {
  const a = input.attribution;

  const raw: Record<string, string | undefined> = {
    url: input.sourceUrl || a.landing_url,
    campaign: a.utm_campaign,
    campaignId: a.utm_id,
    utmSource: a.utm_source,
    utmMedium: a.utm_medium,
    utmContent: a.utm_content,
    utmKeyword: a.utm_term,
    referrer: a.referrer,
    fbclid: a.fbclid,
    gclid: a.gclid,
    msclkid: a.msclkid,
    fbc: a.fbc,
    fbp: a.fbp,
    fbEventId: input.eventId,
    userAgent: input.userAgent,
    ip: input.clientIp && input.clientIp !== "0.0.0.0" ? input.clientIp : undefined,
    medium: a.utm_medium || (a.fbclid ? "paid_social" : undefined),
    sessionSource: a.utm_source || (a.fbclid ? "Facebook" : undefined),
  };

  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (value && String(value).trim()) out[key] = String(value).slice(0, 1_000);
  }
  return out;
}

/* -------------------------------------------------------------------------- *
 * Lookup (so we merge tags instead of clobbering them)
 * -------------------------------------------------------------------------- */

async function findExistingContact(email: string, phoneE164: string): Promise<{ id?: string; tags: string[] }> {
  const params = new URLSearchParams({ locationId: LOCATION_ID, email });
  if (phoneE164) params.set("number", phoneE164);

  try {
    const res = await fetchWithRetry(
      `${GHL_BASE}/contacts/search/duplicate?${params.toString()}`,
      { method: "GET", headers: headers() },
      { label: "ghl:lookup", attempts: 2, timeoutMs: 6_000 }
    );

    if (!res.ok) {
      // 404 just means "no duplicate" — not an error worth logging loudly.
      if (res.status !== 404) {
        console.warn(`[ghl] duplicate lookup HTTP ${res.status}: ${await safeText(res, 300)}`);
      } else {
        await res.text().catch(() => undefined);
      }
      return { tags: [] };
    }

    const data = await safeJson<{ contact?: { id?: string; tags?: unknown } }>(res);
    const contact = data?.contact;
    const tags = Array.isArray(contact?.tags)
      ? (contact!.tags as unknown[]).filter((t): t is string => typeof t === "string")
      : [];

    return { id: contact?.id, tags };
  } catch (err) {
    console.warn(`[ghl] duplicate lookup failed: ${describeError(err)}`);
    return { tags: [] };
  }
}

/* -------------------------------------------------------------------------- *
 * Upsert
 * -------------------------------------------------------------------------- */

/**
 * Creates or updates the contact. Never throws — the caller decides what a
 * failure means for the HTTP response.
 */
export async function upsertGhlContact(input: GhlContactInput): Promise<GhlResult> {
  if (!isGhlConfigured()) {
    console.error("[ghl] GHL_API_KEY / GHL_LOCATION_ID missing — contact NOT created");
    return { ok: false, skipped: true, error: "missing_credentials" };
  }

  const existing = await findExistingContact(input.email, input.phone.e164);

  const tags = Array.from(
    new Set(
      [
        ...existing.tags,
        PIPELINE_TAG,
        input.clientCategory,
        ...(input.extraTags ?? []),
        input.attribution.utm_source ? `src:${input.attribution.utm_source}` : undefined,
        input.attribution.utm_campaign ? `camp:${input.attribution.utm_campaign}` : undefined,
      ]
        .filter((tag): tag is string => typeof tag === "string" && tag.trim().length > 0)
        .map((tag) => tag.trim().slice(0, 100))
    )
  );

  const basePayload: Record<string, unknown> = {
    locationId: LOCATION_ID,
    name: input.fullName,
    firstName: input.firstName,
    ...(input.lastName ? { lastName: input.lastName } : {}),
    email: input.email,
    phone: input.phone.e164,
    source: SOURCE_LABEL,
    tags,
    customFields: buildCustomFields(input),
  };

  const attributionSource = buildAttributionSource(input);
  const fullPayload =
    Object.keys(attributionSource).length > 0
      ? { ...basePayload, attributionSource }
      : basePayload;

  // First attempt with the native attribution object; if this GHL account
  // rejects that shape we retry once without it so the contact still lands.
  let result = await postUpsert(fullPayload);

  if (!result.ok && result.status && result.status >= 400 && result.status < 500 && "attributionSource" in fullPayload) {
    console.warn("[ghl] upsert rejected with attributionSource; retrying without it");
    result = await postUpsert(basePayload);
  }

  if (!result.ok) {
    console.error(`[ghl] upsert failed (${result.status ?? "network"}): ${result.body}`);
    return { ok: false, error: result.error ?? `http_${result.status}` };
  }

  return { ok: true, contactId: result.contactId, isNew: result.isNew };
}

/* -------------------------------------------------------------------------- *
 * Read-back: recover attribution from a contact record
 *
 * Used by /api/conversion when the GHL webhook payload didn't carry fbc/fbp
 * (missing merge field, renamed custom field, default payload shape…).
 * Without this an offline conversion would silently lose its ad attribution.
 * -------------------------------------------------------------------------- */

export interface GhlContactSnapshot {
  ok: boolean;
  contactId?: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  attribution: Attribution;
  error?: string;
}

/** Reverse of buildCustomFields: env field ID -> Attribution key. */
const FIELD_ID_TO_ATTR: [string | undefined, keyof Attribution][] = [
  [process.env.GHL_UTM_SOURCE_FIELD_ID, "utm_source"],
  [process.env.GHL_UTM_MEDIUM_FIELD_ID, "utm_medium"],
  [process.env.GHL_UTM_CAMPAIGN_FIELD_ID, "utm_campaign"],
  [process.env.GHL_UTM_CONTENT_FIELD_ID, "utm_content"],
  [process.env.GHL_UTM_TERM_FIELD_ID, "utm_term"],
  [process.env.GHL_UTM_ID_FIELD_ID, "utm_id"],
  [process.env.GHL_FBCLID_FIELD_ID, "fbclid"],
  [process.env.GHL_GCLID_FIELD_ID, "gclid"],
  [process.env.GHL_TTCLID_FIELD_ID, "ttclid"],
  [process.env.GHL_FBC_FIELD_ID, "fbc"],
  [process.env.GHL_FBP_FIELD_ID, "fbp"],
  [process.env.GHL_LANDING_URL_FIELD_ID, "landing_url"],
  [process.env.GHL_REFERRER_FIELD_ID, "referrer"],
  [process.env.GHL_FIRST_TOUCH_SOURCE_FIELD_ID, "first_utm_source"],
  [process.env.GHL_FIRST_TOUCH_CAMPAIGN_FIELD_ID, "first_utm_campaign"],
  [process.env.GHL_CAPTURED_AT_FIELD_ID, "captured_at"],
];

export async function getGhlContactSnapshot(contactId: string): Promise<GhlContactSnapshot> {
  if (!isGhlConfigured()) return { ok: false, attribution: {}, error: "missing_credentials" };
  if (!/^[A-Za-z0-9_-]{3,64}$/.test(contactId)) {
    return { ok: false, attribution: {}, error: "bad_contact_id" };
  }

  try {
    const res = await fetchWithRetry(
      `${GHL_BASE}/contacts/${encodeURIComponent(contactId)}`,
      { method: "GET", headers: headers() },
      { label: "ghl:get-contact", attempts: 2, timeoutMs: 8_000 }
    );

    if (!res.ok) {
      const body = await safeText(res, 300);
      console.warn(`[ghl] get contact ${contactId} -> HTTP ${res.status}: ${body}`);
      return { ok: false, attribution: {}, error: `http_${res.status}` };
    }

    const data = await safeJson<{
      contact?: {
        id?: string;
        email?: string;
        phone?: string;
        firstName?: string;
        lastName?: string;
        customFields?: { id?: string; value?: unknown; field_value?: unknown }[];
      };
    }>(res);

    const contact = data?.contact;
    if (!contact) return { ok: false, attribution: {}, error: "not_found" };

    const byId = new Map<string, string>();
    for (const field of contact.customFields ?? []) {
      const id = typeof field?.id === "string" ? field.id : undefined;
      const raw = field?.value ?? field?.field_value;
      if (id && (typeof raw === "string" || typeof raw === "number")) {
        byId.set(id, String(raw));
      }
    }

    const attribution: Record<string, string> = {};
    for (const [fieldId, attrKey] of FIELD_ID_TO_ATTR) {
      if (!fieldId) continue;
      const value = byId.get(fieldId.trim());
      if (value) attribution[attrKey] = value;
    }

    return {
      ok: true,
      contactId: contact.id,
      email: contact.email,
      phone: contact.phone,
      firstName: contact.firstName,
      lastName: contact.lastName,
      attribution: normalizeAttribution(attribution),
    };
  } catch (err) {
    console.warn(`[ghl] get contact failed: ${describeError(err)}`);
    return { ok: false, attribution: {}, error: describeError(err) };
  }
}

interface UpsertAttempt {
  ok: boolean;
  status?: number;
  body?: string;
  contactId?: string;
  isNew?: boolean;
  error?: string;
}

async function postUpsert(payload: Record<string, unknown>): Promise<UpsertAttempt> {
  try {
    const res = await fetchWithRetry(
      `${GHL_BASE}/contacts/upsert`,
      { method: "POST", headers: headers(), body: JSON.stringify(payload) },
      { label: "ghl:upsert", attempts: 3, timeoutMs: 10_000 }
    );

    if (!res.ok) {
      return { ok: false, status: res.status, body: await safeText(res, 600) };
    }

    const data = await safeJson<{
      contact?: { id?: string };
      new?: boolean;
      traceId?: string;
    }>(res);

    return { ok: true, status: res.status, contactId: data?.contact?.id, isNew: data?.new };
  } catch (err) {
    return { ok: false, error: describeError(err), body: describeError(err) };
  }
}
