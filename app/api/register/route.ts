/* -------------------------------------------------------------------------- *
 * src/app/api/register/route.ts
 *
 * The single entry point for a form submission.
 *
 *   1. validate + normalise everything (never trust the client)
 *   2. rate-limit / honeypot
 *   3. upsert the contact in GoHighLevel with FULL attribution
 *   4. send exactly one "SubmitApplication" event to the Meta Conversions API
 *
 * No WebinarJam. No SMS. No email provider. Nothing else touches this path.
 * -------------------------------------------------------------------------- */

import { randomUUID } from "crypto";

import { NextResponse } from "next/server";

import {
  AB_VARIANT_COOKIE,
  AB_VISITOR_COOKIE,
  HEADLINE_EXPERIMENT,
  isValidVisitorId,
  parseVariantCookie,
} from "@/lib/ab";
import { upsertGhlContact } from "@/lib/ghl";
import { recordLeadOptIn } from "@/lib/leads";
import { sendSubmitApplication } from "@/lib/meta-capi";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { parseRegistrationInput } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Reject absurd bodies before parsing them. */
const MAX_BODY_BYTES = 16 * 1024;

export async function POST(request: Request) {
  const startedAt = Date.now();
  const clientIp = getClientIp(request.headers);
  const userAgent = request.headers.get("user-agent") ?? "";

  /* ---------- 1. body size guard ------------------------------------- */
  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    return json({ success: false, message: "Payload too large." }, 413);
  }

  /* ---------- 2. rate limit ------------------------------------------ */
  const limit = checkRateLimit(`register:${clientIp}`, { limit: 6, windowMs: 60_000 });
  if (!limit.allowed) {
    return json(
      { success: false, message: "Zbyt wiele prób. Spróbuj ponownie za chwilę." },
      429,
      { "Retry-After": String(limit.retryAfterSeconds) }
    );
  }

  /* ---------- 3. parse + validate ------------------------------------ */
  let raw: unknown;
  try {
    const text = await request.text();
    if (text.length > MAX_BODY_BYTES) {
      return json({ success: false, message: "Payload too large." }, 413);
    }
    raw = JSON.parse(text);
  } catch {
    return json({ success: false, message: "Nieprawidłowe dane formularza." }, 400);
  }

  const parsed = parseRegistrationInput(raw);
  if (!parsed.ok) {
    return json({ success: false, message: parsed.errors[0].message, errors: parsed.errors }, 422);
  }

  const input = parsed.value;

  /* ---------- 4. honeypot: look successful, do nothing ---------------- */
  if (input.isBot) {
    console.warn(`[register] honeypot triggered from ${clientIp}`);
    return json({ success: true, redirectTo: "/materialy?zgloszenie=1" }, 200);
  }

  /* ---------- 5. attribution enrichment ------------------------------ */
  // Cookies set by the Meta pixel are the highest-quality signal we have.
  // The client forwards them too, but reading them here is the safety net.
  const cookieHeader = request.headers.get("cookie") ?? "";

  // Which headline this person was shown. Read from the cookie middleware set,
  // never from the request body: the browser must not be able to choose which
  // variant its conversion is credited to.
  const abVariantId = parseVariantCookie(
    readCookie(cookieHeader, AB_VARIANT_COOKIE),
    HEADLINE_EXPERIMENT
  );
  const abVisitorIdRaw = readCookie(cookieHeader, AB_VISITOR_COOKIE);
  const abVisitorId = isValidVisitorId(abVisitorIdRaw) ? abVisitorIdRaw : undefined;

  const attribution = {
    ...input.attribution,
    fbp: input.attribution.fbp || readCookie(cookieHeader, "_fbp"),
    fbc: input.attribution.fbc || readCookie(cookieHeader, "_fbc"),
  };

  const sourceUrl =
    input.sourceUrl ||
    attribution.landing_url ||
    request.headers.get("referer") ||
    undefined;

  // The client normally supplies this so its pixel event can be deduplicated
  // against ours. If it didn't (or sent junk), we mint one and hand it back.
  const eventId = input.eventId || `sa_${randomUUID().replace(/-/g, "")}`;

  /* ---------- 6. GHL (source of truth) + Meta CAPI ------------------- */
  const [ghlOutcome, metaOutcome] = await Promise.allSettled([
    upsertGhlContact({
      fullName: input.fullName,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone,
      attribution,
      clientCategory: input.clientCategory,
      eventId,
      clientIp,
      userAgent,
      sourceUrl,
    }),
    sendSubmitApplication({
      eventId,
      sourceUrl,
      clientIp,
      clientUserAgent: userAgent,
      fbp: attribution.fbp,
      fbc: attribution.fbc,
      attribution,
      user: {
        email: input.email,
        phone: input.phone.digits,
        firstName: input.firstName,
        lastName: input.lastName,
        country: input.phone.countryCode === "48" ? "pl" : undefined,
      },
      customData: {
        content_name: process.env.NEXT_PUBLIC_OFFER_NAME || "Konsultacja",
        ...(input.clientCategory ? { content_category: input.clientCategory } : {}),
      },
    }),
  ]);

  const ghl =
    ghlOutcome.status === "fulfilled"
      ? ghlOutcome.value
      : { ok: false, error: String(ghlOutcome.reason) };

  const meta =
    metaOutcome.status === "fulfilled"
      ? metaOutcome.value
      : { ok: false, error: String(metaOutcome.reason) };

  const metaStatus = meta.ok ? "sent" : meta.skipped ? `skipped:${meta.error}` : "failed";

  // "no_paid_click" is the organic gate doing its job, not a problem.
  if (!meta.ok && !meta.skipped) {
    console.error(`[register] CAPI SubmitApplication not delivered: ${meta.error ?? "unknown"}`);
  }

  if (!ghl.ok) {
    console.error(`[register] GHL upsert failed: ${ghl.error ?? "unknown"}`);
    return json(
      { success: false, message: "Nie udało się zapisać zgłoszenia. Spróbuj ponownie." },
      502
    );
  }

  // The funnel ledger. Written after GHL so the lead row carries the contact id
  // that every later stage webhook will be keyed on. Best-effort: a Supabase
  // outage costs you a row in reporting, never the lead itself.
  const ledger = await recordLeadOptIn({
    ghlContactId: ghl.contactId,
    email: input.email,
    phone: input.phone.e164,
    fullName: input.fullName,
    attribution,
    metaEventId: eventId,
    abExperimentId: abVariantId ? HEADLINE_EXPERIMENT.id : undefined,
    abVariantId: abVariantId ?? undefined,
    abVisitorId,
  });

  if (!ledger.ok && !ledger.skipped) {
    console.error(`[register] lead ledger write failed: ${ledger.error ?? "unknown"}`);
  }

  console.info(
    `[register] ok contact=${ghl.contactId ?? "?"} capi=${metaStatus} ` +
      `lead=${ledger.ok ? "logged" : ledger.skipped ? "off" : "failed"} ` +
      `received=${meta.eventsReceived ?? "?"} trace=${meta.fbTraceId ?? "-"} ` +
      `test=${process.env.META_CAPI_TEST_EVENT_CODE?.trim() || "LIVE"} ` +
      `ab=${abVariantId ?? "-"} ` +
      `src=${attribution.utm_source ?? "direct"} ${Date.now() - startedAt}ms`
  );

  return json({
    success: true,
    contactId: ghl.contactId,
    /** The browser fires its pixel event with this exact ID for deduplication. */
    eventId,
    capiDelivered: meta.ok,
    redirectTo: "/materialy?zgloszenie=1",
  });
}

/* ---------- anything other than POST ---------------------------------- */

export async function GET() {
  return json({ success: false, message: "Method not allowed." }, 405, { Allow: "POST" });
}

/* -------------------------------------------------------------------------- */

function json(body: unknown, status = 200, extraHeaders: Record<string, string> = {}) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
      ...extraHeaders,
    },
  });
}

function readCookie(cookieHeader: string, name: string): string | undefined {
  if (!cookieHeader) return undefined;
  for (const part of cookieHeader.split(";")) {
    const index = part.indexOf("=");
    if (index === -1) continue;
    if (part.slice(0, index).trim() !== name) continue;
    const value = part.slice(index + 1).trim();
    if (!value) return undefined;
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  }
  return undefined;
}
