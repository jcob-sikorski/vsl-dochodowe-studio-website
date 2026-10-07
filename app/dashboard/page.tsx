/* -------------------------------------------------------------------------- *
 * src/app/dashboard/page.tsx
 *
 * Paid funnel economics: spend joined to pipeline outcomes on ad_id.
 *
 * Server component. Lead PII never reaches the browser — only aggregates do.
 * Protected by HTTP Basic Auth in src/middleware.ts.
 * -------------------------------------------------------------------------- */

import { HEADLINE_EXPERIMENT, getVariant } from "@/lib/ab";
import { ThemeToggle } from "@/components/theme-toggle";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/* -------------------------------------------------------------------------- *
 * Types
 * -------------------------------------------------------------------------- */

interface ReportRow {
  ad_id: string | null;
  ad_name: string | null;
  adset_name: string | null;
  campaign_name: string | null;
  spend: number | string;
  impressions: number | string;
  clicks: number | string;
  leads: number | string;
  for_qualification: number | string;
  qualified: number | string;
  booked: number | string;
  rescheduled: number | string;
  showed: number | string;
  no_shows: number | string;
  no_shows_final: number | string;
  proposal_sent: number | string;
  proposals_open: number | string;
  won: number | string;
  revenue: number | string;
  /** Per call, rebuilt from the stage history (lead_calls). */
  calls?: number | string;
  calls_held?: number | string;
  calls_no_show?: number | string;
  calls_pending?: number | string;
  calls_returned?: number | string;
  calls_stale?: number | string;
}

interface AbRow {
  experiment_id: string | null;
  variant_id: string | null;
  views: number | string;
  /** Meta ad-review visits left out of `views` (see ab_views_scored). */
  excluded_views?: number | string;
  leads: number | string;
  qualified: number | string;
  booked: number | string;
  showed: number | string;
  won: number | string;
  revenue: number | string;
}

interface Totals {
  spend: number;
  impressions: number;
  clicks: number;
  leads: number;
  forQualification: number;
  qualified: number;
  booked: number;
  rescheduled: number;
  showed: number;
  noShows: number;
  noShowsFinal: number;
  proposalSent: number;
  proposalsOpen: number;
  won: number;
  revenue: number;
  callsHeld: number;
  callsNoShow: number;
  callsPending: number;
  callsReturned: number;
  callsStale: number;
}

type SearchParams = Record<string, string | string[] | undefined>;

/* -------------------------------------------------------------------------- *
 * Formatting
 * -------------------------------------------------------------------------- */

const pln = new Intl.NumberFormat("pl-PL", {
  style: "currency",
  currency: "PLN",
  maximumFractionDigits: 0,
});
const plnPrecise = new Intl.NumberFormat("pl-PL", {
  style: "currency",
  currency: "PLN",
  maximumFractionDigits: 2,
});
const int = new Intl.NumberFormat("pl-PL", { maximumFractionDigits: 0 });

