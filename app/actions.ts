"use server";

/* -------------------------------------------------------------------------- *
 * src/app/actions.ts
 *
 * The ONLY server action exposed to the browser is `trackPageView`.
 *
 * It carries no PII and cannot be used to forge a conversion: the
 * "Lead" event is fired exclusively inside /api/register, after
 * the submission has actually been validated and written to GoHighLevel.
 * -------------------------------------------------------------------------- */

import { cookies, headers } from "next/headers";

import { normalizeAttribution, type Attribution } from "@/lib/attribution";
import { sendPageView } from "@/lib/meta-capi";
import { getClientIp } from "@/lib/rate-limit";
import { sanitizeUrl } from "@/lib/validation";

export interface TrackPageViewInput {
  eventId: string;
  sourceUrl?: string;
  attribution?: Attribution;
}

export async function trackPageView(input: TrackPageViewInput): Promise<{ ok: boolean }> {
  try {
    // `await` works whether headers()/cookies() are sync (Next 14) or async
    // (Next 15+), so this file is version-proof.
    const headerList = await headers();
    const cookieStore = await cookies();

    // Rebuild a plain Headers object from just the keys getClientIp inspects —
    // avoids relying on ReadonlyHeaders implementing forEach().
    const requestHeaders = new Headers();
    for (const key of [
      "cf-connecting-ip",
      "true-client-ip",
      "x-real-ip",
      "x-forwarded-for",
      "x-vercel-forwarded-for",
    ]) {
      const value = headerList.get(key);
      if (value) requestHeaders.set(key, value);
    }

    const eventId = typeof input?.eventId === "string" ? input.eventId.slice(0, 64) : "";
    if (!/^[A-Za-z0-9_-]{8,64}$/.test(eventId)) {
      return { ok: false };
    }

    const attribution = normalizeAttribution(input?.attribution);

    const result = await sendPageView({
      eventId,
      sourceUrl: sanitizeUrl(input?.sourceUrl ?? "") ?? undefined,
      clientIp: getClientIp(requestHeaders),
      clientUserAgent: headerList.get("user-agent") ?? undefined,
      fbp: attribution.fbp || cookieStore.get("_fbp")?.value,
      fbc: attribution.fbc || cookieStore.get("_fbc")?.value,
      attribution,
    });

    return { ok: result.ok };
  } catch (error) {
    // Analytics must never surface as an error to the visitor.
    console.error("[actions] trackPageView failed:", error);
    return { ok: false };
  }
}
