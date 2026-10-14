"use client";

import { useEffect } from "react";
import { PAGE_VERSION, tag, track } from "@/lib/track";

/** How long a section must stay on screen to count as seen. */
const DWELL_MS = 1000;

/**
 * Watches every element marked `data-track-section="<id>"` on the page and
 * reports, once per page view, each section the visitor actually stopped on.
 *
 * Also keeps a `deepest_section` tag (the furthest section down the page that
 * was seen), so in Clarity you can filter recordings and heatmaps to, e.g.,
 * "people who got to the qualification section but never tapped a CTA".
 */
export function SectionTracker({ page }: { page: "landing" | "materials" }) {
  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.webdriver) return;

    track(`pageview_${page}`, { once: true });
    tag("page", page);
    tag("page_version", PAGE_VERSION);
    tag("viewport", window.innerWidth < 640 ? "mobile" : "desktop");

    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-track-section]"));
    if (nodes.length === 0 || typeof IntersectionObserver === "undefined") return;

    const order = new Map(nodes.map((el, i) => [el, i]));
    const timers = new Map<Element, number>();
    let deepest = -1;

    const report = (el: HTMLElement) => {
      const id = el.dataset.trackSection;
      if (!id) return;
      track(`section_${page}_${id}`, { once: true });
      const index = order.get(el) ?? -1;
      if (index > deepest) {
        deepest = index;
        tag("deepest_section", `${String(index + 1).padStart(2, "0")}_${id}`);
      }
      observer.unobserve(el);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement;
          // Seen = 35% of the section on screen, or (for sections taller than
          // the screen, which never reach 35%) a third of the screen filled...
          const screen = entry.rootBounds?.height ?? window.innerHeight;
          const seen =
            entry.isIntersecting &&
            (entry.intersectionRatio >= 0.35 || entry.intersectionRect.height >= screen / 3);

          // ...for at least DWELL_MS. A fling, or a CTA smooth-scrolling back
          // to the form, passes sections without anyone reading them.
          if (seen && !timers.has(el)) {
            timers.set(el, window.setTimeout(() => report(el), DWELL_MS));
          } else if (!seen && timers.has(el)) {
            window.clearTimeout(timers.get(el));
            timers.delete(el);
          }
        }
      },
      // Fine steps so very tall sections (case studies run ~15 screens) still
      // get a callback while they fill the screen.
      { threshold: Array.from({ length: 51 }, (_, i) => i / 100) }
    );

    nodes.forEach((el) => observer.observe(el));
    return () => {
      observer.disconnect();
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [page]);

  return null;
}
