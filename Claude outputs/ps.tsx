"use client";

import { PARTICIPANT_STUDIOS } from "@/lib/materials";
import { track } from "@/lib/track";

/**
 * Participants' studios, right under Bartek's: who runs it, what they got,
 * a link to the Google Maps listing and (where there is one) a jump to the
 * full case study in section 8.
 */
export function ParticipantStudios() {
  return (
    <div id="studia-uczestnikow" className="mt-8 w-full scroll-mt-16 lg:mt-10">
      <p className="text-center text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-neutral-500">
        Studia uczestników programu · kliknij, żeby sprawdzić w Google Maps
      </p>

      <ul className="mt-3 grid grid-cols-2 gap-2.5 md:grid-cols-4 md:gap-3">
        {PARTICIPANT_STUDIOS.map((s) => (
          <li key={s.id} className="flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white">
            <a
              href={s.mapsUrl}
              target="_blank"
              rel="noreferrer"
              onClick={() => track(`cta_materialy_studio_${s.id}`)}
              aria-label={`${s.studio} ${s.city} — otwórz w Google Maps`}
              className="group relative block aspect-[4/5] w-full overflow-hidden bg-neutral-200"
            >
              <img
                src={s.photo}
                alt={s.owner ? `${s.owner} — ${s.studio}, ${s.city}` : `${s.studio}, ${s.city}`}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
              <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-[0.7rem] font-extrabold text-neutral-900 shadow-sm">
                <span className="text-[#f59e0b]" aria-hidden="true">★</span>
                {s.rating}
                <span className="font-semibold text-neutral-500">({s.reviews})</span>
              </span>
            </a>

            <div className="flex flex-1 flex-col p-3">
              <p className="text-[0.86rem] font-extrabold leading-snug text-neutral-900">{s.owner ?? s.studio}</p>
              <p className="mt-0.5 text-[0.74rem] leading-snug text-neutral-600">
                {s.owner ? `${s.studio} · ${s.city}` : s.city}
              </p>
              <p
                className={`mt-1.5 text-[0.76rem] font-semibold leading-snug ${
                  s.result ? "text-[#c2410c]" : "text-neutral-500"
                }`}
              >
                {s.result ?? "Studio uczestnika programu"}
              </p>

              <div className="mt-auto flex flex-wrap gap-x-3 gap-y-1 pt-2.5">
                <a
                  href={s.mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => track(`cta_materialy_studio_${s.id}`)}
                  className="inline-flex items-center gap-1 text-[0.7rem] font-extrabold uppercase tracking-wider text-neutral-900 hover:text-[#c2410c]"
                >
                  Google Maps <span aria-hidden="true">↗</span>
                </a>
                {s.caseId && (
                  <a
                    href={`#${s.caseId}`}
                    onClick={(e) => {
                      track(`cta_materialy_case_${s.id}`);
                      const target = document.getElementById(s.caseId!);
                      if (!target) return;
                      e.preventDefault();
                      history.replaceState(null, "", `#${s.caseId}`);
                      // Manual offset, not scrollIntoView: Chrome mis-scrolls to boxes
                      // inside CSS columns (the case studies are a masonry grid).
                      const go = (behavior: ScrollBehavior) =>
                        window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 64, behavior });
                      go("smooth");
                      // Lazy images above the case study keep loading during and after
                      // the scroll and push it down; re-settle on it a few times,
                      // unless the visitor starts scrolling on their own.
                      const timers = [900, 1700, 2600].map((ms) => window.setTimeout(() => go("auto"), ms));
                      const stop = () => {
                        timers.forEach((t) => window.clearTimeout(t));
                        ["wheel", "touchstart", "keydown"].forEach((ev) => window.removeEventListener(ev, stop));
                      };
                      ["wheel", "touchstart", "keydown"].forEach((ev) =>
                        window.addEventListener(ev, stop, { once: true, passive: true })
                      );
                    }}
                    className="inline-flex items-center gap-1 text-[0.7rem] font-extrabold uppercase tracking-wider text-[#c2410c] hover:text-neutral-900"
                  >
                    Historia <span aria-hidden="true">↓</span>
                  </a>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
