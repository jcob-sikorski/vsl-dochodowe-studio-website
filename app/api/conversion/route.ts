/* -------------------------------------------------------------------------- *
 * src/app/api/conversion/route.ts
 *
 * The funnel's write endpoint. A GoHighLevel workflow calls it every time a
 * lead changes stage, and it does two separate jobs:
 *
 *   1. ALWAYS stamps the stage on the lead row in Supabase. That ledger is what
 *      makes show rate, cost per qualified lead and cost per purchase
 *      computable — Meta knows spend but not your pipeline.
 *
 *   2. SOMETIMES reports a conversion to Meta. Only `qualified`, `booked` and
 *      `won` map to a Meta event; `showed`, `no_show`, `lost` and
 *      `disqualified` are recorded locally and stay out of the pixel. Sending
 *      Meta a signal for every pipeline nudge would just add noise to
 *      optimisation.
 *
 * Auth: shared secret, required. See CONVERSION_WEBHOOK_SECRET in .env.example.
 *
 * Retries are safe. The Meta event_id is derived deterministically from
 * (event, contact, reference), and the Supabase stage write uses coalesce() so
 * the FIRST time a lead reaches a stage is the time that sticks.
 * -------------------------------------------------------------------------- */

import crypto from "crypto";

import { NextResponse } from "next/server";

import { normalizeAttribution, type Attribution } from "@/lib/attribution";
import { getGhlContactSnapshot } from "@/lib/ghl";
import { pingSupabase, recordLeadStage, type LeadStage } from "@/lib/leads";
import { sendMetaEvent, type MetaActionSource, type MetaEventName } from "@/lib/meta-capi";
import { normalizePhone } from "@/lib/phone";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { sanitizeUrl } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 32 * 1024;
const SECRET = (process.env.CONVERSION_WEBHOOK_SECRET || "").trim();

/**
 * What your team types in the GHL workflow -> the canonical funnel stage.
 * Polish and English spellings both accepted, because whoever builds the
 * workflow shouldn't have to remember which.
 */
const STAGE_ALIASES: Record<string, LeadStage> = {
  // for_qualification — handed to the setter, not yet vetted
  for_qualification: "for_qualification",
  forqualification: "for_qualification",
  to_qualify: "for_qualification",
  do_kwalifikacji: "for_qualification",

  // qualified — the setter has vetted the lead but nothing is booked yet
  qualified: "qualified",
  qualify: "qualified",
  kwalifikacja: "qualified",
  zakwalifikowany: "qualified",

  // booked — a call is in the calendar
  booked: "booked",
  booking: "booked",
  book: "booked",
  schedule: "booked",
  scheduled: "booked",
  appointment: "booked",
  call_booked: "booked",
  booked_call: "booked",
  umowione: "booked",

  // rescheduled — the call moved; still booked, not a no-show, not a show
  rescheduled: "rescheduled",
  reschedule: "rescheduled",
  rebooked: "rescheduled",
  przeniesione: "rescheduled",
  przelozone: "rescheduled",

  // showed — they turned up
  showed: "showed",
  show: "showed",
  showed_up: "showed",
  attended: "showed",
  odbyte: "showed",

  // no_show — they didn't
  no_show: "no_show",
  noshow: "no_show",
  did_not_show: "no_show",
  nieobecny: "no_show",

  // proposal_sent — offer on the table; proves the call was held
  proposal_sent: "proposal_sent",
  proposal: "proposal_sent",
  offer: "proposal_sent",
  offer_sent: "proposal_sent",
  oferta: "proposal_sent",
  oferta_wyslana: "proposal_sent",

  // won — money
  won: "won",
  purchase: "won",
  closed_won: "won",
  sale: "won",
  sold: "won",
  closed: "won",
  sprzedaz: "won",

  // lost / disqualified
  lost: "lost",
  closed_lost: "lost",
  przegrane: "lost",
  disqualified: "disqualified",
  dq: "disqualified",
  unqualified: "disqualified",
  odrzucony: "disqualified",
};

/**
 * Only these three stages are worth a Meta conversion. Everything else is
 * pipeline bookkeeping and stays local.
 *
 * Every stage here MUST map to a distinct event name. The event_id is derived
 * from (event, contact, reference), so two stages sharing a name would produce
 * an identical id for the same opportunity and Meta would discard the second as
 * a duplicate. That is why `qualified` sends its own custom "Qualified" rather
 * than reusing "Lead", and why `showed` deliberately maps to nothing — it used
 * to send `Lead` and collided with `booked`, silently vanishing. Show rate
 * lives in Supabase.
 */
/**
 * `showed` is never sent by a closer. Calls are rebuilt from the stage history
 * in lead_calls(): Booked Call → Lost / Proposal Sent / Won is a held call,
 * Booked Call → No Show a missed one. The alias exists so an explicit `showed`
 * webhook still works if you ever add one.
 */
