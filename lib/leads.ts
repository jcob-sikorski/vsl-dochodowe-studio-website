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

/** The stages a lead can pass through. Order is the funnel order. */
export const LEAD_STAGES = [
  "opted_in",
  "qualified",
  "booked",
  "showed",
  "no_show",
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
      },
    });

    if (error) {
      console.error(`[leads] opt-in insert failed: ${error.message}`);
      return { ok: false, error: error.message };
    }

    return { ok: true, leadId: typeof data === "string" ? data : undefined };
  } catch (err) {
    console.error("[leads] opt-in insert threw:", err);
    return { ok: false, error: String(err) };
  }
}

/** Stamps a funnel stage. Called by /api/conversion on every GHL stage move. */
export async function recordLeadStage(input: LeadStageInput): Promise<LeadResult> {
  const supabase = getSupabase();
  if (!supabase) return { ok: false, skipped: true, error: "supabase_not_configured" };

  if (!input.ghlContactId && !input.email) {
    return { ok: false, error: "no_identifier" };
  }

  try {
    const { data, error } = await supabase.rpc("record_lead_stage", {
      p_contact_id: input.ghlContactId ?? null,
      p_email: input.email ?? null,
      p_stage: input.stage,
      p_at: (input.at ?? new Date()).toISOString(),
      p_revenue: typeof input.revenue === "number" ? input.revenue : null,
      p_currency: input.currency ?? null,
    });

    if (error) {
      console.error(`[leads] stage "${input.stage}" failed: ${error.message}`);
      return { ok: false, error: error.message };
    }

    return { ok: true, leadId: typeof data === "string" ? data : undefined };
  } catch (err) {
    console.error("[leads] stage write threw:", err);
    return { ok: false, error: String(err) };
  }
}

export { isSupabaseConfigured };
