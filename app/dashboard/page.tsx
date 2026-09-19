/* -------------------------------------------------------------------------- *
 * src/app/dashboard/page.tsx
 *
 * Paid funnel economics: spend joined to pipeline outcomes on ad_id.
 *
 * Server component. Lead PII never reaches the browser — only aggregates do.
 * Protected by HTTP Basic Auth in src/middleware.ts.
 * -------------------------------------------------------------------------- */

import { HEADLINE_EXPERIMENT, getVariant } from "@/lib/ab";
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
  showed: number | string;
  no_shows: number | string;
  won: number | string;
  revenue: number | string;
}

interface AbRow {
  experiment_id: string | null;
  variant_id: string | null;
  views: number | string;
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
  showed: number;
  noShows: number;
  won: number;
  revenue: number;
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

  const totals: Totals = rows.reduce<Totals>(
    (acc, r) => ({
      spend: acc.spend + n(r.spend),
      impressions: acc.impressions + n(r.impressions),
      clicks: acc.clicks + n(r.clicks),
      leads: acc.leads + n(r.leads),
      forQualification: acc.forQualification + n(r.for_qualification),
      qualified: acc.qualified + n(r.qualified),
      booked: acc.booked + n(r.booked),
      showed: acc.showed + n(r.showed),
      noShows: acc.noShows + n(r.no_shows),
      won: acc.won + n(r.won),
      revenue: acc.revenue + n(r.revenue),
    }),
    {
      spend: 0, impressions: 0, clicks: 0, leads: 0, forQualification: 0,
      qualified: 0, booked: 0, showed: 0, noShows: 0, won: 0, revenue: 0,
    }
  );

  const roas = rate(totals.revenue, totals.spend);

  const funnel = [
    { label: "Leads", value: totals.leads },
    { label: "For qualification", value: totals.forQualification },
    { label: "Qualified", value: totals.qualified },
    { label: "Booked", value: totals.booked },
    { label: "Showed", value: totals.showed },
    { label: "Won", value: totals.won },
  ];