const META_EVENT_FOR_STAGE: Partial<Record<LeadStage, MetaEventName>> = {
  qualified: "Qualified",
  booked: "Lead",
  won: "Purchase",
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

  /* ---------- 4. flatten GHL's envelope --------------------------------- */
  // A GHL "Webhook" action posts its standard contact payload at the top level
  // and puts the Custom Data key/value pairs inside a nested `customData`
  // object. Merge the two, with the pairs you configured winning, so the same
  // endpoint accepts a GHL webhook, a flat JSON body, or curl.
  const src = flatten(body);

  /* ---------- 5. which stage? ------------------------------------------ */
  const rawEvent = str(src.event ?? src.stage ?? src.eventName ?? src.type)
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
  const stage = STAGE_ALIASES[rawEvent];
  if (!stage) {
    console.warn(
      `[conversion] unknown stage ${JSON.stringify(rawEvent)}; top-level keys: ${Object.keys(body).join(", ")}`
    );
    return json(
      {
        ok: false,
        error: "unknown_event",
        received: rawEvent || null,
        hint: `Use one of: ${Object.keys(STAGE_ALIASES).join(", ")}`,
      },
      400
    );
  }

  /* ---------- 6. identity + attribution -------------------------------- */
  const contactId = str(src.contactId ?? src.contact_id ?? src.id);
  let email = str(src.email ?? src.contact_email).toLowerCase();
  let phoneRaw = str(src.phone ?? src.contact_phone);
  let firstName = str(src.firstName ?? src.first_name);
  let lastName = str(src.lastName ?? src.last_name);

  let attribution: Attribution = normalizeAttribution({
    fbc: str(src.fbc),
    fbp: str(src.fbp),
    fbclid: str(src.fbclid),
    ad_id: str(src.ad_id ?? src.adId),
    adset_id: str(src.adset_id ?? src.adsetId),
    campaign_id: str(src.campaign_id ?? src.campaignId),
    utm_source: str(src.utm_source ?? src.utmSource),
    utm_medium: str(src.utm_medium ?? src.utmMedium),
    utm_campaign: str(src.utm_campaign ?? src.utmCampaign),
    utm_content: str(src.utm_content ?? src.utmContent),
    utm_term: str(src.utm_term ?? src.utmTerm),
    utm_id: str(src.utm_id ?? src.utmId),
    gclid: str(src.gclid),
    landing_url: str(src.landing_url ?? src.landingUrl),
    referrer: str(src.referrer),
    captured_at: str(src.captured_at ?? src.capturedAt),
  });

  const metaEventName = resolveMetaEvent(stage, str(src.metaEvent ?? src.meta_event));

  // Look the contact up when we'll need click identifiers we weren't given, or
  // when we have no email to match the lead row on.
  // Only the paid-click identifiers count. fbp is written for every visitor,
  // organic included, so it must never suppress the lookup whose whole job is
  // recovering the identifiers that DO establish attribution.
  const needsClickIds = Boolean(metaEventName) && !attribution.fbc && !attribution.fbclid;

  if (contactId && (needsClickIds || !email)) {
    const snapshot = await getGhlContactSnapshot(contactId);
    if (snapshot.ok) {
      attribution = normalizeAttribution({ ...snapshot.attribution, ...attribution });
      email = email || (snapshot.email ?? "").toLowerCase();
      phoneRaw = phoneRaw || (snapshot.phone ?? "");
      firstName = firstName || (snapshot.firstName ?? "");
      lastName = lastName || (snapshot.lastName ?? "");
    }
  }

  if (!contactId && !email) {
    return json({ ok: false, error: "no_identifiers" }, 422);
  }

  const phone = normalizePhone(phoneRaw);
  const value = num(src.value ?? src.amount ?? src.opportunityValue ?? src.monetaryValue);
  const currency = str(src.currency).toUpperCase() || undefined;
  const occurredAt = parseDate(str(src.occurredAt ?? src.occurred_at));

  /* ---------- 7. record the stage (always) ------------------------------ */
  const ledger = await recordLeadStage({
    ghlContactId: contactId || undefined,
    email: email || undefined,
    stage,
    at: occurredAt,
    revenue: stage === "won" ? value : undefined,
    currency,
  });

  /* ---------- 8. report to Meta (only booked / won) --------------------- */
  const referenceId = str(
    src.referenceId ?? src.appointmentId ?? src.opportunityId ?? src.opportunity_id ?? ""
  );

  let metaResult: Awaited<ReturnType<typeof sendMetaEvent>> | null = null;
  let eventId: string | null = null;

  // The pipeline loops: a lead can go Booked Call → For Qualification → Booked
  // Call again. Meta gets Qualified / Lead / Purchase for the FIRST time only;
  // a repeat would count as a second conversion once Meta's 48-hour dedup
  // window has passed. An explicit `metaEvent` in the payload still forces it.
  const repeatStage = ledger.ok && ledger.firstTime === false;
  const forced = Boolean(str(src.metaEvent ?? src.meta_event));
  const skipRepeat = Boolean(metaEventName) && repeatStage && !forced;

  if (metaEventName && !skipRepeat) {
    const providedEventId = str(src.eventId);
    eventId = /^[A-Za-z0-9_-]{8,64}$/.test(providedEventId)
      ? providedEventId
      : deterministicEventId(metaEventName, contactId || email, referenceId);

    if (!email && !phoneRaw) {
      console.warn(`[conversion] ${stage} recorded but Meta skipped — no email or phone to match on`);
    } else {
      const actionSourceRaw = str(src.actionSource ?? src.action_source) as MetaActionSource;
      const actionSource = ACTION_SOURCES.includes(actionSourceRaw) ? actionSourceRaw : "website";

      metaResult = await sendMetaEvent({
        eventName: metaEventName,
        eventId,
        actionSource,
        eventTime: occurredAt ? Math.floor(occurredAt.getTime() / 1000) : undefined,
        sourceUrl: sanitizeUrl(str(src.sourceUrl)) ?? attribution.landing_url,
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
          ...(str(src.contentName) ? { content_name: str(src.contentName) } : {}),
          ...(contactId ? { ghl_contact_id: contactId } : {}),
          ...(referenceId ? { ghl_reference_id: referenceId } : {}),
        },
      });
    }
  }

  const matchKeys = [
    email && "em",
    phone && "ph",
    attribution.fbc && "fbc",
    attribution.fbp && "fbp",
  ].filter(Boolean);

  const metaStatus = !metaEventName
    ? "n/a"
    : skipRepeat
      ? "skipped:repeat_stage"
      : !metaResult
      ? "skipped:no_identifiers"
      : metaResult.ok
        ? "sent"
        : metaResult.skipped
          ? `skipped:${metaResult.error}`
          : `failed:${metaResult.error}`;

  console.info(
    `[conversion] stage=${stage} ledger=${ledger.ok ? "ok" : `failed:${ledger.error}`} ` +
      `meta=${metaEventName ?? "-"}:${metaStatus} contact=${contactId || email} ` +
      `match=[${matchKeys.join(",")}] received=${metaResult?.eventsReceived ?? "-"} ` +
      `trace=${metaResult?.fbTraceId ?? "-"} ` +
      `test=${process.env.META_CAPI_TEST_EVENT_CODE?.trim() || "LIVE"} ` +
      `${Date.now() - startedAt}ms`
  );

  // A Meta transport failure returns 502 so GHL retries — the deterministic
  // event_id and the coalesce() stage write make the retry harmless. A ledger
  // failure does the same: losing a stage silently would corrupt every rate.
  if (metaResult && !metaResult.ok && !metaResult.skipped) {
    return json({ ok: false, stage, error: metaResult.error, eventId }, 502);
  }
  if (!ledger.ok && !ledger.skipped) {
    return json({ ok: false, stage, error: `ledger:${ledger.error}` }, 502);
  }

  return json({
    ok: true,
    stage,
    leadId: ledger.leadId,
    metaEvent: metaEventName ?? null,
    metaStatus,
    eventId,
    matchKeys,
    eventsReceived: metaResult?.eventsReceived,
    fbTraceId: metaResult?.fbTraceId,
    testEventCode: process.env.META_CAPI_TEST_EVENT_CODE?.trim() || null,
  });
}

