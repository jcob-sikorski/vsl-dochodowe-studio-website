"use client";

import { BARTEK_STUDIOS } from "@/lib/materials";
import { track } from "@/lib/track";

/** Bartek's 4 studios: main photo + rating, each card opens Google Maps. */
export function BartekStudios() {
  return (
    <div id="studia-bartka" className="mt-6 w-full scroll-mt-16 lg:mt-8">
      <p className="text-center text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-neutral-500">
        4 studia Bartka · kliknij, żeby sprawdzić w Google Maps
      </p>

      <ul className="mt-3 grid grid-cols-2 gap-2.5 md:grid-cols-4 md:gap-3">
        {BARTEK_STUDIOS.map((s) => (
          <li key={s.id}>
            <a
              href={s.mapsUrl}
              target="_blank"
              rel="noreferrer"
              onClick={() => track(`cta_materialy_studio_${s.id}`)}
              aria-label={`${s.name} ${s.city} — otwórz w Google Maps`}
              className="group block h-full overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-colors hover:border-neutral-400"
            >
              <div className="relative aspect-[4/5] w-full md:aspect-[3/4] overflow-hidden bg-neutral-200">
                <img
                  src={s.photo}
                  alt={`${s.name} ${s.city}`}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
                <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-[0.7rem] font-extrabold text-neutral-900 shadow-sm">
                  <span className="text-[#f59e0b]" aria-hidden="true">★</span>
                  {s.rating}
                  <span className="font-semibold text-neutral-500">({s.reviews})</span>
                </span>
              </div>
              <div className="p-3">
                <p className="text-[0.86rem] font-extrabold leading-snug text-neutral-900">{s.city}</p>
                <p className="mt-0.5 text-[0.74rem] leading-snug text-neutral-600">{s.name}</p>
                <p className="mt-2 inline-flex items-center gap-1 text-[0.72rem] font-extrabold uppercase tracking-wider text-[#c2410c]">
                  Google Maps <span aria-hidden="true">↗</span>
                </p>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
