/* -------------------------------------------------------------------------- *
 * app/api/track/route.ts
 *
 * Receives batched engagement events from lib/track.ts (sendBeacon or
 * keepalive fetch) and writes them to Supabase `page_events`.
 *
 * Same rules as /api/ab/view: experiment and visitor come from the cookies
 * middleware set, never from the payload, and only for the RUNNING test.
 * Event names are checked against a fixed vocabulary so nobody can fill the
 * table with junk. Best-effort: always 204.
 * -------------------------------------------------------------------------- */

import { NextResponse } from "next/server";

import {
  AB_VARIANT_COOKIE,
  AB_VISITOR_COOKIE,
  HEADLINE_EXPERIMENT,
  isValidVisitorId,
  parseVariantCookie,
} from "@/lib/ab";
import { recordPageEvents } from "@/lib/leads";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 8 * 1024;
const MAX_EVENTS = 50;

/** The vocabulary lib/track.ts speaks. Anything else is dropped. */
const EVENT_PATTERN =
  /^(pageview|section|cta|form|vsl|cost|faq|playbook|interview)_[a-z0-9_-]{1,56}$/;
const VALUE_PATTERN = /^[a-z0-9_-]{1,32}$/;

export async function POST(request: Request) {
  const experiment = HEADLINE_EXPERIMENT;
  if (!experiment.enabled) return noContent();

  const limit = checkRateLimit(`track:${getClientIp(request.headers)}`, { limit: 60, windowMs: 60_000 });
  if (!limit.allowed) return noContent();

  const cookieHeader = request.headers.get("cookie") ?? "";
  const variantId = parseVariantCookie(readCookie(cookieHeader, AB_VARIANT_COOKIE), experiment);
  const visitorId = readCookie(cookieHeader, AB_VISITOR_COOKIE);
  if (!variantId || !isValidVisitorId(visitorId)) return noContent();

  let body: Record<string, unknown> = {};
  try {
    const text = await request.text();
    if (text.length > MAX_BODY_BYTES) return noContent();
    body = text ? (JSON.parse(text) as Record<string, unknown>) : {};
  } catch {
    return noContent();
  }

  const page = body.page === "landing" || body.page === "materials" ? body.page : null;
  if (!page) return noContent();

  const viewport = body.viewport === "mobile" || body.viewport === "desktop" ? body.viewport : undefined;
  const pageVersion =
    typeof body.page_version === "string" && /^[a-z0-9_-]{1,40}$/.test(body.page_version)
      ? body.page_version
      : undefined;

  const events = (Array.isArray(body.events) ? body.events : [])
    .slice(0, MAX_EVENTS)
    .map((e) => (e ?? {}) as Record<string, unknown>)
    .filter((e) => typeof e.event === "string" && EVENT_PATTERN.test(e.event))
    .map((e) => ({
      event: e.event as string,
      value: typeof e.value === "string" && VALUE_PATTERN.test(e.value) ? e.value : undefined,
    }));

  if (events.length === 0) return noContent();

  const result = await recordPageEvents({
    experimentId: experiment.id,
    visitorId,
    page,
    viewport,
    pageVersion,
    events,
  });

  if (!result.ok && !result.skipped) {
    console.error(`[track] write failed: ${result.error ?? "unknown"}`);
  }

  return noContent();
}

export async function GET() {
  return NextResponse.json(
    { success: false, message: "Method not allowed." },
    { status: 405, headers: { Allow: "POST" } }
  );
}

function noContent() {
  return new NextResponse(null, { status: 204, headers: { "Cache-Control": "no-store" } });
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
