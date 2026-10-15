/* -------------------------------------------------------------------------- *
 * lib/meta-spend.ts
 *
 * Pulls spend per ad per day from the Meta Marketing API into `ad_spend`,
 * scoped to the campaigns listed in META_CAMPAIGN_IDS.
 * Without this table, every cost-per-X metric is unanswerable.
 *
 * Two callers:
 *   - /api/cron/meta-spend — nightly at 04:00 UTC (vercel.json), and by hand
 *     for backfills
 *   - the dashboard's "Sync spend now" button (app/dashboard/actions.ts)
 *
 * Meta restates the last few days as attribution settles, so the default window
 * is 3 days, not 1 — re-pulling overwrites by (date, ad_id) and self-corrects.
 *
 * SERVER ONLY: uses the Marketing API token.
 * -------------------------------------------------------------------------- */

import { fetchWithRetry, safeJson, safeText } from "@/lib/http";
import { getSupabase } from "@/lib/supabase";

const GRAPH_VERSION = process.env.META_GRAPH_API_VERSION?.trim() || "v21.0";
const AD_ACCOUNT_ID = (process.env.META_AD_ACCOUNT_ID || "").trim();
const ACCESS_TOKEN = (process.env.META_MARKETING_API_TOKEN || process.env.META_CAPI_ACCESS_TOKEN || "").trim();

/**
 * Restrict the pull to specific campaigns. Comma-separated campaign IDs.
 * Empty = whole ad account (the old behaviour).
 */
