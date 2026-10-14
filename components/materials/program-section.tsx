import { CheckMark, NarrativeShell, SectionHeader } from "@/components/narrative/section-header";
import { PROGRAM_AZ, PROGRAM_PILLARS, SUPPORT_RHYTHM } from "@/lib/materials";

/** What the client gets: A–Z implementation, three pillars, weekly rhythm. */
export function ProgramSection() {
  return (
    <>
      <NarrativeShell tone="panel" id="co-dostajesz" width="wide">
        <SectionHeader eyebrow="6 · Co dostajesz w programie" before="Pomoc we wszystkim" underline="od A do Z" />

        <ul className="mt-7 grid w-full grid-cols-2 gap-x-3 gap-y-2.5 rounded-2xl border border-neutral-200 bg-white p-4 sm:gap-x-4 sm:p-5 lg:grid-cols-3 lg:gap-y-3 lg:p-6">
          {PROGRAM_AZ.map((item) => (
            <li key={item} className="flex gap-1.5 text-[0.8rem] leading-[1.4] text-neutral-800 min-[390px]:text-[0.84rem] sm:gap-2 sm:text-[0.86rem] lg:text-[0.92rem]">
              <CheckMark className="text-[#ea580c]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <div className="mt-3 grid w-full grid-cols-1 gap-3 lg:mt-4 lg:grid-cols-3 lg:gap-4">
          {PROGRAM_PILLARS.map((p) => (
            <div key={p.title} className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5 lg:p-6">
              <h3 className="text-[1rem] font-extrabold text-neutral-900 lg:text-[1.05rem]">{p.title}</h3>
              <p className="mt-1 text-[0.86rem] leading-[1.55] text-neutral-700">{p.body}</p>
              {p.points && (
                <ul className="mt-2.5 space-y-1.5">
                  {p.points.map((pt) => (
                    <li key={pt} className="flex gap-2 text-[0.84rem] leading-[1.5] text-neutral-800">
                      <span className="mt-[0.55rem] h-1.5 w-1.5 shrink-0 rounded-full bg-[#ea580c]" aria-hidden="true" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </NarrativeShell>

      <NarrativeShell id="wsparcie" width="wide">
        <SectionHeader eyebrow="7 · Wsparcie" before="Nie zostajesz" underline="sam z materiałami" />

        <div className="mt-7 grid w-full grid-cols-1 gap-2.5 md:grid-cols-2 lg:grid-cols-4 lg:gap-3">
          {SUPPORT_RHYTHM.map((r) => (
            <div key={r.when} className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5">
              <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-[#c2410c]">{r.when}</p>
              <p className="mt-1 text-[0.95rem] font-extrabold leading-snug text-neutral-900">{r.what}</p>
              <p className="mt-1 text-[0.84rem] leading-[1.5] text-neutral-700">{r.detail}</p>
            </div>
          ))}
        </div>

        {/* Result */}
        <div className="mt-4 w-full rounded-2xl bg-neutral-900 p-5 text-white sm:p-6 lg:flex lg:items-center lg:gap-10 lg:p-8">
          <div className="lg:w-64 lg:shrink-0">
            <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-neutral-400">Najważniejsze — rezultat</p>
            <p className="mt-2 text-[1rem] font-extrabold leading-snug lg:text-[1.25rem]">Nie wymyślasz niczego na nowo.</p>
          </div>
          <p className="mt-2 text-[0.86rem] leading-[1.6] text-neutral-300 lg:mt-0 lg:text-[0.95rem]">
            Bartek wydał już setki tysięcy złotych i 6 lat na głupie i kosztowne błędy, budując Sportowe Przedmieście. Dzięki temu Ty dostajesz{" "}
            <strong className="text-white">5–10 godzin pracy w tygodniu</strong> jako właściciel i{" "}
            <strong className="text-white">20–50 tys. zł zysku miesięcznie</strong> (rekordzistka: 54 tys. zł) — za ułamek tej kwoty.
          </p>
        </div>
      </NarrativeShell>
    </>
  );
}
