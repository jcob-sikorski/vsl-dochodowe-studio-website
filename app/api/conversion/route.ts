/* -------------------------------------------------------------------------- *
 * src/app/api/conversion/route.ts
 *
 * Offline conversions. A GoHighLevel workflow webhooks in here when a lead
 * books a call or the deal closes, and we fire the matching Meta event using
 * the fbc / fbp / fbclid that were stored on the contact at opt-in time.
 *
 * This is the payoff for saving attribution in GHL: by the time a deal closes,
 * the browser cookies are long gone, so without those stored values Meta can
 * never connect the sale back to the ad that produced it.
 *
 * Auth: shared secret, required. See CONVERSION_WEBHOOK_SECRET in .env.example.
 *
 * Retries are safe: the event_id is derived deterministically from
 * (event, contact, reference), so GHL replaying a webhook can never
 * double-count a conversion.
 * -------------------------------------------------------------------------- */

import crypto from "crypto";

import { NextResponse } from "next/server";

import { normalizeAttribution, type Attribution } from "@/lib/attribution";
import { getGhlContactSnapshot } from "@/lib/ghl";
import { sendMetaEvent, type MetaActionSource, type MetaEventName } from "@/lib/meta-capi";
import { normalizePhone } from "@/lib/phone";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { sanitizeUrl } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 32 * 1024;
const SECRET = (process.env.CONVERSION_WEBHOOK_SECRET || "").trim();

/** Friendly aliases so the GHL workflow can send words your team recognises. */
const EVENT_ALIASES: Record<string, MetaEventName> = {
  schedule: "Schedule",
  booked: "Schedule",
  booking: "Schedule",
  appointment: "Schedule",
  showed: "Schedule",
  show: "Schedule",
  call_booked: "Schedule",
  umowione: "Schedule",

  purchase: "Purchase",
  won: "Purchase",
  closed: "Purchase",
  closed_won: "Purchase",
  sale: "Purchase",
  sold: "Purchase",
  sprzedaz: "Purchase",
};

const ACTION_SOURCES: MetaActionSource[] = [
  "website",
  "email",
  "phone_call",
  "chat",
  "physical_store",
  "system_generated",
  "business_messaging",
  "other",
];

