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

    // Count the view only once someone ENGAGES: a scroll, a tap, a key, or a few
    // seconds with the page actually on screen. Meta's ad review loads the
    // page hundreds of times whenever ads are published, runs this script, and
    // leaves — those loads used to inflate every variant's denominator. A real
    // visitor who might opt in always clears this bar; the cost is that someone
    // who bounces within a few seconds without touching anything isn't counted,
    // equally for every variant. (ab_report also drops review bursts that get
    // through, as a safety net.)
    const ENGAGED_AFTER_MS = 4_000;
    const controller = new AbortController();
    let sent = false;
    let dwellTimer: number | undefined;
    let abortTimer: number | undefined;

    const send = () => {
      if (sent) return;
      sent = true;
      stopListening();
      abortTimer = window.setTimeout(() => controller.abort(), 8_000);

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
        .finally(() => window.clearTimeout(abortTimer));
    };

    // Dwell only counts while the tab is visible; a background tab is not a view.
    const startDwell = () => {
      window.clearTimeout(dwellTimer);
      if (document.visibilityState === "visible") {
        dwellTimer = window.setTimeout(send, ENGAGED_AFTER_MS);
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") startDwell();
      else window.clearTimeout(dwellTimer);
    };

    const ENGAGEMENT_EVENTS = ["scroll", "pointerdown", "touchstart", "keydown"] as const;
    const listenerOptions: AddEventListenerOptions = { passive: true };

    function stopListening() {
      window.clearTimeout(dwellTimer);
      document.removeEventListener("visibilitychange", onVisibility);
      for (const type of ENGAGEMENT_EVENTS) window.removeEventListener(type, send, listenerOptions);
    }

    for (const type of ENGAGEMENT_EVENTS) window.addEventListener(type, send, listenerOptions);
    document.addEventListener("visibilitychange", onVisibility);
    startDwell();

    // Unmounting stops waiting for engagement, but never cancels a view that
    // was already sent — keepalive exists so it survives navigating away.
    return () => stopListening();
  }, [experimentId, variantId]);

  return null;
}

export default AbViewBeacon;