/**
 * Authenticated health check — open in a browser after deploying to confirm the
 * environment variables actually made it into the build:
 *
 *   https://yourdomain.com/api/conversion?token=<CONVERSION_WEBHOOK_SECRET>
 */
export async function GET(request: Request) {
  if (!SECRET || SECRET.length < 16) {
    return json({ ok: false, error: "not_configured" }, 503);
  }

  const token =
    new URL(request.url).searchParams.get("token") ??
    request.headers.get("x-webhook-secret") ??
    bearer(request.headers.get("authorization")) ??
    "";

  if (!timingSafeEqual(token, SECRET)) {
    return json({ ok: false, error: "method_not_allowed" }, 405, { Allow: "POST" });
  }

  // A real round trip, not just "is the env var set". This is the one call that
  // distinguishes "misconfigured" from "configured but unreachable right now",
  // and it reports the underlying network reason when it fails.
  const supabase = await pingSupabase();

  return json({
    ok: true,
    endpoint: "conversion",
    secretConfigured: true,
    supabaseReachable: supabase.ok,
    supabaseError: supabase.ok ? null : (supabase.error ?? "unknown"),
    supabasePingMs: supabase.ms,
    metaConfigured: Boolean(
      (process.env.NEXT_PUBLIC_META_PIXEL_ID || process.env.META_PIXEL_ID) &&
        process.env.META_CAPI_ACCESS_TOKEN
    ),
    ghlConfigured: Boolean(process.env.GHL_API_KEY && process.env.GHL_LOCATION_ID),
    supabaseConfigured: Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
        (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)
    ),
    // A value here means every event is going to Test Events and counts for nothing.
    testEventCode: process.env.META_CAPI_TEST_EVENT_CODE?.trim() || null,
    stages: Object.keys(STAGE_ALIASES),
    stagesReportedToMeta: META_EVENT_FOR_STAGE,
  });
}

