/* -------------------------------------------------------------------------- *
 * lib/track.ts
 *
 * One door for behaviour events. Every event goes to TWO places:
 *
 *   1. Microsoft Clarity — pictures: heatmaps, recordings, filters.
 *   2. Our own /api/track → Supabase `page_events` — numbers for the
 *      dashboard's "Page engagement" section, joined to the headline test.
 *
 * Vocabulary (fixed strings, so they group cleanly; /api/track rejects
 * anything that doesn't start with one of these prefixes):
 *
 *   pageview_<page>           the page was opened
 *   section_<page>_<id>       the visitor stopped on a section (≥1 s)
 *   cta_<location>            which button they tapped
 *   form_started / form_submitted
 *   vsl_play, vsl_10…90, vsl_complete
 *   cost_slider_used, cost_slider_set (value = months)
 *   faq_text_open_<n>, playbook_download, interview_open_<n>
 *
 * Never throws: an ad blocker or a Supabase outage must never break the page.
 *
 * Bump PAGE_VERSION whenever the page layout changes, then filter heatmaps
 * by the `page_version` tag so old and new layouts don't share one map.
 * -------------------------------------------------------------------------- */

import Clarity from "@microsoft/clarity";

export const PAGE_VERSION = "copy_test_v5";

const ENDPOINT = "/api/track";
const FLUSH_AFTER_MS = 2000;

type Page = "landing" | "materials";
interface Queued {
  event: string;
  value?: string;
}

const fired = new Set<string>();
const queues: Record<Page, Queued[]> = { landing: [], materials: [] };
let flushTimer: number | undefined;
let listening = false;

function currentPage(): Page {
  return window.location.pathname.startsWith("/przygotowanie") ? "materials" : "landing";
}

function isBot(): boolean {
  return typeof navigator !== "undefined" && navigator.webdriver === true;
}

/** Sends everything queued. sendBeacon survives the tab closing; fetch is the fallback. */
export function flush(): void {
  if (typeof window === "undefined") return;
  window.clearTimeout(flushTimer);
  flushTimer = undefined;

  for (const page of ["landing", "materials"] as Page[]) {
    const events = queues[page].splice(0, queues[page].length);
    if (events.length === 0) continue;

    const body = JSON.stringify({
      page,
      viewport: window.innerWidth < 640 ? "mobile" : "desktop",
      page_version: PAGE_VERSION,
      events,
    });

    try {
      const blob = new Blob([body], { type: "application/json" });
      if (navigator.sendBeacon?.(ENDPOINT, blob)) continue;
    } catch {
      /* fall through to fetch */
    }
    try {
      void fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
        credentials: "same-origin",
      }).catch(() => {});
    } catch {
      /* ignore */
    }
  }
}

function enqueue(item: Queued): void {
  if (typeof window === "undefined" || isBot()) return;

  queues[currentPage()].push(item);

  if (!listening) {
    listening = true;
    // The last moment a page is guaranteed to run code, on mobile especially.
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") flush();
    });
  }

  if (flushTimer === undefined) {
    flushTimer = window.setTimeout(flush, FLUSH_AFTER_MS);
  }
}

export function track(
  event: string,
  { once = false, value }: { once?: boolean; value?: string } = {}
): void {
  if (once) {
    if (fired.has(event)) return;
    fired.add(event);
  }
  try {
    Clarity?.event?.(event);
  } catch {
    /* Clarity blocked or not initialised — ignore. */
  }
  enqueue(value === undefined ? { event } : { event, value });
}

export function tag(key: string, value: string | string[]): void {
  try {
    Clarity?.setTag?.(key, value);
  } catch {
    /* ignore */
  }
}