const n = (v: number | string | null | undefined): number => {
  const parsed = typeof v === "number" ? v : Number(v ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

/** Rates and costs are undefined when the denominator is zero — never 0 or ∞. */
const rate = (num: number, den: number): number | undefined =>
  den > 0 ? num / den : undefined;

const pct = (v: number | undefined): string => (v === undefined ? "—" : `${(v * 100).toFixed(0)}%`);

/** Opt-in rates live in the low single digits — one decimal place matters. */
const pct2 = (v: number | undefined): string =>
  v === undefined ? "—" : `${(v * 100).toFixed(1)}%`;

const cost = (spend: number, count: number): string =>
  spend > 0 && count > 0 ? pln.format(spend / count) : "—";

/* -------------------------------------------------------------------------- *
 * Page
 * -------------------------------------------------------------------------- */

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: SearchParams | Promise<SearchParams>;
}) {
  // `await` works whether searchParams is sync (Next 14) or async (Next 15+).
  const params = (await searchParams) ?? {};

  const range = clampRange(first(params.range));
  const traffic = first(params.traffic) === "all" ? "all" : "paid";

  const to = first(params.to) ?? isoDate(new Date());
  const from =
    first(params.from) ?? isoDate(new Date(Date.parse(to) - (range - 1) * 86_400_000));

  const supabase = getSupabase();

  if (!supabase) {
    return (
      <Shell from={from} to={to} range={range} traffic={traffic}>
        <Notice
          title="Supabase isn't configured"
          body="Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY, then run supabase/schema.sql in the SQL editor."
        />
      </Shell>
    );
  }

  const { data, error } = await supabase.rpc("funnel_report", {
    p_from: from,
    p_to: to,
    p_traffic: traffic,
  });

  if (error) {
    return (
      <Shell from={from} to={to} range={range} traffic={traffic}>
        <Notice title="Query failed" body={error.message} tone="critical" />
      </Shell>
    );
  }

  const rows = (data ?? []) as ReportRow[];

  // Separate query, deliberately not blocking the page: if the split-test
  // tables aren't installed yet the funnel report above must still render.
  const ab = await supabase.rpc("ab_report", {
    p_from: from,
    p_to: to,
    p_traffic: traffic,
    p_experiment: HEADLINE_EXPERIMENT.id,
  });

  const abRows = (ab.error ? [] : ((ab.data ?? []) as AbRow[])).filter((r) => r.variant_id);

  // Data problems that would make the numbers below wrong. Never blocks the page.
  const health = await loadHealth(supabase, {
    from,
    to,
    traffic,
    rows,
    abActive: abRows.length > 0,
  });

  const totals: Totals = rows.reduce<Totals>(
    (acc, r) => ({
      spend: acc.spend + n(r.spend),
      impressions: acc.impressions + n(r.impressions),
      clicks: acc.clicks + n(r.clicks),
      leads: acc.leads + n(r.leads),
      forQualification: acc.forQualification + n(r.for_qualification),
      qualified: acc.qualified + n(r.qualified),
      booked: acc.booked + n(r.booked),
      rescheduled: acc.rescheduled + n(r.rescheduled),
      showed: acc.showed + n(r.showed),
      noShows: acc.noShows + n(r.no_shows),
      noShowsFinal: acc.noShowsFinal + n(r.no_shows_final),
      proposalSent: acc.proposalSent + n(r.proposal_sent),
      proposalsOpen: acc.proposalsOpen + n(r.proposals_open),
      won: acc.won + n(r.won),
      revenue: acc.revenue + n(r.revenue),
      callsHeld: acc.callsHeld + n(r.calls_held),
      callsNoShow: acc.callsNoShow + n(r.calls_no_show),
      callsPending: acc.callsPending + n(r.calls_pending),
      callsReturned: acc.callsReturned + n(r.calls_returned),
      callsStale: acc.callsStale + n(r.calls_stale),
    }),
    {
      spend: 0, impressions: 0, clicks: 0, leads: 0, forQualification: 0,
      qualified: 0, booked: 0, rescheduled: 0, showed: 0, noShows: 0,
      noShowsFinal: 0, proposalSent: 0, proposalsOpen: 0, won: 0, revenue: 0,
      callsHeld: 0, callsNoShow: 0, callsPending: 0, callsReturned: 0, callsStale: 0,
    }
  );

  const roas = rate(totals.revenue, totals.spend);

  // Calls, not leads: every time a card enters Booked Call is one call, and
  // where it goes next decides it (lead_calls in the database):
  //   held      — Booked Call → Lost / Proposal Sent / Won
  //   missed    — Booked Call → No Show
  //   returned  — Booked Call → For Qualification (call never happened; ignored)
  //   pending   — still in Booked Call
  // A lead that misses, goes back to For Qualification and is rebooked counts
  // as one missed call and one more call — exactly like the EOD report.
  // Rates count only calls with an outcome: next week's calls aren't no-shows.
  const calls = callOutcomes(totals.callsHeld, totals.callsNoShow, totals.callsPending);
  const pendingNote = calls.pending > 0 ? ` · ${int.format(calls.pending)} calls pending` : "";

  // While calls are pending or proposals are open, spend ÷ outcomes-so-far
  // overstates the cost: the spend also bought the bookings that haven't
  // resolved yet. The estimate assumes pending calls show, and open proposals
  // close, at the rates seen so far:
  //   expected shows = held + pending × show rate      (= booked × show rate)
  //   expected wins  = won + (open proposals + expected new shows) × close rate
  // Close rate is won ÷ decided proposals (Won or Lost after a proposal).
  const decided = Math.max(0, totals.showed - totals.proposalsOpen);
  const closeRate = rate(totals.won, decided);
  const expectedShows =
    calls.showRate === undefined ? undefined : totals.showed + calls.pending * calls.showRate;
  const expectedWins =
    closeRate === undefined || expectedShows === undefined
      ? undefined
      : totals.won + (totals.proposalsOpen + (expectedShows - totals.showed)) * closeRate;
  const perShow = costEstimate(totals.spend, totals.showed, expectedShows, calls.pending > 0);
  const perPurchase = costEstimate(
    totals.spend,
    totals.won,
    expectedWins,
    calls.pending > 0 || totals.proposalsOpen > 0
  );

  const funnel = [
    { label: "Leads", value: totals.leads },
    { label: "For qualification", value: totals.forQualification },
    { label: "Qualified", value: totals.qualified },
    { label: "Booked", value: totals.booked },
    {
      label: "Showed",
      value: totals.showed,
      note:
        calls.pending > 0
          ? `${pct(calls.showRate)} of past calls · ${int.format(calls.pending)} pending`
          : undefined,
    },
    {
      label: "Won",
      value: totals.won,
      note:
        totals.proposalsOpen > 0
          ? `${pct(rate(totals.won, totals.showed - totals.proposalsOpen))} of decided · ${int.format(totals.proposalsOpen)} open`
          : undefined,
    },
  ];

  return (
    <Shell from={from} to={to} range={range} traffic={traffic}>
      <HealthStrip items={health} />

      {/* ---- headline economics ------------------------------------- */}
      <section className="tiles" aria-label="Headline metrics">
        <Tile label="Spend" value={pln.format(totals.spend)} />
        <Tile label="Revenue" value={pln.format(totals.revenue)} />
        <Tile
          label="ROAS"
          value={roas === undefined ? "—" : `${roas.toFixed(2)}×`}
          tone={roas === undefined ? undefined : roas >= 3 ? "good" : roas >= 1 ? "warning" : "critical"}
          note={roas === undefined ? "no spend in range" : roas >= 1 ? "profitable on ad cost" : "below break-even"}
        />
        <Tile
          label="Show rate"
          value={pct(calls.showRate)}
          note={`${int.format(totals.callsHeld)} of ${int.format(calls.resolved)} past calls · ${int.format(calls.pending)} pending`}
        />
        <Tile
          label="No-show rate"
          value={pct(calls.noShowRate)}
          tone={
            calls.noShowRate === undefined
              ? undefined
              : calls.noShowRate >= 0.3
                ? "critical"
                : calls.noShowRate >= 0.15
                  ? "warning"
                  : "good"
          }
          note={`${int.format(totals.callsNoShow)} missed calls · ${int.format(totals.rescheduled)} leads booked again`}
        />
      </section>

      {/* ---- cost per stage ------------------------------------------ */}
      <h2 className="h2">Cost per stage</h2>
      <section className="tiles dense" aria-label="Cost per stage">
        <Tile size="sm" label="Per lead" value={cost(totals.spend, totals.leads)} note={`${int.format(totals.leads)} leads`} />
        <Tile size="sm" label="Per for qualification" value={cost(totals.spend, totals.forQualification)} note={`${int.format(totals.forQualification)} for qualification`} />
        <Tile size="sm" label="Per qualified" value={cost(totals.spend, totals.qualified)} note={`${int.format(totals.qualified)} qualified`} />
        <Tile size="sm" label="Per booked call" value={cost(totals.spend, totals.booked)} note={`${int.format(totals.booked)} booked`} />
        <Tile
          size="sm"
          label="Per show · proposal"
          value={perShow.value}
          note={`${perShow.prefix}${int.format(totals.showed)} showed${pendingNote}`}
        />
        <Tile
          size="sm"
          label="Per purchase"
          value={perPurchase.value}
          note={`${perPurchase.prefix}${int.format(totals.won)} won${totals.proposalsOpen > 0 ? ` · ${int.format(totals.proposalsOpen)} proposals open` : ""}${pendingNote}`}
        />
      </section>

      {/* ---- funnel -------------------------------------------------- */}
      <h2 className="h2">Funnel</h2>
      <div className="card">
        <Funnel steps={funnel} />
      </div>

      {/* ---- headline split test ------------------------------------- */}
      <h2 className="h2">Headline test · {HEADLINE_EXPERIMENT.id}</h2>
      <AbTest rows={abRows} error={ab.error?.message} traffic={traffic} />

      {/* ---- per-ad-set table ---------------------------------------- */}
      {rows.length > 0 && (
        <>
          <h2 className="h2">By ad set</h2>
          <AdSetTable rows={rows} />
        </>
      )}

      {/* ---- per-ad table -------------------------------------------- */}
      <h2 className="h2">By ad</h2>
      {rows.length === 0 ? (
        <Notice
          title="No data in this range"
          body="Either nothing was spent and no leads came in, or the spend sync hasn't run yet. Trigger it with /api/cron/meta-spend?days=30."
        />
      ) : (
        <div className="tablewrap">
          <table className="table">
            <thead>
              <tr>
                <th scope="col" className="left">Ad</th>
                <th scope="col">Spend</th>
                <th scope="col">Leads</th>
                <th scope="col">For&nbsp;qual.</th>
                <th scope="col">Qual.</th>
                <th scope="col">Booked</th>
                <th scope="col">Showed</th>
                <th scope="col">Pending</th>
                <th scope="col">Show&nbsp;rate</th>
                <th scope="col">Open&nbsp;prop.</th>
                <th scope="col">Won</th>
                <th scope="col">CP&nbsp;lead</th>
                <th scope="col">CP&nbsp;show</th>
                <th scope="col">CP&nbsp;purchase</th>
                <th scope="col">Revenue</th>
                <th scope="col">ROAS</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const spend = n(r.spend);
                const leads = n(r.leads);
                const booked = n(r.booked);
                const showed = n(r.showed);
                const won = n(r.won);
                const revenue = n(r.revenue);
                const rowRoas = rate(revenue, spend);
                const rowCalls = callOutcomes(n(r.calls_held), n(r.calls_no_show), n(r.calls_pending));

                return (
                  <tr key={`${r.ad_id ?? "none"}-${i}`}>
                    <th scope="row" className="left">
                      {r.ad_id === NO_AD_ID ? (
                        <>
                          <span className="adname">Unattributed</span>
                          <span className="sub">no ad ID in the landing URL</span>
                        </>
                      ) : (
                        <>
                          <span className="adname">{r.ad_name || r.ad_id}</span>
                          <span className="sub">
                            {[r.campaign_name, r.adset_name].filter(Boolean).join(" · ") ||
                              "no spend tracked for this ad"}
                          </span>
                        </>
                      )}
                    </th>
                    <td>{pln.format(spend)}</td>
                    <td>{int.format(leads)}</td>
                    <td>{int.format(n(r.for_qualification))}</td>
                    <td>{int.format(n(r.qualified))}</td>
                    <td>{int.format(booked)}</td>
                    <td>{int.format(showed)}</td>
                    <td>{int.format(rowCalls.pending)}</td>
                    <td>{pct(rowCalls.showRate)}</td>
                    <td>{int.format(n(r.proposals_open))}</td>
                    <td>{int.format(won)}</td>
                    <td>{cost(spend, leads)}</td>
                    <td>{cost(spend, showed)}</td>
                    <td>{cost(spend, won)}</td>
                    <td>{pln.format(revenue)}</td>
                    <td>
                      {rowRoas === undefined ? (
                        "—"
                      ) : (
                        <span className={`roas ${rowRoas >= 3 ? "good" : rowRoas >= 1 ? "warning" : "critical"}`}>
                          {rowRoas.toFixed(2)}×
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <th scope="row" className="left">Total</th>
                <td>{pln.format(totals.spend)}</td>
                <td>{int.format(totals.leads)}</td>
                <td>{int.format(totals.forQualification)}</td>
                <td>{int.format(totals.qualified)}</td>
                <td>{int.format(totals.booked)}</td>
                <td>{int.format(totals.showed)}</td>
                <td>{int.format(calls.pending)}</td>
                <td>{pct(calls.showRate)}</td>
                <td>{int.format(totals.proposalsOpen)}</td>
                <td>{int.format(totals.won)}</td>
                <td>{cost(totals.spend, totals.leads)}</td>
                <td>{cost(totals.spend, totals.showed)}</td>
                <td>{cost(totals.spend, totals.won)}</td>
                <td>{plnPrecise.format(totals.revenue)}</td>
                <td>{roas === undefined ? "—" : `${roas.toFixed(2)}×`}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      <p className="foot">
        Leads are counted by opt-in date; spend by the day it was spent. A deal that
        closes weeks after the click still counts against the click&rsquo;s date, so recent
        ranges understate ROAS until the pipeline catches up. Show rate is per call and
        follows the cards: every move into Booked Call is a call; moving on to Lost,
        Proposal Sent or Won makes it a held call, to No Show a missed one, and back to
        For Qualification a call that never happened (left out). A card still in Booked
        Call is pending, and rates count only calls with an outcome. While calls are pending or proposals are open, cost per
        show and per purchase show an estimate (~) that assumes the rest resolve at the
        rates seen so far; the real cost to date is in the note underneath. On a small
        number of calls the estimate moves a lot &mdash; treat it as a direction, not a price.
      </p>
    </Shell>
  );
}

/* -------------------------------------------------------------------------- *
 * Pieces
 * -------------------------------------------------------------------------- */

/**
 * The split test.
 *
 * Opt-in rate is leads ÷ unique visitors who were shown that headline — not
 * pageviews, and not sessions. Lift and the p-value are always relative to the
 * control (the first variant in lib/ab.ts), because "B beat C" is not a
 * decision you can act on.
 */
function AbTest({
  rows,
  error,
  traffic,
}: {
  rows: AbRow[];
  error?: string;
  traffic: string;
}) {
  if (error) {
    return (
      <Notice
        title="Split-test tables aren't installed"
        body={`${error} — run supabase/schema.sql in the SQL editor to create ab_views and ab_report().`}
      />
    );
  }

  if (rows.length === 0) {
    return (
      <Notice
        title="No split-test data in this range"
        body={
          traffic === "paid"
            ? "No paid visitors have been bucketed yet. Switch to All to include organic traffic, or wait for the next ad click."
            : "Nobody has been bucketed yet. Check that middleware is running on / and that /api/ab/view is reachable."
        }
      />
    );
  }

  // Config order is the truth: the first variant is the control, and rows the
  // config no longer knows about (an old variant still in the data) sort last.
  const order = new Map(HEADLINE_EXPERIMENT.variants.map((v, i) => [v.id, i]));
  const sorted = [...rows].sort(
    (a, b) => (order.get(a.variant_id ?? "") ?? 99) - (order.get(b.variant_id ?? "") ?? 99)
  );

  const control = sorted[0];
  const controlViews = n(control.views);
  const controlLeads = n(control.leads);
  const controlRate = rate(controlLeads, controlViews);

  const totalViews = sorted.reduce((sum, r) => sum + n(r.views), 0);
  const totalExcluded = sorted.reduce((sum, r) => sum + n(r.excluded_views), 0);
  const totalLeads = sorted.reduce((sum, r) => sum + n(r.leads), 0);

  return (
    <>
      <section className="tiles" aria-label="Split test headline metrics">
        <Tile
          label="Visitors bucketed"
          value={int.format(totalViews)}
          note={
            totalExcluded > 0
              ? `unique browsers · ${int.format(totalExcluded)} ad-review visits excluded`
              : "unique browsers"
          }
        />
        <Tile label="Opt-ins" value={int.format(totalLeads)} />
        <Tile
          label="Opt-in rate"
          value={pct2(rate(totalLeads, totalViews))}
          note="all variants combined"
        />
        <Tile label="Variants live" value={int.format(sorted.length)} />
      </section>

      <div className="tablewrap" style={{ marginTop: 12 }}>
        <table className="table">
          <thead>
            <tr>
              <th scope="col" className="left">Variant</th>
              <th scope="col">Visitors</th>
              <th scope="col">Opt&#8209;ins</th>
              <th scope="col">Opt&#8209;in&nbsp;rate</th>
              <th scope="col">Lift</th>
              <th scope="col">Confidence</th>
              <th scope="col">Booked</th>
              <th scope="col">Won</th>
              <th scope="col">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r, i) => {
              const views = n(r.views);
              const leads = n(r.leads);
              const optIn = rate(leads, views);
              const isControl = i === 0;

              const lift =
                isControl || optIn === undefined || controlRate === undefined || controlRate === 0
                  ? undefined
                  : (optIn - controlRate) / controlRate;

              const p = isControl
                ? undefined
                : twoProportionP(controlLeads, controlViews, leads, views);

              const variant = getVariant(r.variant_id);
              const label = order.has(r.variant_id ?? "")
                ? variant.label
                : `${r.variant_id} (retired)`;

              return (
                <tr key={r.variant_id ?? i}>
                  <th scope="row" className="left">
                    <span className="adname">{label}</span>
                    <span className="sub">{isControl ? "control" : `vs. control`}</span>
                  </th>
                  <td>{int.format(views)}</td>
                  <td>{int.format(leads)}</td>
                  <td>{pct2(optIn)}</td>
                  <td>
                    {lift === undefined ? (
                      "—"
                    ) : (
                      <span className={`roas ${lift > 0 ? "good" : lift < 0 ? "critical" : ""}`}>
                        {lift > 0 ? "+" : ""}
                        {(lift * 100).toFixed(1)}%
                      </span>
                    )}
                  </td>
                  <td>{confidenceLabel(p, views, leads, controlViews)}</td>
                  <td>{int.format(n(r.booked))}</td>
                  <td>{int.format(n(r.won))}</td>
                  <td>{pln.format(n(r.revenue))}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="foot">
        Confidence is a two&#8209;tailed test of this variant&rsquo;s opt&#8209;in rate against the
        control&rsquo;s. Below ~100 opt&#8209;ins per variant almost nothing reaches 95%, and
        stopping the moment a number goes green is how a coin flip gets promoted to
        a strategy &mdash; let it run. Visitors are counted by first visit and opt&#8209;ins by
        opt&#8209;in date, so someone who arrives on the last day of a range and converts
        the next morning lands in the denominator here and the numerator later. Meta
        also loads the page itself whenever new ads are published. A visit only counts once the
        visitor scrolls, taps or keeps the page open for a few seconds, and any hour with 20+
        visitors where nobody returned or opted in is excluded as ad review.
      </p>
    </>
  );
}

/* -------------------------------------------------------------------------- *
 * Data health
 *
 * Each check catches a way the numbers on this page can be silently wrong. The
 * strip renders nothing when everything is fine, so a visible warning always
 * means "fix the data before trusting the tiles".
 * -------------------------------------------------------------------------- */

const NO_AD_ID = "(no ad id)";

/** title: the fact, one line. hint: what to do, a few words. body: the why, on demand. */
type HealthItem = { tone: "critical" | "warning" | "info"; title: string; hint: string; body: string };
type Db = NonNullable<ReturnType<typeof getSupabase>>;

const whenFmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/Warsaw",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});
const dayFmt = new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", day: "numeric", month: "short" });
const fmtDay = (iso: string) => dayFmt.format(new Date(`${iso}T12:00:00Z`));

/** Pages past PostgREST's 1000-row cap. */
async function fetchAll<T>(
  page: (from: number, to: number) => PromiseLike<{ data: unknown[] | null; error: { message: string } | null }>
): Promise<T[]> {
  const out: T[] = [];
  for (let i = 0; i < 50; i++) {
    const { data, error } = await page(i * 1000, i * 1000 + 999);
    if (error) throw new Error(error.message);
    out.push(...((data ?? []) as T[]));
    if (!data || data.length < 1000) break;
  }
  return out;
}

async function loadHealth(
  supabase: Db,
  opts: { from: string; to: string; traffic: string; rows: ReportRow[]; abActive: boolean }
): Promise<HealthItem[]> {
  const items: HealthItem[] = [];
  // Same day boundaries funnel_report uses.
  const fromTs = `${opts.from}T00:00:00Z`;
  const toTs = `${isoDate(new Date(Date.parse(opts.to) + 86_400_000))}T00:00:00Z`;

  // 1. Is the nightly spend sync still writing anything?
  try {
    const { data } = await supabase
      .from("ad_spend")
      .select("date, synced_at")
      .order("synced_at", { ascending: false })
      .limit(1);
    const last = (data?.[0] ?? null) as { date: string; synced_at: string } | null;

    if (!last) {
      items.push({
        tone: "critical",
        title: "No ad spend synced yet",
        hint: "every cost reads zero",
        body: "Every cost on this page is zero until the spend sync runs. Trigger /api/cron/meta-spend?days=30.",
      });
    } else {
      const hours = (Date.now() - Date.parse(last.synced_at)) / 3_600_000;
      if (hours > 30) {
        const { data: newest } = await supabase
          .from("ad_spend")
          .select("date")
          .order("date", { ascending: false })
          .limit(1);
        const newestDay = (newest?.[0] as { date: string } | undefined)?.date ?? last.date;
        items.push({
          tone: "warning",
          title: `Spend last synced ${whenFmt.format(new Date(last.synced_at))}`,
          hint: "costs understated — check META_CAMPAIGN_IDS",
          body:
            `The nightly sync hasn't written any spend for ${Math.floor(hours / 24)} days (newest spend day: ` +
            `${fmtDay(newestDay)}). If ads are running, their campaign is probably missing from ` +
            "META_CAMPAIGN_IDS, and every cost on this page is understated until it's added.",
        });
      }
    }
  } catch {
    /* a failed check must never take the dashboard down */
  }

  // 2. Leads from ads whose spend isn't being synced.
  const untracked = opts.rows.filter(
    (r) => r.ad_id && r.ad_id !== NO_AD_ID && n(r.spend) === 0 && n(r.leads) > 0
  );
  if (untracked.length > 0) {
    try {
      let q = supabase
        .from("leads")
        .select("campaign_id, utm_campaign")
        .in("ad_id", untracked.map((r) => r.ad_id as string))
        .gte("opted_in_at", fromTs)
        .lt("opted_in_at", toTs);
      if (opts.traffic !== "all") q = q.eq("traffic_type", opts.traffic);
      const { data } = await q;

      const byCampaign = new Map<string, { count: number; name?: string }>();
      for (const l of (data ?? []) as { campaign_id: string | null; utm_campaign: string | null }[]) {
        const id = l.campaign_id ?? "unknown";
        const entry = byCampaign.get(id) ?? { count: 0 };
        entry.count++;
        if (!entry.name && l.utm_campaign) entry.name = l.utm_campaign.replace(/\+/g, " ");
        byCampaign.set(id, entry);
      }

      const total = untracked.reduce((sum, r) => sum + n(r.leads), 0);
      const parts = [...byCampaign.entries()]
        .sort((a, b) => b[1].count - a[1].count)
        .map(([id, e]) =>
          id.includes("{{")
            ? `${e.count} from an ad whose campaign ID URL parameter was never filled in`
            : `${e.count} from campaign ${id}${e.name ? ` (“${e.name}”)` : ""}`
        );

      items.push({
        tone: "critical",
        title: `${int.format(total)} leads from ads with no spend tracked`,
        hint: "costs understated — add the campaign to the sync",
        body:
          `${parts.join("; ")}. Cost per lead, per call and per purchase are understated and ROAS is ` +
          "overstated. Add the campaign ID to META_CAMPAIGN_IDS in Vercel, redeploy, then run " +
          "/api/cron/meta-spend?days=30.",
      });
    } catch {
      /* ignore */
    }
  }

  // 3. Calls whose card was probably never moved after the call.
  const stale = opts.rows.reduce((sum, r) => sum + n(r.calls_stale), 0);
  if (stale > 0) {
    items.push({
      tone: "warning",
      title: `${int.format(stale)} calls still in Booked Call after a week`,
      hint: "move the cards in GHL",
      body:
        "Those calls have almost certainly happened. Move each card to No Show, Lost, Proposal " +
        "Sent or Won — or back to For Qualification if the call never took place. Until then " +
        "they sit in \"pending\" and the show rate is calculated without them.",
    });
  }

  // 4. Paid leads that can't be credited to any ad.
  const unattributed = opts.rows.find((r) => r.ad_id === NO_AD_ID);
  if (opts.traffic === "paid" && unattributed && n(unattributed.leads) > 0) {
    items.push({
      tone: "info",
      title: `${int.format(n(unattributed.leads))} paid leads without an ad ID`,
      hint: "counted in totals, not credited to any ad",
      body:
        "They count in the totals but can't be credited to any ad or ad set. Usually an ad missing " +
        "ad_id={{ad.id}} in its URL parameters, or an organic Facebook/Instagram link (Meta adds a " +
        "click ID to those too).",
    });
  }

  // 5. Headline-test visitors that are Meta's ad review, not people.
  //    ab_views_scored marks review bursts (the one place that rule lives);
  //    ab_report already leaves them out. Here we say how many were dropped,
  //    and warn only if a burst got past the rule — visits far above clicks.
  if (opts.abActive) {
    try {
      type ScoredView = { first_seen_at: string; is_review_burst: boolean };
      const page = (table: "ab_views_scored" | "ab_views", cols: string) => (a: number, b: number) =>
        supabase
          .from(table)
          .select(cols)
          .eq("experiment_id", HEADLINE_EXPERIMENT.id)
          .eq("traffic_type", "paid")
          .gte("first_seen_at", fromTs)
          .lt("first_seen_at", toTs)
          .order("first_seen_at")
          .range(a, b);

      let views: ScoredView[];
      try {
        views = await fetchAll<ScoredView>(page("ab_views_scored", "first_seen_at, is_review_burst"));
      } catch {
        // Migration 2026-10-07 not applied yet: score nothing, still compare to clicks.
        const raw = await fetchAll<{ first_seen_at: string }>(page("ab_views", "first_seen_at"));
        views = raw.map((v) => ({ ...v, is_review_burst: false }));
      }

      const spend = await fetchAll<{ date: string; clicks: number | string }>((a, b) =>
        supabase
          .from("ad_spend")
          .select("date, clicks")
          .gte("date", opts.from)
          .lte("date", opts.to)
          .order("date")
          .range(a, b)
      );

      const excludedDays = new Set<string>();
      let excluded = 0;
      const viewsByDay = new Map<string, number>();
      for (const v of views) {
        const d = v.first_seen_at.slice(0, 10);
        if (v.is_review_burst) {
          excluded++;
          excludedDays.add(d);
          continue;
        }
        viewsByDay.set(d, (viewsByDay.get(d) ?? 0) + 1);
      }
      const clicksByDay = new Map<string, number>();
      for (const s of spend) clicksByDay.set(s.date, (clicksByDay.get(s.date) ?? 0) + n(s.clicks));

      // A real visit needs a click. Far more visits than clicks means a robot.
      const flagged = [...viewsByDay.entries()]
        .filter(([d, count]) => clicksByDay.has(d) && count > 2 * (clicksByDay.get(d) ?? 0) + 50)
        .sort(([a], [b]) => a.localeCompare(b));

      if (flagged.length > 0) {
        const v = flagged.reduce((sum, [, count]) => sum + count, 0);
        const c = flagged.reduce((sum, [d]) => sum + (clicksByDay.get(d) ?? 0), 0);
        items.push({
          tone: "warning",
          title: `Headline-test visits inflated · ${flagged.map(([d]) => fmtDay(d)).join(", ")}`,
          hint: "the ad-review filter missed them",
          body:
            `${int.format(v)} paid visits were counted against ${int.format(c)} Meta ad clicks on those ` +
            "days, and the ad-review filter didn't catch them. They're split evenly across the variants, " +
            "so the comparison holds, but every opt-in rate reads lower than it really is.",
        });
      }

      if (excluded > 0) {
        const days = [...excludedDays].sort().map(fmtDay).join(", ");
        items.push({
          tone: "info",
          title: `${int.format(excluded)} ad-review visits excluded`,
          hint: `headline test · ${days}`,
          body:
            `Meta loads the page hundreds of times whenever ads are published (${days}). Hours with ` +
            "20+ visitors where nobody returned or opted in are left out, so the opt-in rates below " +
            "reflect people.",
        });
      }
    } catch {
      /* ignore */
    }
  }

  const order = { critical: 0, warning: 1, info: 2 };
  return items.sort((a, b) => order[a.tone] - order[b.tone]);
}

/**
 * One quiet line per issue: dot, fact, what to do. The explanation opens on
 * click, so a healthy-ish page doesn't spend half a screen on caveats.
 */
function HealthStrip({ items }: { items: HealthItem[] }) {
  if (items.length === 0) return null;
  return (
    <section className="health" aria-label="Data problems">
      {items.map((item) => (
        <details key={item.title} className={`hrow ${item.tone}`}>
          <summary>
            <i className="hdot" aria-hidden="true" />
            <span className="htitle">{item.title}</span>
            <span className="hhint">{item.hint}</span>
            <span className="hmore" aria-hidden="true" />
          </summary>
          <p>{item.body}</p>
        </details>
      ))}
    </section>
  );
}

/* -------------------------------------------------------------------------- *
 * By ad set — where ABO budget decisions are made.
 * -------------------------------------------------------------------------- */

function AdSetTable({ rows }: { rows: ReportRow[] }) {
  type Group = {
    key: string;
    label: string;
    sub: string;
    ads: number;
    spend: number;
    leads: number;
    booked: number;
    showed: number;
    callsHeld: number;
    callsNoShow: number;
    callsPending: number;
    won: number;
    revenue: number;
  };

  const groups = new Map<string, Group>();
  for (const r of rows) {
    const unattributed = r.ad_id === NO_AD_ID;
    const key = unattributed
      ? "~unattributed"
      : r.adset_name
        ? `${r.campaign_name ?? ""}|${r.adset_name}`
        : "~nospend";

    const g: Group = groups.get(key) ?? {
      key,
      label: unattributed ? "Unattributed" : (r.adset_name ?? "Ads with no spend tracked"),
      sub: unattributed
        ? "no ad ID in the landing URL"
        : r.adset_name
          ? (r.campaign_name ?? "")
          : "campaign missing from the spend sync",
      ads: 0,
      spend: 0,
      leads: 0,
      booked: 0,
      showed: 0,
      callsHeld: 0,
      callsNoShow: 0,
      callsPending: 0,
      won: 0,
      revenue: 0,
    };

    if (!unattributed && n(r.spend) > 0) g.ads++;
    g.spend += n(r.spend);
    g.leads += n(r.leads);
    g.booked += n(r.booked);
    g.showed += n(r.showed);
    g.callsHeld += n(r.calls_held);
    g.callsNoShow += n(r.calls_no_show);
    g.callsPending += n(r.calls_pending);
    g.won += n(r.won);
    g.revenue += n(r.revenue);
    groups.set(key, g);
  }

  // Real ad sets by spend; the two catch-all rows always last.
  const list = [...groups.values()].sort(
    (a, b) => Number(a.key.startsWith("~")) - Number(b.key.startsWith("~")) || b.spend - a.spend
  );

  return (
    <div className="tablewrap">
      <table className="table">
        <thead>
          <tr>
            <th scope="col" className="left">Ad set</th>
            <th scope="col">Ads</th>
            <th scope="col">Spend</th>
            <th scope="col">Leads</th>
            <th scope="col">Booked</th>
            <th scope="col">Showed</th>
            <th scope="col">Pending</th>
            <th scope="col">Show&nbsp;rate</th>
            <th scope="col">Won</th>
            <th scope="col">CP&nbsp;lead</th>
            <th scope="col">CP&nbsp;booked</th>
            <th scope="col">CP&nbsp;show</th>
            <th scope="col">CP&nbsp;purchase</th>
            <th scope="col">Revenue</th>
            <th scope="col">ROAS</th>
          </tr>
        </thead>
        <tbody>
          {list.map((g) => {
            const calls = callOutcomes(g.callsHeld, g.callsNoShow, g.callsPending);
            const groupRoas = rate(g.revenue, g.spend);
            return (
              <tr key={g.key}>
                <th scope="row" className="left">
                  <span className="adname">{g.label}</span>
                  {g.sub && <span className="sub">{g.sub}</span>}
                </th>
                <td>{g.ads > 0 ? int.format(g.ads) : "—"}</td>
                <td>{pln.format(g.spend)}</td>
                <td>{int.format(g.leads)}</td>
                <td>{int.format(g.booked)}</td>
                <td>{int.format(g.showed)}</td>
                <td>{int.format(calls.pending)}</td>
                <td>{pct(calls.showRate)}</td>
                <td>{int.format(g.won)}</td>
                <td>{cost(g.spend, g.leads)}</td>
                <td>{cost(g.spend, g.booked)}</td>
                <td>{cost(g.spend, g.showed)}</td>
                <td>{cost(g.spend, g.won)}</td>
                <td>{pln.format(g.revenue)}</td>
                <td>
                  {groupRoas === undefined ? (
                    "—"
                  ) : (
                    <span className={`roas ${groupRoas >= 3 ? "good" : groupRoas >= 1 ? "warning" : "critical"}`}>
                      {groupRoas.toFixed(2)}×
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Tile({
  label,
  value,
  note,
  tone,
  size,
}: {
  label: string;
  value: string;
  note?: string;
  tone?: "good" | "warning" | "critical";
  /** "sm" is the secondary row — subordinate to the headline KPIs. */
  size?: "sm";
}) {
  const empty = value === "—";

  return (
    <div className={`tile${size === "sm" ? " tile-sm" : ""}${tone ? ` has-${tone}` : ""}`}>
      <div className="tile-label">{label}</div>
      <div className={`tile-value${tone ? ` ${tone}` : ""}${empty ? " empty" : ""}`}>{value}</div>
      {note &&
        (tone ? (
          <span className={`badge ${tone}`}>
            <i aria-hidden="true" />
            {note}
          </span>
        ) : (
          <div className="tile-note">{note}</div>
        ))}
    </div>
  );
}

/**
 * Ordinal bars, widest at the top. Every step is directly labelled with its
 * count and its conversion rate from the step above, so nothing depends on
 * reading a colour or hovering.
 */
function Funnel({ steps }: { steps: { label: string; value: number; note?: string }[] }) {
  const top = Math.max(1, steps[0]?.value ?? 0);

  return (
    <div className="funnel">
      {steps.map((step, i) => {
        const previous = i === 0 ? undefined : steps[i - 1].value;
        const conversion = previous === undefined ? undefined : rate(step.value, previous);
        const width = Math.max(2, (step.value / top) * 100);

        return (
          <div className="funnel-row" key={step.label}>
            <div className="funnel-label">
              <span className="funnel-idx">{i + 1}</span>
              {step.label}
            </div>
            <div className="funnel-track">
              <div
                className={`funnel-bar step-${i + 1}`}
                style={{ width: `${width}%` }}
                title={`${step.label}: ${int.format(step.value)}${
                  conversion === undefined ? "" : ` · ${pct(conversion)} of ${steps[i - 1].label.toLowerCase()}`
                }`}
              />
              <span className="funnel-value">{int.format(step.value)}</span>
            </div>
            <div className="funnel-rate">
              {step.note ??
                (conversion === undefined ? "" : `${pct(conversion)} of ${steps[i - 1].label.toLowerCase()}`)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Notice({ title, body, tone }: { title: string; body: string; tone?: "critical" }) {
  return (
    <div className={`notice${tone ? ` ${tone}` : ""}`}>
      <strong>{title}</strong>
      <span>{body}</span>
    </div>
  );
}

function Shell({
  children,
  from,
  to,
  range,
  traffic,
}: {
  children: React.ReactNode;
  from: string;
  to: string;
  range: number;
  traffic: string;
}) {
  const ranges = [7, 14, 30, 90];

  return (
    <main className="viz-root">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      {/* Stamps the stored theme before first paint — without this the page
          flashes the OS theme for a frame before the toggle's effect runs. */}
      <script
        dangerouslySetInnerHTML={{
          __html:
            "(function(){try{var t=localStorage.getItem('ds-theme');" +
            "if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t);}catch(e){}})()",
        }}
      />

      <header className="head">
        <div>
          <h1 className="h1">Funnel economics</h1>
          <p className="sub">
            {from} → {to} · {traffic === "paid" ? "paid traffic only" : "all traffic"}
          </p>
        </div>

        <nav className="filters" aria-label="Filters">
          <div className="seg" role="group" aria-label="Date range">
            {ranges.map((r) => (
              <a key={r} href={`?range=${r}&traffic=${traffic}`} className={`chip${r === range ? " on" : ""}`}>
                {r}d
              </a>
            ))}
          </div>
          <div className="seg" role="group" aria-label="Traffic">
            <a href={`?range=${range}&traffic=paid`} className={`chip${traffic === "paid" ? " on" : ""}`}>Paid</a>
            <a href={`?range=${range}&traffic=all`} className={`chip${traffic === "all" ? " on" : ""}`}>All</a>
          </div>
          <ThemeToggle />
        </nav>
      </header>

      {children}
    </main>
  );
}

/* -------------------------------------------------------------------------- */

/** Show and no-show rate over calls that have an outcome (pending excluded). */
function callOutcomes(held: number, noShow: number, pending: number) {
  const resolved = held + noShow;
  return {
    resolved,
    pending,
    showRate: rate(held, resolved),
    noShowRate: rate(noShow, resolved),
  };
}

/**
 * Cost per outcome while outcomes are still coming in. Shows the estimate as
 * the headline ("~122 zł") and the realised cost so far in the note, so the
 * real number is never hidden. Falls back to the plain realised cost when
 * nothing is pending or there is no rate to estimate from yet.
 */
function costEstimate(
  spend: number,
  actual: number,
  expected: number | undefined,
  pending: boolean
): { value: string; prefix: string } {
  const realised = cost(spend, actual);
  if (!pending || expected === undefined || !(expected > actual)) {
    return { value: realised, prefix: "" };
  }
  return {
    value: `~${pln.format(spend / expected)}`,
    prefix: realised === "—" ? "est. · " : `est. · ${realised} so far · `,
  };
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function clampRange(value: string | undefined): number {
  const parsed = Number(value);
  return [7, 14, 30, 90].includes(parsed) ? parsed : 30;
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/* -------------------------------------------------------------------------- *
 * Significance
 *
 * A two-proportion z-test: given two conversion rates and their sample sizes,
 * how likely is a gap at least this big if the headlines were actually equally
 * good? That probability is the p-value; 1 - p is what the table calls
 * confidence.
 *
 * This is the standard fixed-horizon test, which assumes you decide in advance
 * how long to run and then look once. Peeking daily and stopping at the first
 * green number inflates false positives badly — hence the note under the table.
 * -------------------------------------------------------------------------- */

function twoProportionP(
  controlLeads: number,
  controlViews: number,
  variantLeads: number,
  variantViews: number
): number | undefined {
  if (controlViews < 1 || variantViews < 1) return undefined;

  const p1 = controlLeads / controlViews;
  const p2 = variantLeads / variantViews;

  const pooled = (controlLeads + variantLeads) / (controlViews + variantViews);
  if (pooled <= 0 || pooled >= 1) return undefined;

  const se = Math.sqrt(pooled * (1 - pooled) * (1 / controlViews + 1 / variantViews));
  if (!Number.isFinite(se) || se === 0) return undefined;

  const z = Math.abs(p2 - p1) / se;
  return 2 * (1 - normalCdf(z));
}

/** Φ(z) via Abramowitz & Stegun 7.1.26 — accurate to ~1e-7, plenty here. */
function normalCdf(z: number): number {
  const sign = z < 0 ? -1 : 1;
  const x = Math.abs(z) / Math.SQRT2;

  const t = 1 / (1 + 0.3275911 * x);
  const y =
    1 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) *
      t *
      Math.exp(-x * x);

  return 0.5 * (1 + sign * y);
}

/**
 * Turns a p-value into something you can act on. "Too early" is a real answer
 * and by far the most common one — saying it plainly beats showing 63% and
 * letting it read as a result.
 */
function confidenceLabel(
  p: number | undefined,
  views: number,
  leads: number,
  controlViews: number
): React.ReactNode {
  if (p === undefined) return "—";
  if (views < 200 || controlViews < 200 || leads < 5) {
    return <span className="verdict muted">too early</span>;
  }

  const confidence = (1 - p) * 100;

  if (p < 0.05) return <span className="verdict good">{confidence.toFixed(0)}% · call it</span>;
  if (p < 0.2) return <span className="verdict warning">{confidence.toFixed(0)}% · leaning</span>;
  return <span className="verdict muted">{confidence.toFixed(0)}% · keep running</span>;
}

/* -------------------------------------------------------------------------- *
 * Styles
 *
 * Scoped to .viz-root, written against roles so light/dark swap in one place.
 * The ordinal funnel ramp is one hue light→dark (never a rainbow); status
 * colours are reserved and always paired with the number itself, never
 * carrying meaning alone.
 * -------------------------------------------------------------------------- */

const CSS = `
/* --------------------------------------------------------------------------
 * Dark analytics console. Scoped to .viz-root so nothing leaks into the
 * marketing pages.
 *
 * Dark is FORCED here, not OS-dependent: this is an operator's tool behind
 * auth, and a console that flips to white in daylight is not the same product.
 *
 * Chrome recedes to near-invisible hairlines; the numbers carry the page. Cells
 * are divided by 1px gaps over a border-coloured grid rather than floated as
 * separate cards — one instrument panel, not a tray of boxes.
 *
 * DATA colour is unchanged and still validated: the funnel is one ordinal hue
 * light→dark, no step darker than #184f95 (clears the 2:1 ordinal floor against
 * this surface), and the status palette stays reserved, always paired with a
 * dot AND words so colour never carries meaning alone.
 * -------------------------------------------------------------------------- */

.viz-root {
  color-scheme: light;

  --plane:          #fafaf9;
  --panel:          #ffffff;
  --panel-2:        #f5f5f3;
  --panel-hover:    #fafaf9;
  --border:         rgba(11, 11, 11, 0.09);
  --border-strong:  rgba(11, 11, 11, 0.15);
  --text-primary:   #0b0b0b;
  --text-secondary: #52514e;
  --text-muted:     #85837c;
  --empty:          #c9c7c1;
  --chip-on:        #ffffff;
  --chip-on-edge:   rgba(11, 11, 11, 0.06);
  --badge-bg:       rgba(11, 11, 11, 0.02);
  --idx-bg:         rgba(11, 11, 11, 0.03);
  --wash:           rgba(90, 120, 220, 0.05);
  --good:     #0ca30c;
  --warning:  #b07400;
  --critical: #d03b3b;
  --step-1: #86b6ef;
  --step-2: #5598e7;
  --step-3: #3987e5;
  --step-4: #2a78d6;
  --step-5: #1c5cab;
  --step-6: #184f95;
  --step-7: #104281;

  --accent: #ea580c;

  --radius:    10px;
  --radius-sm: 7px;

  position: relative;
  background: var(--plane);
  color: var(--text-primary);
  min-height: 100vh;
  padding: 0 24px 96px;
  font: 13.5px/1.5 ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* OS preference — yields to an explicit stamp in either direction. */
@media (prefers-color-scheme: dark) {
  :root:where(:not([data-theme="light"])) .viz-root {
    color-scheme: dark;
  --plane:          #08090a;
  --panel:          #0f1011;
  --panel-2:        #151617;
  --panel-hover:    #141516;
  --border:         rgba(255, 255, 255, 0.07);
  --border-strong:  rgba(255, 255, 255, 0.13);
  --text-primary:   #f2f3f4;
  --text-secondary: #a1a6ad;
  --text-muted:     #6b7078;
  --empty:          #35383c;
  --chip-on:        #232427;
  --chip-on-edge:   rgba(255, 255, 255, 0.06);
  --badge-bg:       rgba(255, 255, 255, 0.03);
  --idx-bg:         rgba(255, 255, 255, 0.04);
  --wash:           rgba(90, 120, 220, 0.07);
  --good:     #0ca30c;
  --warning:  #fab219;
  --critical: #e06666;
  --step-1: #184f95;
  --step-2: #1c5cab;
  --step-3: #256abf;
  --step-4: #2a78d6;
  --step-5: #3987e5;
  --step-6: #5598e7;
  --step-7: #6da7ec;
  }
}

/* The toggle's explicit choice — wins over the OS. */
:root[data-theme="dark"] .viz-root {
  color-scheme: dark;
  --plane:          #08090a;
  --panel:          #0f1011;
  --panel-2:        #151617;
  --panel-hover:    #141516;
  --border:         rgba(255, 255, 255, 0.07);
  --border-strong:  rgba(255, 255, 255, 0.13);
  --text-primary:   #f2f3f4;
  --text-secondary: #a1a6ad;
  --text-muted:     #6b7078;
  --empty:          #35383c;
  --chip-on:        #232427;
  --chip-on-edge:   rgba(255, 255, 255, 0.06);
  --badge-bg:       rgba(255, 255, 255, 0.03);
  --idx-bg:         rgba(255, 255, 255, 0.04);
  --wash:           rgba(90, 120, 220, 0.07);
  --good:     #0ca30c;
  --warning:  #fab219;
  --critical: #e06666;
  --step-1: #184f95;
  --step-2: #1c5cab;
  --step-3: #256abf;
  --step-4: #2a78d6;
  --step-5: #3987e5;
  --step-6: #5598e7;
  --step-7: #6da7ec;
}

/* A single cool wash at the top edge — the only decoration on the page. */
.viz-root::before {
  content: "";
  position: absolute; inset: 0 0 auto 0; height: 380px;
  background: radial-gradient(58% 100% at 50% 0%, var(--wash), transparent 72%);
  pointer-events: none;
}

.viz-root * { box-sizing: border-box; }
.viz-root > * { position: relative; max-width: 1280px; margin-inline: auto; }
.viz-root :focus-visible {
  outline: 1px solid var(--accent);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}

/* ---- app bar ----------------------------------------------------------- */
.head {
  display: flex; flex-wrap: wrap; gap: 18px;
  align-items: center; justify-content: space-between;
  padding: 22px 0 20px;
  margin-bottom: 26px;
  border-bottom: 1px solid var(--border);
}
.h1 {
  margin: 0; font-size: 15px; font-weight: 600;
  letter-spacing: -0.005em; color: var(--text-primary);
}
.sub {
  margin: 3px 0 0; font-size: 12px; color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}
.h2 {
  display: flex; align-items: center; gap: 10px;
  margin-block: 34px 10px; font-size: 10.5px; font-weight: 600;
  text-transform: uppercase; letter-spacing: 0.11em;
  color: var(--text-muted);
}

/* ---- segmented controls ------------------------------------------------ */
.filters { display: flex; gap: 8px; flex-wrap: wrap; }
.seg {
  display: flex; gap: 1px; padding: 2px;
  background: var(--panel); border: 1px solid var(--border);
  border-radius: var(--radius-sm);
}
.chip {
  padding: 4px 11px; font-size: 12px; font-weight: 500;
  color: var(--text-muted); text-decoration: none;
  border-radius: 5px;
  transition: background 110ms ease, color 110ms ease;
}
.chip:hover { color: var(--text-primary); background: var(--panel-2); }

.themebtn {
  display: inline-flex; align-items: center; justify-content: center;
  width: 32px; height: 32px; flex: none; padding: 0;
  background: var(--panel); border: 1px solid var(--border);
  border-radius: var(--radius-sm); color: var(--text-secondary);
  cursor: pointer;
  transition: background 110ms ease, color 110ms ease, border-color 110ms ease;
}
.themebtn:hover { background: var(--panel-2); color: var(--text-primary); border-color: var(--border-strong); }
.themebtn-icon { display: inline-flex; width: 15px; height: 15px; }
.chip.on {
  background: var(--chip-on); color: var(--text-primary); font-weight: 550;
  box-shadow: inset 0 1px 0 var(--chip-on-edge), 0 1px 2px rgba(11, 11, 11, 0.06);
}

/* ---- the hairline grid: one panel, cells divided by 1px of border ------- */
.tiles {
  display: grid; gap: 1px;
  grid-template-columns: repeat(auto-fit, minmax(186px, 1fr));
  background: var(--border);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
}
.tiles.dense { grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); }

.tile {
  position: relative;
  background: var(--panel);
  padding: 16px 18px 15px;
  min-height: 108px;
  display: flex; flex-direction: column;
  transition: background 120ms ease;
}
.tile:hover { background: var(--panel-hover); }
.tile-sm { min-height: 94px; padding: 14px 16px 13px; }

.tile-label {
  font-size: 10.5px; font-weight: 600; letter-spacing: 0.09em;
  text-transform: uppercase; color: var(--text-muted);
}
.tile-value {
  font-size: 30px; font-weight: 600; letter-spacing: -0.035em;
  line-height: 1.08; margin-top: 10px; color: var(--text-primary);
}
.tile-sm .tile-value { font-size: 23px; margin-top: 8px; letter-spacing: -0.03em; }
.tile-value.good { color: var(--good); }
.tile-value.warning { color: var(--warning); }
.tile-value.critical { color: var(--critical); }
.tile-value.empty { color: var(--empty); font-weight: 500; letter-spacing: 0; }
.tile-note {
  font-size: 11px; color: var(--text-muted);
  margin-top: auto; padding-top: 10px;
  font-variant-numeric: tabular-nums;
}

.badge {
  display: inline-flex; align-items: center; gap: 6px; align-self: flex-start;
  margin-top: auto; padding: 2px 8px 2px 6px;
  font-size: 10.5px; font-weight: 550; line-height: 1.6;
  border-radius: 999px; border: 1px solid var(--border-strong);
  background: var(--badge-bg); color: var(--text-secondary);
}
.badge i { width: 5px; height: 5px; border-radius: 999px; flex: none; }
.badge.good i { background: var(--good); }
.badge.warning i { background: var(--warning); }
.badge.critical i { background: var(--critical); }
.badge.good { color: var(--good); }
.badge.warning { color: var(--warning); }
.badge.critical { color: var(--critical); }

/* status hairline along the cell's top edge */
.tile.has-good::before, .tile.has-warning::before, .tile.has-critical::before {
  content: ""; position: absolute; inset: 0 0 auto 0; height: 1px;
}
.tile.has-good::before { background: var(--good); }
.tile.has-warning::before { background: var(--warning); }
.tile.has-critical::before { background: var(--critical); }

/* ---- panels ------------------------------------------------------------ */
.card {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 18px 20px;
}

/* ---- funnel ------------------------------------------------------------ */
.funnel { display: flex; flex-direction: column; }
.funnel-row {
  display: grid; grid-template-columns: 150px 1fr 176px; gap: 18px;
  align-items: center; padding: 8px 6px;
  border-bottom: 1px solid var(--border);
  transition: background 110ms ease;
}
.funnel-row:last-child { border-bottom: 0; }
.funnel-row:hover { background: var(--panel-hover); }
.funnel-label {
  display: flex; align-items: center; gap: 10px;
  font-size: 12.5px; font-weight: 500; color: var(--text-secondary);
}
.funnel-idx {
  display: inline-flex; align-items: center; justify-content: center;
  width: 17px; height: 17px; flex: none; border-radius: 5px;
  background: var(--idx-bg); border: 1px solid var(--border);
  font-size: 10px; font-weight: 600; color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}
.funnel-track { position: relative; display: flex; align-items: center; gap: 10px; min-height: 24px; }
.funnel-bar {
  height: 16px; border-radius: 0 4px 4px 0; min-width: 3px;
  transition: filter 130ms ease;
}
.funnel-row:hover .funnel-bar { filter: brightness(1.14); }
.funnel-bar.step-1 { background: var(--step-1); }
.funnel-bar.step-2 { background: var(--step-2); }
.funnel-bar.step-3 { background: var(--step-3); }
.funnel-bar.step-4 { background: var(--step-4); }
.funnel-bar.step-5 { background: var(--step-5); }
.funnel-bar.step-6 { background: var(--step-6); }
.funnel-bar.step-7 { background: var(--step-7); }
.funnel-value {
  font-size: 12.5px; font-weight: 600; font-variant-numeric: tabular-nums;
  color: var(--text-primary);
}
.funnel-rate {
  font-size: 11.5px; color: var(--text-muted); text-align: right;
  font-variant-numeric: tabular-nums;
}

/* ---- tables ------------------------------------------------------------ */
.tablewrap {
  overflow-x: auto;
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: var(--radius);
}
.table { width: 100%; border-collapse: separate; border-spacing: 0; font-size: 12.5px; min-width: 980px; }
.table th, .table td {
  padding: 9px 14px; text-align: right; white-space: nowrap;
  border-bottom: 1px solid var(--border);
  font-variant-numeric: tabular-nums;
}
.table thead th {
  position: sticky; top: 0; z-index: 1;
  font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em;
  color: var(--text-muted); background: var(--panel-2);
  padding-top: 9px; padding-bottom: 9px;
}
.table .left { text-align: left; }
.table tbody th { font-weight: 500; }
.table tbody tr { transition: background 100ms ease; }
.table tbody tr:hover { background: var(--panel-hover); }
.table tbody tr:last-child td, .table tbody tr:last-child th { border-bottom: 0; }
.adname {
  display: block; color: var(--text-primary); font-weight: 500;
  max-width: 300px; overflow: hidden; text-overflow: ellipsis;
}
.table .sub { display: block; font-size: 10.5px; color: var(--text-muted); margin: 2px 0 0; }
.table tfoot th, .table tfoot td {
  font-weight: 650; border-bottom: 0;
  border-top: 1px solid var(--border-strong);
  background: var(--panel-2); color: var(--text-primary);
}
.verdict { font-size: 11.5px; font-weight: 600; white-space: nowrap; }
.verdict.good { color: var(--good); }
.verdict.warning { color: var(--warning); }
.verdict.muted { color: var(--text-muted); font-weight: 500; }

.roas { font-weight: 600; }
.roas.good { color: var(--good); }
.roas.warning { color: var(--warning); }
.roas.critical { color: var(--critical); }

/* ---- notice ------------------------------------------------------------ */
.notice {
  display: flex; flex-direction: column; gap: 5px;
  border: 1px solid var(--border);
  border-left: 2px solid var(--border-strong);
  background: var(--panel);
  border-radius: var(--radius);
  padding: 16px 18px; color: var(--text-secondary); font-size: 12.5px;
}
.notice strong { color: var(--text-primary); font-weight: 600; }
.notice.critical { border-left-color: var(--critical); }
.notice.warning { border-left-color: var(--warning); }

/* ---- data health strip -------------------------------------------------- */
/* margin-block only: a margin shorthand would cancel the column's auto inline
   margins and pin the strip to the page edge. */
.health {
  margin-block: 0 14px;
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
}
.hrow + .hrow { border-top: 1px solid var(--border); }
.hrow > summary {
  display: flex; align-items: center; gap: 10px;
  min-height: 34px; padding: 7px 14px;
  font-size: 12px; line-height: 1.4;
  list-style: none; cursor: pointer;
  transition: background 100ms ease;
}
.hrow > summary::-webkit-details-marker { display: none; }
.hrow > summary:hover { background: var(--panel-hover); }
.hdot { width: 6px; height: 6px; border-radius: 999px; flex: none; background: var(--text-muted); }
.hrow.critical .hdot { background: var(--critical); }
.hrow.warning .hdot { background: var(--warning); }
.htitle {
  color: var(--text-primary); font-weight: 550; white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
.hrow.info .htitle { color: var(--text-secondary); font-weight: 500; }
.hhint {
  flex: 1; min-width: 0;
  color: var(--text-muted);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.hhint::before { content: "— "; }
.hmore {
  flex: none; width: 7px; height: 7px; margin-left: auto;
  border-right: 1.5px solid var(--text-muted); border-bottom: 1.5px solid var(--text-muted);
  transform: rotate(45deg) translateY(-2px);
  transition: transform 120ms ease;
}
.hrow[open] .hmore { transform: rotate(-135deg) translateY(-1px); }
.hrow > p {
  margin: 0; padding: 0 14px 11px 30px; max-width: 92ch;
  font-size: 12px; line-height: 1.55; color: var(--text-secondary);
}

.foot {
  margin-top: 26px; font-size: 11.5px; line-height: 1.7;
  color: var(--text-muted); max-width: 74ch;
}

@media (max-width: 720px) {
  .viz-root { padding: 0 14px 72px; }
  .head { align-items: flex-start; }
  .funnel-row { grid-template-columns: 124px 1fr; gap: 10px; }
  .funnel-rate { grid-column: 2; text-align: left; padding-left: 2px; }
  .hhint { display: none; }
  .htitle { white-space: normal; }
}
`;