export const CAMPAIGN_IDS = (process.env.META_CAMPAIGN_IDS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

/** Every ad status, so archived/deleted ads keep reporting their past spend. */
const ALL_AD_STATUSES = [
  "ACTIVE",
  "PAUSED",
  "DELETED",
  "ARCHIVED",
  "PENDING_REVIEW",
  "DISAPPROVED",
  "PREAPPROVED",
  "PENDING_BILLING_INFO",
  "CAMPAIGN_PAUSED",
  "ADSET_PAUSED",
  "IN_PROCESS",
  "WITH_ISSUES",
];

export const DEFAULT_LOOKBACK_DAYS = 3;
export const MAX_LOOKBACK_DAYS = 90;
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

export interface SpendSyncResult {
  ok: boolean;
  /** Machine-readable reason when ok is false. */
  error?: string;
  /** Extra context for logs (e.g. the Graph API error body). */
  detail?: string;
  /** HTTP status the cron route should answer with. */
  status: number;
  days?: number;
  from?: string;
  to?: string;
  rows?: number;
  spend?: number;
  pruned?: number;
  campaigns?: string[] | "all";
  ms?: number;
}

export async function syncMetaSpend(opts: { days?: number; prune?: boolean } = {}): Promise<SpendSyncResult> {
  const startedAt = Date.now();

  if (!AD_ACCOUNT_ID || !ACCESS_TOKEN) {
    console.error("[spend] META_AD_ACCOUNT_ID / token missing");
    return { ok: false, error: "missing_credentials", status: 503 };
  }

  const supabase = getSupabase();
  if (!supabase) return { ok: false, error: "supabase_not_configured", status: 503 };

  // One-shot cleanup of rows banked before the campaign filter existed.
  let pruned: number | undefined;
  if (opts.prune && CAMPAIGN_IDS.length) {
    const { error: pruneError, count } = await supabase
      .from("ad_spend")
      .delete({ count: "exact" })
      .or(`campaign_id.is.null,campaign_id.not.in.(${CAMPAIGN_IDS.join(",")})`);

    if (pruneError) {
      console.error(`[spend] prune failed: ${pruneError.message}`);
      return { ok: false, error: "prune_failed", detail: pruneError.message, status: 502 };
    }
    pruned = count ?? 0;
    console.info(`[spend] pruned ${pruned} out-of-scope rows`);
  }

  const days = clamp(opts.days || DEFAULT_LOOKBACK_DAYS, 1, MAX_LOOKBACK_DAYS);
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

  // Insights silently drop ARCHIVED and DELETED ads unless asked for them by
  // status. Without this, archiving ads or a campaign freezes its last partial
  // day in `ad_spend` (the nightly re-pull returns nothing for it), and any
  // backfill after archiving loses that spend entirely.
  params.set(
    "filtering",
    JSON.stringify([{ field: "ad.effective_status", operator: "IN", value: ALL_AD_STATUSES }])
  );

  // One insights call per configured campaign, on the campaign node itself.
  // An account-level call filtered by campaign.id returns NOTHING for an
  // archived campaign even with the status filter above — querying the
  // campaign directly is the only form that keeps its history. With no
  // campaigns configured, pull the whole ad account (the old behaviour).
  const nodes = CAMPAIGN_IDS.length ? CAMPAIGN_IDS : [account];

  const rows: InsightRow[] = [];
  let pages = 0;

  try {
    for (const node of nodes) {
      let next: string | null = `https://graph.facebook.com/${GRAPH_VERSION}/${node}/insights?${params}`;
      let nodePages = 0;

      // Bounded so a paging bug can never spin forever.
      while (next && nodePages < 25) {
        const res: Response = await fetchWithRetry(next, { method: "GET" }, {
          label: "meta-insights",
          attempts: 3,
          timeoutMs: 20_000,
        });

        if (!res.ok) {
          const body = await safeText(res, 600);
          console.error(`[spend] insights HTTP ${res.status} for ${node}: ${body}`);
          return { ok: false, error: `http_${res.status}`, detail: body, status: 502 };
        }

        const page = await safeJson<{ data?: InsightRow[]; paging?: { next?: string } }>(res);
        if (page?.data?.length) rows.push(...page.data);
        next = page?.paging?.next ?? null;
        nodePages++;
        pages++;
      }
    }
  } catch (err) {
    console.error("[spend] insights fetch failed:", err);
    return { ok: false, error: "fetch_failed", detail: String(err), status: 502 };
  }

  const syncedAt = new Date().toISOString();
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
      synced_at: syncedAt,
    }));

  const base = {
    days,
    from: isoDate(since),
    to: isoDate(until),
    pruned,
    campaigns: CAMPAIGN_IDS.length ? CAMPAIGN_IDS : ("all" as const),
  };

  if (records.length === 0) {
    console.info(`[spend] no rows for ${base.from}..${base.to}`);
    return { ok: true, status: 200, ...base, rows: 0, spend: 0, ms: Date.now() - startedAt };
  }

  // Chunked upsert: one oversized request is the usual way a backfill fails.
  let written = 0;
  for (let i = 0; i < records.length; i += 500) {
    const chunk = records.slice(i, i + 500);
    const { error } = await supabase.from("ad_spend").upsert(chunk, { onConflict: "date,ad_id" });
    if (error) {
      console.error(`[spend] upsert failed at row ${i}: ${error.message}`);
      return { ok: false, error: "upsert_failed", detail: error.message, status: 502, rows: written };
    }
    written += chunk.length;
  }

  const total = records.reduce((sum, r) => sum + r.spend, 0);
  const ms = Date.now() - startedAt;
  console.info(
    `[spend] ${base.from}..${base.to} rows=${written} spend=${total.toFixed(2)} ` +
      `pages=${pages} campaigns=${CAMPAIGN_IDS.join(",") || "all"} ${ms}ms`
  );

  return { ok: true, status: 200, ...base, rows: written, spend: Number(total.toFixed(2)), ms };
}

/** Newest `synced_at` in ad_spend, or null when nothing has been synced. */
export async function lastSpendSync(): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  try {
    const { data } = await supabase
      .from("ad_spend")
      .select("synced_at")
      .order("synced_at", { ascending: false })
      .limit(1);
    return ((data?.[0] as { synced_at?: string } | undefined)?.synced_at) ?? null;
  } catch {
    return null;
  }
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
