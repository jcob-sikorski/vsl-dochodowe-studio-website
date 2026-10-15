"use server";

/* -------------------------------------------------------------------------- *
 * app/dashboard/actions.ts
 *
 * "Sync spend now": runs the same Meta → ad_spend pull as the nightly cron, on
 * demand, so today's spend is on the dashboard without waiting for 04:00 UTC.
 *
 * Read-only towards Meta; writes only to ad_spend. Checks the dashboard
 * password itself, because a server action can be POSTed to from any route,
 * not only from /dashboard where middleware guards it.
 * -------------------------------------------------------------------------- */

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { checkDashboardAuth } from "@/lib/dashboard-auth";
import { lastSpendSync, syncMetaSpend } from "@/lib/meta-spend";

export interface SyncSpendState {
  status: "idle" | "ok" | "error";
  message: string;
}

/** Two clicks in a row shouldn't hit the Marketing API twice. */
const MIN_SECONDS_BETWEEN_SYNCS = 60;

const pln = new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN", maximumFractionDigits: 0 });

export async function syncSpendNow(_prev: SyncSpendState, _form: FormData): Promise<SyncSpendState> {
  if (checkDashboardAuth(headers().get("authorization")) !== "ok") {
    return { status: "error", message: "Not signed in — reload the dashboard and try again." };
  }

  const last = await lastSpendSync();
  if (last) {
    const seconds = (Date.now() - Date.parse(last)) / 1000;
    if (seconds < MIN_SECONDS_BETWEEN_SYNCS) {
      return { status: "ok", message: `Already up to date (synced ${Math.max(1, Math.round(seconds))}s ago).` };
    }
  }

  const result = await syncMetaSpend({ days: 3 });

  if (!result.ok) {
    const reason =
      result.error === "missing_credentials"
        ? "Meta credentials are missing in Vercel."
        : result.error?.startsWith("http_")
          ? `Meta refused the request (${result.error.slice(5)}). The token may have expired.`
          : "The sync failed. Try again in a minute.";
    return { status: "error", message: reason };
  }

  revalidatePath("/dashboard");

  return {
    status: "ok",
    message: `Synced ${result.from} → ${result.to}: ${pln.format(result.spend ?? 0)} across ${result.rows ?? 0} ad-days.`,
  };
}
