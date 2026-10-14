"use client";

import { useEffect, useRef, useState } from "react";
import { track } from "@/lib/track";

const ITEMS: { id: string; label: string }[] = [
  { id: "model", label: "Kim jesteśmy" },
  { id: "dla-kogo", label: "Dla kogo" },
  { id: "liczby", label: "Liczby" },
  { id: "sciezka-klienta", label: "Model" },
  { id: "playbook", label: "Playbook" },
  { id: "co-dostajesz", label: "Program" },
  { id: "wsparcie", label: "Wsparcie" },
  { id: "polecajki", label: "Polecajki" },
  { id: "sprawdz-nas", label: "Sprawdź nas" },
  { id: "nastepny-krok", label: "Rozmowa" },
];

/**
 * Sticky table of contents. On a phone it's a horizontally scrolling chip
 * row (the row scrolls, never the page); on desktop all chips fit in a line.
 * Highlights the section currently on screen.
 */
export function MaterialsNav() {
  const [active, setActive] = useState<string | null>(null);
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const targets = ITEMS.map((i) => document.getElementById(i.id)).filter(Boolean) as HTMLElement[];
    if (targets.length === 0 || typeof IntersectionObserver === "undefined") return;

    const visible = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.set(e.target.id, e.boundingClientRect.top);
          else visible.delete(e.target.id);
        }
        // The topmost section that crosses the reading line wins.
        const current = ITEMS.map((i) => i.id).find((id) => visible.has(id)) ?? null;
        if (current) setActive(current);
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );
    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, []);

  // Keep the active chip in view inside the row (horizontal only — never moves the page).
  useEffect(() => {
    const row = rowRef.current;
    if (!row || !active) return;
    const chip = row.querySelector<HTMLElement>(`[data-nav="${active}"]`);
    if (!chip) return;
    const left = chip.offsetLeft - row.clientWidth / 2 + chip.clientWidth / 2;
    row.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
  }, [active]);

  return (
    <nav
      aria-label="Spis treści"
      className="sticky top-0 z-40 w-full border-y border-neutral-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85"
    >
      <div
        ref={rowRef}
        className="mx-auto max-w-6xl overflow-x-auto px-4 py-2 [scrollbar-width:none] sm:px-6 [&::-webkit-scrollbar]:hidden"
      >
        {/* w-max + mx-auto: centred when it fits, scrollable from the first chip when it doesn't. */}
        <div className="mx-auto flex w-max gap-1.5">
        {ITEMS.map((item, i) => {
          const isActive = active === item.id;
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              data-nav={item.id}
              aria-current={isActive ? "location" : undefined}
              onClick={(e) => {
                track(`cta_materialy_nav_${item.id}`);
                const target = document.getElementById(item.id);
                if (!target) return;
                e.preventDefault();
                target.scrollIntoView({ behavior: "smooth", block: "start" });
                history.replaceState(null, "", `#${item.id}`);
              }}
              className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-[0.74rem] font-bold transition-colors ${
                isActive ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
              }`}
            >
              <span className={isActive ? "text-[#fb923c]" : "text-neutral-400"}>{i + 1}</span> {item.label}
            </a>
          );
        })}
        </div>
      </div>
    </nav>
  );
}
