/* -------------------------------------------------------------------------- *
 * src/app/api/cron/meta-spend/route.ts
 *
 * Pulls yesterday's spend per ad from the Meta Marketing API into `ad_spend`,
 * scoped to the campaigns listed in META_CAMPAIGN_IDS.
 * Without this table, every cost-per-X metric is unanswerable.
 *
 * Scheduled by vercel.json at 04:00 UTC daily. Also callable by hand to
 * backfill after a gap:
 *
 *   curl "https://yourdomain.com/api/cron/meta-spend?days=30" \
 *     -H "Authorization: Bearer $CRON_SECRET"
 *
 * Meta restates the last few days as attribution settles, so the default window
 * is 3 days, not 1 — re-pulling overwrites by (date, ad_id) and self-corrects.
 * -------------------------------------------------------------------------- */

import { NextResponse } from "next/server";

import { fetchWithRetry, safeJson, safeText } from "@/lib/http";
import { getSupabase } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const GRAPH_VERSION = process.env.META_GRAPH_API_VERSION?.trim() || "v21.0";
const AD_ACCOUNT_ID = (process.env.META_AD_ACCOUNT_ID || "").trim();
const ACCESS_TOKEN = (process.env.META_MARKETING_API_TOKEN || process.env.META_CAPI_ACCESS_TOKEN || "").trim();
const CRON_SECRET = (process.env.CRON_SECRET || "").trim();

/**
 * Restrict the pull to specific campaigns. Comma-separated campaign IDs.
 * Empty = whole ad account (the old behaviour).
 */
