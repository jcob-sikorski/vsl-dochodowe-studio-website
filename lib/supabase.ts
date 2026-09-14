/* -------------------------------------------------------------------------- *
 * src/lib/supabase.ts
 *
 * Server-only Supabase client, using the SERVICE ROLE key.
 *
 * That key bypasses RLS, so it must never reach a browser: this module is
 * imported only by API routes, server actions and server components.
 * -------------------------------------------------------------------------- */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
/**
 * Supabase's current key format is `sb_secret_...`; the legacy equivalent was
 * the `service_role` JWT. Both bypass RLS and both are accepted here, so this
 * keeps working whichever your project issues.
 *
 * NEVER the publishable key: that one is designed for browsers under RLS, and
 * these tables deliberately have no policies at all.
 */
const SECRET_KEY = (
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  ""
).trim();

let client: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SECRET_KEY);
}

/**
 * Returns the shared client, or null when Supabase isn't configured.
 *
 * Null rather than throwing on purpose: analytics is never allowed to break a
 * lead capture. A missing key degrades reporting, not the funnel.
 */
export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;

  if (!client) {
    client = createClient(SUPABASE_URL, SECRET_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { "X-Client-Info": "dochodowe-funnel" } },
    });
  }

  return client;
}
