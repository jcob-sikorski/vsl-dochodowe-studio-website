"use client";

import { NarrativeShell, SectionHeader } from "@/components/narrative/section-header";
import { YOUTUBE_CHANNEL_URL } from "@/lib/materials";
import { track } from "@/lib/track";

/** Independent proof + the honest risk. */
export function VerifySection() {
  const links = [
    {
      id: "maps",
      title: "Google Maps",
      body: "Studia Bartka i uczestników programu — zdjęcia, adresy i opinie klientów.",
      href: "#studia-bartka",
      external: false,
    },
    {
      id: "youtube",
      title: "YouTube: Dochodowe Studio",
      body: "Kanał z wywiadami z właścicielami studiów z programu.",
      href: YOUTUBE_CHANNEL_URL,
      external: true,
    },
  ];

  return (
    <NarrativeShell tone="panel" id="sprawdz-nas" width="wide">
      <SectionHeader eyebrow="9 · Sprawdź nas sam" before="Nie musisz" underline="wierzyć nam na słowo" />

      <div className="mt-7 grid w-full grid-cols-1 gap-2.5 min-[420px]:grid-cols-2 lg:grid-cols-3 lg:gap-3">
        {links.map((l) => (
          <a
            key={l.id}
            href={l.href}
            {...(l.external ? { target: "_blank", rel: "noreferrer" } : {})}
            onClick={() => track(`cta_materialy_${l.id}`)}
            className="group rounded-2xl border border-neutral-200 bg-white p-4 transition-colors hover:border-neutral-400 sm:p-5 lg:p-6"
          >
            <p className="flex items-center justify-between text-[0.98rem] font-extrabold text-neutral-900">
              {l.title}
              <span className="text-neutral-400 transition-transform group-hover:translate-x-0.5" aria-hidden="true">{l.external ? "↗" : "↑"}</span>
            </p>
            <p className="mt-1 text-[0.84rem] leading-[1.5] text-neutral-700">{l.body}</p>
          </a>
        ))}

        <div className="w-full rounded-2xl border border-neutral-200 bg-white p-4 min-[420px]:col-span-2 sm:p-5 lg:col-span-1 lg:p-6">
        <p className="text-[0.66rem] font-extrabold uppercase tracking-[0.16em] text-[#c2410c]">Uczciwie o ryzyku</p>
        <p className="mt-1.5 text-[0.88rem] leading-[1.6] text-neutral-700">
          Z programu odeszła jedna osoba. Nie była życiowo i mentalnie przygotowana na prowadzenie firmy. Dlatego zanim kogokolwiek przyjmiemy, rozmawiamy — i dlatego prosimy Cię o zapoznanie się z tymi materiałami.
          </p>
        </div>
      </div>
    </NarrativeShell>
  );
}