const CAMPAIGN_IDS = (process.env.META_CAMPAIGN_IDS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

/** Meta keeps revising recent days; re-pull a short window every night. */
const DEFAULT_LOOKBACK_DAYS = 3;
const MAX_LOOKBACK_DAYS = 90;
const PAGE_LIMIT = 500;

interface InsightRow {
  date_start?: string;
  ad_id?: string;
  ad_name?: string;
  adset_id?: string;
  adset_name?: string;
  campaign_id?: string;
  campaign_name?: string;
  spend?: string;
  impressions?: string;
  clicks?: string;
  account_currency?: string;
}

export async function GET(request: Request) {
  const startedAt = Date.now();

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

  if (!AD_ACCOUNT_ID || !ACCESS_TOKEN) {
    console.error("[spend] META_AD_ACCOUNT_ID / token missing");
    return json({ ok: false, error: "missing_credentials" }, 503);
  }

  const supabase = getSupabase();
  if (!supabase) return json({ ok: false, error: "supabase_not_configured" }, 503);

  // One-shot cleanup of rows banked before the campaign filter existed:
  //   curl ".../api/cron/meta-spend?prune=1&days=90" -H "Authorization: Bearer $CRON_SECRET"
  if (url.searchParams.get("prune") === "1" && CAMPAIGN_IDS.length) {
    const { error: pruneError, count } = await supabase
      .from("ad_spend")
      .delete({ count: "exact" })
      .or(`campaign_id.is.null,campaign_id.not.in.(${CAMPAIGN_IDS.join(",")})`);

    if (pruneError) {
      console.error(`[spend] prune failed: ${pruneError.message}`);
      return json({ ok: false, error: pruneError.message }, 502);
    }
    console.info(`[spend] pruned ${count ?? 0} out-of-scope rows`);
  }

  const days = clamp(Number(url.searchParams.get("days")) || DEFAULT_LOOKBACK_DAYS, 1, MAX_LOOKBACK_DAYS);
  const until = new Date();
  const since = new Date(until.getTime() - (days - 1) * 86_400_000);

  const account = AD_ACCOUNT_ID.startsWith("act_") ? AD_ACCOUNT_ID : `act_${AD_ACCOUNT_ID}`;

  const params = new URLSearchParams({
    level: "ad",
    fields: "ad_id,ad_name,adset_id,adset_name,campaign_id,campaign_name,spend,impressions,clicks,account_currency",
    time_increment: "1",
    time_range: JSON.stringify({ since: isoDate(since), until: isoDate(until) }),
    limit: String(PAGE_LIMIT),
    access_token: ACCESS_TOKEN,
  });

  // Ask Meta for this campaign only — cheaper than paging the account and
  // throwing most of it away, and it keeps `ad_spend` free of foreign rows.
  if (CAMPAIGN_IDS.length) {
    params.set(
      "filtering",
      JSON.stringify([{ field: "campaign.id", operator: "IN", value: CAMPAIGN_IDS }])
    );
  }

  let next: string | null = `https://graph.facebook.com/${GRAPH_VERSION}/${account}/insights?${params}`;
  const rows: InsightRow[] = [];
  let pages = 0;

  try {
    // Bounded so a paging bug can never spin forever inside a cron.
    while (next && pages < 25) {
      const res: Response = await fetchWithRetry(next, { method: "GET" }, {
        label: "meta-insights",
        attempts: 3,
        timeoutMs: 20_000,
      });

      if (!res.ok) {
        const body = await safeText(res, 600);
        console.error(`[spend] insights HTTP ${res.status}: ${body}`);
        return json({ ok: false, error: `http_${res.status}`, detail: body }, 502);
      }

      const page = await safeJson<{ data?: InsightRow[]; paging?: { next?: string } }>(res);
      if (page?.data?.length) rows.push(...page.data);
      next = page?.paging?.next ?? null;
      pages++;
    }
  } catch (err) {
    console.error("[spend] insights fetch failed:", err);
    return json({ ok: false, error: String(err) }, 502);
  }

  const records = rows
    .filter((r) => r.ad_id && r.date_start && inScope(r.campaign_id))
    .map((r) => ({
      date: r.date_start!,
      ad_id: r.ad_id!,
      adset_id: r.adset_id ?? null,
      campaign_id: r.campaign_id ?? null,
      ad_name: r.ad_name ?? null,
      adset_name: r.adset_name ?? null,
      campaign_name: r.campaign_name ?? null,
      spend: Number(r.spend ?? 0) || 0,
      impressions: Number(r.impressions ?? 0) || 0,
      clicks: Number(r.clicks ?? 0) || 0,
      currency: r.account_currency ?? "PLN",
      synced_at: new Date().toISOString(),
    }));

  if (records.length === 0) {
    console.info(`[spend] no rows for ${isoDate(since)}..${isoDate(until)}`);
    return json({ ok: true, days, rows: 0, spend: 0 });
  }

  // Chunked upsert: one oversized request is the usual way a backfill fails.
  let written = 0;
  for (let i = 0; i < records.length; i += 500) {
    const chunk = records.slice(i, i + 500);
    const { error } = await supabase.from("ad_spend").upsert(chunk, { onConflict: "date,ad_id" });
    if (error) {
      console.error(`[spend] upsert failed at row ${i}: ${error.message}`);
      return json({ ok: false, error: error.message, written }, 502);
    }
    written += chunk.length;
  }

  const total = records.reduce((sum, r) => sum + r.spend, 0);
  console.info(
    `[spend] ${isoDate(since)}..${isoDate(until)} rows=${written} spend=${total.toFixed(2)} ` +
      `pages=${pages} campaigns=${CAMPAIGN_IDS.join(",") || "all"} ${Date.now() - startedAt}ms`
  );

  return json({
    ok: true,
    days,
    from: isoDate(since),
    to: isoDate(until),
    rows: written,
    spend: Number(total.toFixed(2)),
    campaigns: CAMPAIGN_IDS.length ? CAMPAIGN_IDS : "all",
  });
}

/* -------------------------------------------------------------------------- */

/** No allowlist configured = everything is in scope (previous behaviour). */
function inScope(campaignId?: string | null): boolean {
  if (CAMPAIGN_IDS.length === 0) return true;
  return !!campaignId && CAMPAIGN_IDS.includes(campaignId);
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.round(n)));
}

function bearer(header: string | null): string | undefined {
  if (!header) return undefined;
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  return match ? match[1].trim() : undefined;
}

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}
