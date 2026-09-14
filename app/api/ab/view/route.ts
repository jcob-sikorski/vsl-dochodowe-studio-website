/* -------------------------------------------------------------------------- *
 * src/app/api/ab/view/route.ts
 *
 * One row per browser per experiment: the denominator of the opt-in rate.
 *
 * The body carries attribution only. Experiment, variant and visitor id are
 * read from the cookies middleware set, never from the payload — otherwise
 * anyone could stuff views into whichever variant they wanted and the test
 * would be decided by whoever opened devtools.
 *
 * Best-effort throughout: a Supabase outage costs reporting, never a visitor.
 * -------------------------------------------------------------------------- */

import { NextResponse } from "next/server";

import {
  AB_VARIANT_COOKIE,
  AB_VISITOR_COOKIE,
  HEADLINE_EXPERIMENT,
  isValidVisitorId,
  parseVariantCookie,
} from "@/lib/ab";
import { hasPaidClick, normalizeAttribution } from "@/lib/attribution";
import { recordAbView } from "@/lib/leads";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 8 * 1024;

export async function POST(request: Request) {
  const experiment = HEADLINE_EXPERIMENT;

  // Experiment switched off: assignment still happens, counting doesn't.
  if (!experiment.enabled) return noContent();

  const clientIp = getClientIp(request.headers);

  // Generous — a household or office behind one NAT is normal — but enough to
  // stop a loop hammering the table.
  const limit = checkRateLimit(`ab-view:${clientIp}`, { limit: 30, windowMs: 60_000 });
  if (!limit.allowed) return noContent();

  const cookieHeader = request.headers.get("cookie") ?? "";
  const variantId = parseVariantCookie(readCookie(cookieHeader, AB_VARIANT_COOKIE), experiment);
  const visitorId = readCookie(cookieHeader, AB_VISITOR_COOKIE);

  // No usable identity: nothing to de-duplicate on, so record nothing.
  if (!variantId || !isValidVisitorId(visitorId)) return noContent();

  let raw: unknown = {};
  try {
    const text = await request.text();
    if (text.length > MAX_BODY_BYTES) return noContent();
    raw = text ? JSON.parse(text) : {};
  } catch {
    raw = {};
  }

  const body = (raw ?? {}) as Record<string, unknown>;
  const attribution = {
    ...normalizeAttribution(body.attribution),
  };

  // Same safety net as /api/register: read the Meta cookies here too, so a
  // blocked client-side read doesn't misclassify a paid visit as organic.
  attribution.fbp = attribution.fbp || readCookie(cookieHeader, "_fbp");
  attribution.fbc = attribution.fbc || readCookie(cookieHeader, "_fbc");

  const result = await recordAbView({
    experimentId: experiment.id,
    variantId,
    visitorId,
    attribution,
    trafficType: hasPaidClick(attribution) ? "paid" : "organic",
    userAgent: (request.headers.get("user-agent") ?? "").slice(0, 400),
  });

  if (!result.ok && !result.skipped) {
    console.error(`[ab] view write failed: ${result.error ?? "unknown"}`);
  }

  return noContent();
}

export async function GET() {
  return NextResponse.json(
    { success: false, message: "Method not allowed." },
    { status: 405, headers: { Allow: "POST" } }
  );
}

/* -------------------------------------------------------------------------- */

/**
 * Always 204, whatever happened. The browser has nothing useful to do with a
 * failure here, and an error status would only show up as noise in the console
 * of a page that is working perfectly.
 */
function noContent() {
  return new NextResponse(null, {
    status: 204,
    headers: { "Cache-Control": "no-store" },
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