  return (
    <Shell from={from} to={to} range={range} traffic={traffic}>
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
        <Tile label="Show rate" value={pct(rate(totals.showed, totals.booked))} note={`${int.format(totals.showed)} of ${int.format(totals.booked)} booked`} />
      </section>

      {/* ---- cost per stage ------------------------------------------ */}
      <h2 className="h2">Cost per stage</h2>
      <section className="tiles" aria-label="Cost per stage">
        <Tile label="Per lead" value={cost(totals.spend, totals.leads)} note={`${int.format(totals.leads)} leads`} />
        <Tile label="Per for qualification" value={cost(totals.spend, totals.forQualification)} note={`${int.format(totals.forQualification)} for qualification`} />
        <Tile label="Per qualified" value={cost(totals.spend, totals.qualified)} note={`${int.format(totals.qualified)} qualified`} />
        <Tile label="Per booked call" value={cost(totals.spend, totals.booked)} note={`${int.format(totals.booked)} booked`} />
        <Tile label="Per show" value={cost(totals.spend, totals.showed)} note={`${int.format(totals.showed)} showed`} />
        <Tile label="Per purchase" value={cost(totals.spend, totals.won)} note={`${int.format(totals.won)} won`} />
      </section>

      {/* ---- funnel -------------------------------------------------- */}
      <h2 className="h2">Funnel</h2>
      <Funnel steps={funnel} />

      {/* ---- headline split test ------------------------------------- */}
      <h2 className="h2">Headline test · {HEADLINE_EXPERIMENT.id}</h2>
      <AbTest rows={abRows} error={ab.error?.message} traffic={traffic} />

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
                <th scope="col">Show&nbsp;rate</th>
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

                return (
                  <tr key={`${r.ad_id ?? "none"}-${i}`}>
                    <th scope="row" className="left">
                      <span className="adname">{r.ad_name || r.ad_id || "(no ad id)"}</span>
                      {r.campaign_name && <span className="sub">{r.campaign_name}</span>}
                    </th>
                    <td>{pln.format(spend)}</td>
                    <td>{int.format(leads)}</td>
                    <td>{int.format(n(r.for_qualification))}</td>
                    <td>{int.format(n(r.qualified))}</td>
                    <td>{int.format(booked)}</td>
                    <td>{int.format(showed)}</td>
                    <td>{pct(rate(showed, booked))}</td>
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
                <td>{pct(rate(totals.showed, totals.booked))}</td>
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
        ranges understate ROAS until the pipeline catches up.
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
  const totalLeads = sorted.reduce((sum, r) => sum + n(r.leads), 0);

  return (
    <>
      <section className="tiles" aria-label="Split test headline metrics">
        <Tile label="Visitors bucketed" value={int.format(totalViews)} note="unique browsers" />
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
        the next morning lands in the denominator here and the numerator later.
      </p>
    </>
  );
}

function Tile({
  label,
  value,
  note,
  tone,
}: {
  label: string;
  value: string;
  note?: string;
  tone?: "good" | "warning" | "critical";
}) {
  return (
    <div className="tile">
      <div className="tile-label">{label}</div>
      <div className={`tile-value${tone ? ` ${tone}` : ""}`}>{value}</div>
      {note && <div className="tile-note">{note}</div>}
    </div>
  );
}

/**
 * Ordinal bars, widest at the top. Every step is directly labelled with its
 * count and its conversion rate from the step above, so nothing depends on
 * reading a colour or hovering.
 */
function Funnel({ steps }: { steps: { label: string; value: number }[] }) {
  const top = Math.max(1, steps[0]?.value ?? 0);

  return (
    <div className="funnel">
      {steps.map((step, i) => {
        const previous = i === 0 ? undefined : steps[i - 1].value;
        const conversion = previous === undefined ? undefined : rate(step.value, previous);
        const width = Math.max(2, (step.value / top) * 100);

        return (
          <div className="funnel-row" key={step.label}>
            <div className="funnel-label">{step.label}</div>
            <div className="funnel-track">
              <div className={`funnel-bar step-${i + 1}`} style={{ width: `${width}%` }} />
              <span className="funnel-value">{int.format(step.value)}</span>
            </div>
            <div className="funnel-rate">
              {conversion === undefined ? "" : `${pct(conversion)} of ${steps[i - 1].label.toLowerCase()}`}
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
        </nav>
      </header>

      {children}
    </main>
  );
}

/* -------------------------------------------------------------------------- */

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
.viz-root {
  color-scheme: light;
  --surface-1: #fcfcfb;
  --surface-2: #f4f3f0;
  --border: #e3e1dc;
  --text-primary: #0b0b0b;
  --text-secondary: #52514e;
  --text-muted: #85837c;
  --good: #0ca30c;
  --warning: #b07400;
  --critical: #d03b3b;
  --step-1: #86b6ef;
  --step-2: #5598e7;
  --step-3: #3987e5;
  --step-4: #2a78d6;
  --step-5: #1c5cab;
  --accent: #ea580c;

  background: var(--surface-1);
  color: var(--text-primary);
  min-height: 100vh;
  padding: 24px 16px 64px;
  font: 14px/1.5 ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  -webkit-font-smoothing: antialiased;
}
@media (prefers-color-scheme: dark) {
  :root:where(:not([data-theme="light"])) .viz-root {
    color-scheme: dark;
    --surface-1: #1a1a19;
    --surface-2: #232322;
    --border: #383835;
    --text-primary: #ffffff;
    --text-secondary: #c3c2b7;
    --text-muted: #8f8e85;
    --good: #0ca30c;
    --warning: #fab219;
    --critical: #e06666;
    --step-1: #184f95;
    --step-2: #256abf;
    --step-3: #2a78d6;
    --step-4: #3987e5;
    --step-5: #5598e7;
  }
}
.viz-root * { box-sizing: border-box; }
.viz-root > * { max-width: 1200px; margin-inline: auto; }

.head {
  display: flex; flex-wrap: wrap; gap: 16px;
  align-items: flex-end; justify-content: space-between;
  margin-bottom: 28px;
}
.h1 { margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.01em; }
.h2 { margin: 32px 0 12px; font-size: 13px; font-weight: 600; text-transform: uppercase;
      letter-spacing: 0.06em; color: var(--text-muted); }
.sub { margin: 4px 0 0; font-size: 13px; color: var(--text-secondary); }

.filters { display: flex; gap: 8px; flex-wrap: wrap; }
.seg { display: flex; border: 1px solid var(--border); border-radius: 8px; overflow: hidden; }
.chip {
  padding: 6px 12px; font-size: 13px; color: var(--text-secondary);
  text-decoration: none; background: var(--surface-1);
  border-right: 1px solid var(--border);
}
.seg .chip:last-child { border-right: 0; }
.chip:hover { background: var(--surface-2); color: var(--text-primary); }
.chip.on { background: var(--accent); color: #fff; }

.tiles { display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); }
.tile {
  background: var(--surface-2); border: 1px solid var(--border);
  border-radius: 10px; padding: 14px 16px;
}
.tile-label { font-size: 12px; color: var(--text-secondary); }
.tile-value { font-size: 26px; font-weight: 700; letter-spacing: -0.02em; margin-top: 2px;
              font-variant-numeric: tabular-nums; }
.tile-value.good { color: var(--good); }
.tile-value.warning { color: var(--warning); }
.tile-value.critical { color: var(--critical); }
.tile-note { font-size: 11px; color: var(--text-muted); margin-top: 4px; }

.funnel { display: flex; flex-direction: column; gap: 6px; }
.funnel-row { display: grid; grid-template-columns: 92px 1fr 170px; gap: 12px; align-items: center; }
.funnel-label { font-size: 13px; color: var(--text-secondary); }
.funnel-track { position: relative; display: flex; align-items: center; gap: 8px; min-height: 26px; }
.funnel-bar { height: 18px; border-radius: 0 4px 4px 0; }
.funnel-bar.step-1 { background: var(--step-1); }
.funnel-bar.step-2 { background: var(--step-2); }
.funnel-bar.step-3 { background: var(--step-3); }
.funnel-bar.step-4 { background: var(--step-4); }
.funnel-bar.step-5 { background: var(--step-5); }
.funnel-value { font-size: 13px; font-weight: 600; font-variant-numeric: tabular-nums;
                color: var(--text-primary); }
.funnel-rate { font-size: 12px; color: var(--text-muted); text-align: right; }

.tablewrap { overflow-x: auto; border: 1px solid var(--border); border-radius: 10px; }
.table { width: 100%; border-collapse: collapse; font-size: 13px; min-width: 940px; }
.table th, .table td {
  padding: 9px 12px; text-align: right; white-space: nowrap;
  border-bottom: 1px solid var(--border); font-variant-numeric: tabular-nums;
}
.table thead th {
  font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em;
  color: var(--text-muted); background: var(--surface-2);
}
.table .left { text-align: left; }
.table tbody th { font-weight: 500; }
.table tbody tr:hover { background: var(--surface-2); }
.adname { display: block; color: var(--text-primary); max-width: 260px; overflow: hidden;
          text-overflow: ellipsis; }
.table .sub { display: block; font-size: 11px; color: var(--text-muted); margin: 0; }
.table tfoot th, .table tfoot td { font-weight: 700; border-bottom: 0; background: var(--surface-2); }
.verdict { font-size: 12px; font-weight: 600; white-space: nowrap; }
.verdict.good { color: var(--good); }
.verdict.warning { color: var(--warning); }
.verdict.muted { color: var(--text-muted); font-weight: 500; }

.roas.good { color: var(--good); }
.roas.warning { color: var(--warning); }
.roas.critical { color: var(--critical); }

.notice {
  display: flex; flex-direction: column; gap: 4px;
  border: 1px solid var(--border); background: var(--surface-2);
  border-radius: 10px; padding: 16px; color: var(--text-secondary); font-size: 13px;
}
.notice strong { color: var(--text-primary); }
.notice.critical { border-color: var(--critical); }

.foot { margin-top: 24px; font-size: 12px; color: var(--text-muted); max-width: 70ch; }

@media (max-width: 640px) {
  .funnel-row { grid-template-columns: 74px 1fr; }
  .funnel-rate { grid-column: 2; text-align: left; }
}
`;
