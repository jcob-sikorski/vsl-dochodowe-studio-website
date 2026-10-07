/* -------------------------------------------------------------------------- *
 * src/lib/leads.ts
 *
 * The funnel ledger: one row per lead, one timestamp per stage.
 *
 * This is what makes cost-per-anything computable. Meta knows spend but not
 * your pipeline; GHL knows your pipeline but not spend. This table is where
 * they meet, joined on ad_id.
 *
 * Every function here is best-effort and never throws — a Supabase outage must
 * degrade reporting, not lose a lead.
 * -------------------------------------------------------------------------- */

import type { Attribution } from "./attribution";
import { hasPaidClick } from "./attribution";
import { getSupabase, isSupabaseConfigured } from "./supabase";

/**
 * supabase-js catches a transport-level failure inside its own promise chain and
 * returns it as a PostgrestError whose `message` is just `String(thrownError)`.
 * For a network failure that is the bare "TypeError: fetch failed" — the reason
 * that actually matters (ENOTFOUND, ECONNREFUSED, ENETUNREACH, a TLS error) sits
 * in `details`/`code`, or in the original error's `cause`, and Node never puts
 * `cause` into the message. Logging `message` alone is exactly how an outage
 * becomes impossible to diagnose after the fact.
 */
function describeSupabaseError(
  error: { message?: string; details?: string; hint?: string; code?: string } | null
): string {
  if (!error) return "unknown";
  const parts = [
    error.message?.trim(),
    error.code?.trim() ? `code=${error.code.trim()}` : "",
    error.hint?.trim() ? `hint=${error.hint.trim()}` : "",
    error.details?.trim() ? `details=${error.details.trim().slice(0, 400)}` : "",
  ];
  return parts.filter(Boolean).join(" | ") || "unknown";
}

/** Same problem for a thrown error: the real reason hides in `.cause`. */
function describeThrown(err: unknown): string {
  if (!(err instanceof Error)) return String(err);
  const cause = (err as { cause?: unknown }).cause;
  if (cause instanceof Error) {
    const code = (cause as { code?: string }).code;
    return `${err.name}: ${err.message} | cause=${cause.name}: ${cause.message}${code ? ` (${code})` : ""}`;
  }
  return cause ? `${err.name}: ${err.message} | cause=${String(cause)}` : `${err.name}: ${err.message}`;
}

/**
 * A real round trip, for the /api/conversion health check.
 *
 * `supabaseConfigured` only proves the environment variables exist. This proves
 * the running deployment can actually reach the database right now — and when it
 * can't, says why.
 */
export async function pingSupabase(): Promise<{
  ok: boolean;
  skipped?: boolean;
  error?: string;
  ms: number;
}> {
  const startedAt = Date.now();
  const supabase = getSupabase();
  if (!supabase) return { ok: false, skipped: true, error: "supabase_not_configured", ms: 0 };

  try {
    const { error } = await supabase.from("leads").select("id").limit(1);
    const ms = Date.now() - startedAt;
    return error ? { ok: false, error: describeSupabaseError(error), ms } : { ok: true, ms };
  } catch (err) {
    return { ok: false, error: describeThrown(err), ms: Date.now() - startedAt };
  }
}

/** The stages a lead can pass through. Order is the funnel order. */
export const LEAD_STAGES = [
  "opted_in",
  "for_qualification",
  "qualified",
  "booked",
  "rescheduled",
  "showed",
  "no_show",
  "proposal_sent",
  "won",
  "lost",
  "disqualified",
] as const;

export type LeadStage = (typeof LEAD_STAGES)[number];

export interface LeadOptInInput {
  ghlContactId?: string;
  email: string;
  phone?: string;
  fullName?: string;
  attribution: Attribution;
  metaEventId?: string;
  /** Which split test this lead was in, and which variant they were shown. */
  abExperimentId?: string;
  abVariantId?: string;
  /** Ties the lead back to its row in ab_views — the opt-in rate's numerator. */
  abVisitorId?: string;
}

export interface LeadStageInput {
  ghlContactId?: string;
  email?: string;
  stage: LeadStage;
  /** Defaults to now. Pass the real event time when replaying history. */
  at?: Date;
  revenue?: number;
  currency?: string;
}

export interface LeadResult {
  ok: boolean;
  leadId?: string;
  skipped?: boolean;
  error?: string;
  /**
   * Stage writes only: true the first time this lead reaches this stage. The
   * pipeline loops (Booked Call → For Qualification → Booked Call…), so a stage
   * can fire many times; Meta should hear about the first one only.
   * Undefined when the database couldn't tell (old schema).
   */
  firstTime?: boolean;
}

