"use client";

/* -------------------------------------------------------------------------- *
 * src/components/ab-view-beacon.tsx
 *
 * Records ONE view per browser per experiment — the denominator of the opt-in
 * rate.
 *
 * Why a client beacon rather than counting requests server-side: crawlers,
 * uptime pings, Meta's link scraper and Next's own prefetches all make HTTP
 * requests and none of them can opt in. Counting those would quietly deflate
 * every variant's rate. Anything that runs this effect is a real browser.
 *
 * Deduplication happens twice, deliberately:
 *   - here, so a reload doesn't cost a network call
 *   - in Postgres, on (experiment_id, visitor_id), so a cleared localStorage
 *     or a second tab can't double-count
 * -------------------------------------------------------------------------- */

import { useEffect } from "react";

import Clarity from "@microsoft/clarity";

import { AB_VISITOR_COOKIE } from "@/lib/ab";
import { readCookie, resolveAttribution } from "@/lib/attribution";

interface AbViewBeaconProps {
  experimentId: string;
  variantId: string;
}

export function AbViewBeacon({ experimentId, variantId }: AbViewBeaconProps) {
  useEffect(() => {
    // Headless browsers: Lighthouse, Vercel's screenshotter, scrapers with JS.
    if (typeof navigator !== "undefined" && navigator.webdriver) return;

    // Session replay is far more useful when you can filter it by variant.
    try {
      Clarity?.setTag?.("ab_variant", variantId);
      Clarity?.setTag?.("ab_experiment", experimentId);
    } catch {
      /* Clarity blocked or not initialised — never let it stop the beacon. */
    }

    const visitorId = readCookie(AB_VISITOR_COOKIE);
    // No cookie means middleware didn't run (a static preview, say). Without a
    // stable visitor id the row could not be de-duplicated, so skip it: a
    // missing view is recoverable, a double-counted one silently isn't.
    if (!visitorId) return;

    const seenKey = `ds_ab_seen_${experimentId}_${visitorId}`;

    try {
      if (window.localStorage.getItem(seenKey)) return;
    } catch {
      /* Private mode: fall through and let Postgres do the de-duplication. */
    }

    let attribution = {};
    try {
      attribution = resolveAttribution();
    } catch {
      attribution = {};
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 8_000);

    fetch("/api/ab/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      keepalive: true,
      body: JSON.stringify({ attribution }),
    })
      .then((res) => {
        if (!res.ok) return;
        try {
          window.localStorage.setItem(seenKey, String(Date.now()));
        } catch {
          /* ignore */
        }
      })
      .catch(() => {
        /* An ad blocker or a flaky network costs one row of reporting. */
      })
      .finally(() => window.clearTimeout(timeout));

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [experimentId, variantId]);

  return null;
}

export default AbViewBeacon;
