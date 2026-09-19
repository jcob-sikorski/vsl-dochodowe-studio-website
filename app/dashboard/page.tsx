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
      <section className="tiles dense" aria-label="Cost per stage">
        <Tile size="sm" label="Per lead" value={cost(totals.spend, totals.leads)} note={`${int.format(totals.leads)} leads`} />
        <Tile size="sm" label="Per for qualification" value={cost(totals.spend, totals.forQualification)} note={`${int.format(totals.forQualification)} for qualification`} />
        <Tile size="sm" label="Per qualified" value={cost(totals.spend, totals.qualified)} note={`${int.format(totals.qualified)} qualified`} />
        <Tile size="sm" label="Per booked call" value={cost(totals.spend, totals.booked)} note={`${int.format(totals.booked)} booked`} />
        <Tile size="sm" label="Per show" value={cost(totals.spend, totals.showed)} note={`${int.format(totals.showed)} showed`} />
        <Tile size="sm" label="Per purchase" value={cost(totals.spend, totals.won)} note={`${int.format(totals.won)} won`} />
      </section>

      {/* ---- funnel -------------------------------------------------- */}
      <h2 className="h2">Funnel</h2>
      <div className="card">
        <Funnel steps={funnel} />
      </div>

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
  margin: 34px 0 10px; font-size: 10.5px; font-weight: 600;
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

.foot {
  margin-top: 26px; font-size: 11.5px; line-height: 1.7;
  color: var(--text-muted); max-width: 74ch;
}

@media (max-width: 720px) {
  .viz-root { padding: 0 14px 72px; }
  .head { align-items: flex-start; }
  .funnel-row { grid-template-columns: 124px 1fr; gap: 10px; }
  .funnel-rate { grid-column: 2; text-align: left; padding-left: 2px; }
}
`;