/** Records the opt-in. Called by /api/register after the GHL upsert. */
export async function recordLeadOptIn(input: LeadOptInInput): Promise<LeadResult> {
  const supabase = getSupabase();
  if (!supabase) return { ok: false, skipped: true, error: "supabase_not_configured" };

  const a = input.attribution;

  try {
    const { data, error } = await supabase.rpc("upsert_lead", {
      p_lead: {
        ghl_contact_id: input.ghlContactId ?? null,
        email: input.email,
        phone: input.phone ?? null,
        full_name: input.fullName ?? null,

        ad_id: a.ad_id ?? null,
        adset_id: a.adset_id ?? null,
        campaign_id: a.campaign_id ?? null,
        utm_source: a.utm_source ?? null,
        utm_medium: a.utm_medium ?? null,
        utm_campaign: a.utm_campaign ?? null,
        utm_content: a.utm_content ?? null,
        utm_term: a.utm_term ?? null,
        utm_id: a.utm_id ?? null,
        fbclid: a.fbclid ?? null,
        fbc: a.fbc ?? null,
        fbp: a.fbp ?? null,
        landing_url: a.landing_url ?? null,
        referrer: a.referrer ?? null,

        traffic_type: hasPaidClick(a) ? "paid" : "organic",
        meta_event_id: input.metaEventId ?? null,

        ab_experiment_id: input.abExperimentId ?? null,
        ab_variant_id: input.abVariantId ?? null,
        ab_visitor_id: input.abVisitorId ?? null,
      },
    });

    if (error) {
      const described = describeSupabaseError(error);
      console.error(`[leads] opt-in insert failed: ${described}`);
      return { ok: false, error: described };
    }

    return { ok: true, leadId: typeof data === "string" ? data : undefined };
  } catch (err) {
    console.error(`[leads] opt-in insert threw: ${describeThrown(err)}`);
    return { ok: false, error: describeThrown(err) };
  }
}

/**
 * Records a funnel stage move. Called by /api/conversion on every GHL stage move.
 *
 * record_lead_event appends the move to lead_stage_events (the call history the
 * show rate is computed from), keeps the first-occurrence stamps on `leads`, and
 * reports whether this is the lead's first time at the stage. Falls back to
 * record_lead_stage if the 2026-10-07 migration hasn't been applied yet.
 */
export async function recordLeadStage(input: LeadStageInput): Promise<LeadResult> {
  const supabase = getSupabase();
  if (!supabase) return { ok: false, skipped: true, error: "supabase_not_configured" };

  if (!input.ghlContactId && !input.email) {
    return { ok: false, error: "no_identifier" };
  }

  const args = {
    p_contact_id: input.ghlContactId ?? null,
    p_email: input.email ?? null,
    p_stage: input.stage,
    p_at: (input.at ?? new Date()).toISOString(),
    p_revenue: typeof input.revenue === "number" ? input.revenue : null,
    p_currency: input.currency ?? null,
  };

  try {
    const { data, error } = await supabase.rpc("record_lead_event", args);

    if (!error) {
      const row = (Array.isArray(data) ? data[0] : data) as
        | { lead_id?: string; first_time?: boolean }
        | null
        | undefined;
      return {
        ok: true,
        leadId: typeof row?.lead_id === "string" ? row.lead_id : undefined,
        firstTime: typeof row?.first_time === "boolean" ? row.first_time : undefined,
      };
    }

    // PGRST202: function not found — the migration isn't applied yet.
    if (error.code !== "PGRST202") {
      const described = describeSupabaseError(error);
      console.error(`[leads] stage "${input.stage}" failed: ${described}`);
      return { ok: false, error: described };
    }

    const legacy = await supabase.rpc("record_lead_stage", args);
    if (legacy.error) {
      const described = describeSupabaseError(legacy.error);
      console.error(`[leads] stage "${input.stage}" failed: ${described}`);
      return { ok: false, error: described };
    }
    return { ok: true, leadId: typeof legacy.data === "string" ? legacy.data : undefined };
  } catch (err) {
    console.error(`[leads] stage write threw: ${describeThrown(err)}`);
    return { ok: false, error: describeThrown(err) };
  }
}

/* -------------------------------------------------------------------------- *
 * A/B views
 * -------------------------------------------------------------------------- */

export interface AbViewInput {
  experimentId: string;
  variantId: string;
  visitorId: string;
  attribution: Attribution;
  trafficType: "paid" | "organic";
  userAgent?: string;
}

/**
 * Records that a browser SAW a variant. Called by /api/ab/view.
 *
 * Idempotent on (experiment_id, visitor_id): the first view wins and later
 * ones only enrich it. That is what makes the denominator "unique visitors"
 * rather than "pageviews", and it means a reload can never dilute a rate.
 */
export async function recordAbView(input: AbViewInput): Promise<LeadResult> {
  const supabase = getSupabase();
  if (!supabase) return { ok: false, skipped: true, error: "supabase_not_configured" };

  const a = input.attribution;

  try {
    const { error } = await supabase.rpc("record_ab_view", {
      p_view: {
        experiment_id: input.experimentId,
        variant_id: input.variantId,
        visitor_id: input.visitorId,

        traffic_type: input.trafficType,
        ad_id: a.ad_id ?? null,
        adset_id: a.adset_id ?? null,
        campaign_id: a.campaign_id ?? null,
        utm_source: a.utm_source ?? null,
        utm_medium: a.utm_medium ?? null,
        utm_campaign: a.utm_campaign ?? null,
        utm_content: a.utm_content ?? null,
        landing_url: a.landing_url ?? null,
        referrer: a.referrer ?? null,
        user_agent: input.userAgent ?? null,
      },
    });

    if (error) {
      const described = describeSupabaseError(error);
      console.error(`[ab] view insert failed: ${described}`);
      return { ok: false, error: described };
    }

    return { ok: true };
  } catch (err) {
    console.error(`[ab] view insert threw: ${describeThrown(err)}`);
    return { ok: false, error: describeThrown(err) };
  }
}

export { isSupabaseConfigured };