export async function POST(request: Request) {
  const startedAt = Date.now();

  /* ---------- 0. the endpoint must be configured --------------------- */
  if (!SECRET || SECRET.length < 16) {
    console.error("[conversion] CONVERSION_WEBHOOK_SECRET missing or too short — endpoint disabled");
    return json({ ok: false, error: "not_configured" }, 503);
  }

  /* ---------- 1. auth ------------------------------------------------- */
  const url = new URL(request.url);
  const presented =
    request.headers.get("x-webhook-secret") ??
    bearer(request.headers.get("authorization")) ??
    url.searchParams.get("token") ??
    "";

  if (!timingSafeEqual(presented, SECRET)) {
    console.warn(`[conversion] rejected unauthenticated call from ${getClientIp(request.headers)}`);
    return json({ ok: false, error: "unauthorized" }, 401);
  }

  /* ---------- 2. rate limit ------------------------------------------- */
  const clientIp = getClientIp(request.headers);
  const limit = checkRateLimit(`conversion:${clientIp}`, { limit: 120, windowMs: 60_000 });
  if (!limit.allowed) {
    return json({ ok: false, error: "rate_limited" }, 429, {
      "Retry-After": String(limit.retryAfterSeconds),
    });
  }

  /* ---------- 3. body -------------------------------------------------- */
  let body: Record<string, unknown>;
  try {
    const text = await request.text();
    if (text.length > MAX_BODY_BYTES) return json({ ok: false, error: "payload_too_large" }, 413);
    const parsed = JSON.parse(text);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("not an object");
    body = parsed as Record<string, unknown>;
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400);
  }

  /* ---------- 4. which event? ------------------------------------------ */
  const rawEvent = str(body.event ?? body.eventName ?? body.type).toLowerCase().replace(/[\s-]+/g, "_");
  const eventName = EVENT_ALIASES[rawEvent];
  if (!eventName) {
    return json(
      { ok: false, error: "unknown_event", hint: `Use one of: ${Object.keys(EVENT_ALIASES).join(", ")}` },
      400
    );
  }

  /* ---------- 5. identity + attribution -------------------------------- */
  // GHL sends the contact fields under several possible spellings depending on
  // whether you use a custom payload or the default one.
  const contactId = str(body.contactId ?? body.contact_id ?? body.id);
  let email = str(body.email ?? body.contact_email).toLowerCase();
  let phoneRaw = str(body.phone ?? body.contact_phone);
  let firstName = str(body.firstName ?? body.first_name);
  let lastName = str(body.lastName ?? body.last_name);

  let attribution: Attribution = normalizeAttribution({
    fbc: str(body.fbc),
    fbp: str(body.fbp),
    fbclid: str(body.fbclid),
    utm_source: str(body.utm_source ?? body.utmSource),
    utm_medium: str(body.utm_medium ?? body.utmMedium),
    utm_campaign: str(body.utm_campaign ?? body.utmCampaign),
    utm_content: str(body.utm_content ?? body.utmContent),
    utm_term: str(body.utm_term ?? body.utmTerm),
    utm_id: str(body.utm_id ?? body.utmId),
    gclid: str(body.gclid),
    landing_url: str(body.landing_url ?? body.landingUrl),
    referrer: str(body.referrer),
    captured_at: str(body.captured_at ?? body.capturedAt),
  });

  // Fall back to the contact record whenever the webhook didn't carry the
  // click identifiers — this is what keeps attribution alive if someone edits
  // the workflow payload later.
  const needsLookup = !attribution.fbc && !attribution.fbp && !attribution.fbclid;
  if (contactId && (needsLookup || !email)) {
    const snapshot = await getGhlContactSnapshot(contactId);
    if (snapshot.ok) {
      attribution = normalizeAttribution({ ...snapshot.attribution, ...attribution });
      email = email || (snapshot.email ?? "").toLowerCase();
      phoneRaw = phoneRaw || (snapshot.phone ?? "");
      firstName = firstName || (snapshot.firstName ?? "");
      lastName = lastName || (snapshot.lastName ?? "");
    }
  }

  if (!email && !phoneRaw) {
    return json({ ok: false, error: "no_identifiers" }, 422);
  }

  const phone = normalizePhone(phoneRaw);

  /* ---------- 6. money -------------------------------------------------- */
  const value = num(body.value ?? body.amount ?? body.opportunityValue ?? body.monetaryValue);
  const currency = str(body.currency).toUpperCase() || undefined;

  /* ---------- 7. deterministic event id --------------------------------- */
  // Same conversion replayed by GHL -> same id -> Meta counts it once.
  const referenceId = str(
    body.referenceId ?? body.appointmentId ?? body.opportunityId ?? body.opportunity_id ?? ""
  );
  const providedEventId = str(body.eventId);
  const eventId = /^[A-Za-z0-9_-]{8,64}$/.test(providedEventId)
    ? providedEventId
    : deterministicEventId(eventName, contactId || email, referenceId);

  /* ---------- 8. send ---------------------------------------------------- */
  const actionSourceRaw = str(body.actionSource ?? body.action_source) as MetaActionSource;
  const actionSource = ACTION_SOURCES.includes(actionSourceRaw) ? actionSourceRaw : "system_generated";

  const result = await sendMetaEvent({
    eventName,
    eventId,
    actionSource,
    eventTime: num(body.eventTime ?? body.event_time) ?? parseIsoSeconds(str(body.occurredAt)),
    sourceUrl: sanitizeUrl(str(body.sourceUrl)) ?? attribution.landing_url,
    fbp: attribution.fbp,
    fbc: attribution.fbc,
    attribution,
    user: {
      email: email || undefined,
      phone: phone?.digits,
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      country: phone?.countryCode === "48" ? "pl" : undefined,
      externalId: email || contactId || undefined,
    },
    ...(value !== undefined ? { value, currency: currency || "PLN" } : {}),
    customData: {
      ...(str(body.contentName) ? { content_name: str(body.contentName) } : {}),
      ...(contactId ? { ghl_contact_id: contactId } : {}),
      ...(referenceId ? { ghl_reference_id: referenceId } : {}),
    },
  });

  const matchQuality = [
    email && "em",
    phone && "ph",
    attribution.fbc && "fbc",
    attribution.fbp && "fbp",
  ].filter(Boolean);

  if (!result.ok && !result.skipped) {
    // Non-2xx makes GHL retry — safe, because the event_id is deterministic.
    console.error(`[conversion] ${eventName} failed: ${result.error}`);
    return json({ ok: false, event: eventName, eventId, error: result.error }, 502);
  }

  console.info(
    `[conversion] ${eventName} ${result.ok ? "sent" : "skipped"} ` +
      `contact=${contactId || email} id=${eventId} match=[${matchQuality.join(",")}] ` +
      `${Date.now() - startedAt}ms`
  );

  return json({
    ok: true,
    event: eventName,
    eventId,
    delivered: result.ok,
    skipped: result.skipped ?? false,
    matchKeys: matchQuality,
  });
}

export async function GET() {
  return json({ ok: false, error: "method_not_allowed" }, 405, { Allow: "POST" });
}

/* -------------------------------------------------------------------------- *
 * Helpers
 * -------------------------------------------------------------------------- */

/**
 * GHL sends the literal "{{contact.fbc}}" when a merge field has no value, so
 * anything still containing braces is treated as empty.
 */
function str(value: unknown): string {
  if (typeof value === "number") return String(value);
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed.includes("{{") || trimmed.includes("}}")) return "";
  if (trimmed.toLowerCase() === "null" || trimmed.toLowerCase() === "undefined") return "";
  return trimmed;
}

function num(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return undefined;
  const cleaned = value.replace(/\s/g, "").replace(/,/g, ".").replace(/[^\d.-]/g, "");
  if (!cleaned) return undefined;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseIsoSeconds(value: string): number | undefined {
  if (!value) return undefined;
  const ms = Date.parse(value);
  return Number.isFinite(ms) ? Math.floor(ms / 1000) : undefined;
}

function bearer(header: string | null): string | undefined {
  if (!header) return undefined;
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  return match ? match[1].trim() : undefined;
}

function timingSafeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a ?? "", "utf8");
  const bufB = Buffer.from(b ?? "", "utf8");
  // Hash both sides so the comparison is constant-time regardless of length.
  const hashA = crypto.createHash("sha256").update(bufA).digest();
  const hashB = crypto.createHash("sha256").update(bufB).digest();
  return crypto.timingSafeEqual(hashA, hashB) && bufA.length === bufB.length;
}

function deterministicEventId(event: string, subject: string, reference: string): string {
  const digest = crypto
    .createHash("sha256")
    .update(`${event}|${subject.toLowerCase()}|${reference}`, "utf8")
    .digest("hex")
    .slice(0, 40);
  return `${event.toLowerCase()}_${digest}`;
}

function json(body: unknown, status = 200, extraHeaders: Record<string, string> = {}) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store", ...extraHeaders },
  });
}
