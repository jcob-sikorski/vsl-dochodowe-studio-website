/* -------------------------------------------------------------------------- *
 * src/app/api/cron/meta-spend/route.ts
 *
 * Nightly spend sync. The work itself lives in lib/meta-spend.ts, shared with
 * the dashboard's "Sync spend now" button.
 *
 * Scheduled by vercel.json at 04:00 UTC daily. Also callable by hand to
 * backfill after a gap:
 *
 *   curl "https://yourdomain.com/api/cron/meta-spend?days=30" \
 *     -H "Authorization: Bearer $CRON_SECRET"
 *
 * One-shot cleanup of rows banked before the campaign filter existed:
 *
 *   curl ".../api/cron/meta-spend?prune=1&days=90" -H "Authorization: Bearer $CRON_SECRET"
 * -------------------------------------------------------------------------- */

import { NextResponse } from "next/server";

import { DEFAULT_LOOKBACK_DAYS, syncMetaSpend } from "@/lib/meta-spend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const CRON_SECRET = (process.env.CRON_SECRET || "").trim();

export async function GET(request: Request) {
  if (!CRON_SECRET) {
    console.error("[spend] CRON_SECRET not set — endpoint disabled");
    return json({ ok: false, error: "not_configured" }, 503);
  }

  // Vercel Cron sends `Authorization: Bearer <CRON_SECRET>`.
  const url = new URL(request.url);
  const presented =
    bearer(request.headers.get("authorization")) ??
    request.headers.get("x-cron-secret") ??
    url.searchParams.get("token") ??
    "";

  if (presented !== CRON_SECRET) {
    return json({ ok: false, error: "unauthorized" }, 401);
  }

  const { status, ...result } = await syncMetaSpend({
    days: Number(url.searchParams.get("days")) || DEFAULT_LOOKBACK_DAYS,
    prune: url.searchParams.get("prune") === "1",
  });

  return json(result, status);
}

/* -------------------------------------------------------------------------- */

function bearer(header: string | null): string | undefined {
  if (!header) return undefined;
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  return match ? match[1].trim() : undefined;
}

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}