/* -------------------------------------------------------------------------- *
 * Helpers
 * -------------------------------------------------------------------------- */

/** `metaEvent: "none"` suppresses; an explicit allowed name overrides the map. */
function resolveMetaEvent(stage: LeadStage, override: string): MetaEventName | null {
  const normalized = override.trim().toLowerCase();
  if (normalized === "none" || normalized === "off" || normalized === "false") return null;
  if (normalized === "qualified") return "Qualified";
  if (normalized === "lead") return "Lead";
  if (normalized === "purchase") return "Purchase";
  return META_EVENT_FOR_STAGE[stage] ?? null;
}

/**
 * Merges a nested envelope into the top level. GHL puts Custom Data under
 * `customData`; other senders use `custom_data` or `data`. Nested keys win,
 * because they are the ones you explicitly configured.
 */
function flatten(body: Record<string, unknown>): Record<string, unknown> {
  let merged: Record<string, unknown> = { ...body };

  for (const key of ["customData", "custom_data", "data"]) {
    const nested = body[key];
    if (nested && typeof nested === "object" && !Array.isArray(nested)) {
      merged = { ...merged, ...(nested as Record<string, unknown>) };
    }
  }

  return merged;
}

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

/**
 * Parses a money value out of whatever GHL sends, in either convention:
 * "4997", "4 997,00", "4997.50", "1,234.56", "4.997,50", "PLN 4 997".
 *
 * The rule: when BOTH separators appear, the rightmost one is the decimal point
 * and the other is thousands grouping. When only one appears, it is grouping
 * only if it repeats ("1.234.567") or if it sits exactly three digits from the
 * end behind a 1–3 digit head ("1,500") — which is what real grouping looks
 * like. Anything else is a decimal separator, so "4997.500" stays 4997.5.
 *
 * Getting this wrong is expensive and silent: an unparsed value means a
 * Purchase reaches Meta with no value/currency (no ROAS, no value optimisation)
 * and a null revenue in the ledger.
 */
function num(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return undefined;

  // Drop currency symbols, ISO codes and any kind of space (incl. NBSP/thin).
  let cleaned = value.replace(/[^\d.,-]/g, "");
  if (!cleaned) return undefined;

  const negative = cleaned.startsWith("-");
  cleaned = cleaned.replace(/-/g, "");
  if (!cleaned) return undefined;

  const lastDot = cleaned.lastIndexOf(".");
  const lastComma = cleaned.lastIndexOf(",");

  if (lastDot !== -1 && lastComma !== -1) {
    // Both present: rightmost wins as the decimal separator.
    const decimalAt = Math.max(lastDot, lastComma);
    const groupChar = decimalAt === lastDot ? "," : ".";
    cleaned =
      cleaned.slice(0, decimalAt).split(groupChar).join("") + "." + cleaned.slice(decimalAt + 1);
  } else if (lastDot !== -1 || lastComma !== -1) {
    const sep = lastDot !== -1 ? "." : ",";
    const sepAt = lastDot !== -1 ? lastDot : lastComma;
    const decimals = cleaned.length - sepAt - 1;
    const occurrences = cleaned.split(sep).length - 1;
    const head = cleaned.slice(0, sepAt);
    const grouped = occurrences > 1 || (decimals === 3 && head.length >= 1 && head.length <= 3);

    cleaned = grouped
      ? cleaned.split(sep).join("")
      : `${head}.${cleaned.slice(sepAt + 1)}`;
  }

  if (!/^\d*\.?\d*$/.test(cleaned) || cleaned === "." || cleaned === "") return undefined;

  const parsed = Number(cleaned);
  if (!Number.isFinite(parsed)) return undefined;
  return negative ? -parsed : parsed;
}

function parseDate(value: string): Date | undefined {
  if (!value) return undefined;
  const ms = Date.parse(value);
  return Number.isFinite(ms) ? new Date(ms) : undefined;
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
