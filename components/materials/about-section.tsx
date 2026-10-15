import { CheckMark, NarrativeShell, SectionHeader } from "@/components/narrative/section-header";
import { ABOUT_STATS, END_CLIENT, FIT_SPEC } from "@/lib/materials";
import { BartekStudios } from "@/components/materials/bartek-studios";

/** Kim jesteśmy + dla kogo jest model. */
export function AboutSection() {
  return (
    <>
      <NarrativeShell tone="panel" id="model" width="wide">
        <SectionHeader eyebrow="1 · Kim jesteśmy" before="Program" underline="wdrożeniowy" />

        <p className="mt-4 max-w-xl text-center text-[0.9rem] leading-[1.55] text-neutral-700 sm:text-[0.98rem] lg:text-[1.02rem]">
          Dochodowe Studio to program dla właścicieli studiów. Dajemy gotowy system, który pozwala zbudować{" "}
          <strong className="font-extrabold text-neutral-900">wysokomarżowe studio</strong> i otwierać kolejne placówki.
        </p>

        <p className="mt-3 inline-flex max-w-xl flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-full border border-neutral-200 bg-white px-4 py-1.5 text-center text-[0.8rem] font-semibold text-neutral-800 sm:text-[0.86rem]">
          <span>Jednorazowa inwestycja</span>
          <span className="text-neutral-300" aria-hidden="true">·</span>
          <span>program trwa <strong className="font-extrabold text-[#c2410c]">6 miesięcy</strong></span>
        </p>

        <dl className="mt-6 grid w-full grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
          {ABOUT_STATS.map((s) => (
            <div key={s.label} className="flex flex-col rounded-2xl border border-neutral-200 bg-white px-3 py-4 text-center lg:py-5">
              <dt className="order-2 mt-2 text-[0.76rem] font-semibold leading-snug text-neutral-800 sm:text-[0.84rem]">{s.label}</dt>
              <dd className="order-1 font-display text-[1.6rem] font-extrabold leading-none text-[#ea580c] lg:text-[2rem]">{s.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-3 w-full rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5 md:mt-4 lg:flex lg:gap-8 lg:p-6">
          <p className="text-[0.66rem] font-extrabold uppercase tracking-[0.16em] text-[#c2410c] lg:w-40 lg:shrink-0 lg:pt-1">Skąd ten program</p>
          <p className="mt-1.5 text-[0.88rem] leading-[1.6] text-neutral-700 lg:mt-0 lg:text-[0.95rem]">
            Założyciel, <strong className="text-neutral-900">Bartek</strong>, wydał kilkaset tysięcy złotych i przez 6 lat popełniał kosztowne błędy, zanim zbudował 4 własne studia Sportowe Przedmieście. Potem otworzył mentoring dla innych — dziś jest w nim ok. 60 właścicieli. Ty nie musisz powtarzać tej drogi i nie tracisz na nią ok. 3 lat.
          </p>
        </div>

        <BartekStudios />
      </NarrativeShell>

      <NarrativeShell id="dla-kogo" width="wide">
        <SectionHeader eyebrow="2 · Dla kogo" before="Czy Twoje studio" underline="pasuje do modelu" />

        <div className="mt-7 grid w-full grid-cols-1 gap-4 lg:grid-cols-[1.45fr_1fr] lg:gap-5">
          <div className="w-full overflow-hidden rounded-2xl border border-neutral-200">
            <dl className="text-[0.86rem] leading-[1.5] lg:text-[0.92rem]">
              {FIT_SPEC.map((row, i) => (
                <div
                  key={row.label}
                  className={`px-4 py-3 sm:grid sm:grid-cols-[9rem_1fr] sm:gap-4 lg:px-5 lg:py-4 ${i % 2 ? "bg-neutral-50" : "bg-white"}`}
                >
                  <dt className="text-[0.7rem] font-extrabold uppercase tracking-wider text-neutral-500 sm:pt-0.5">{row.label}</dt>
                  <dd className="mt-0.5 font-semibold text-neutral-900 sm:mt-0">{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="w-full rounded-2xl bg-neutral-900 p-5 text-white sm:p-6">
            <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-neutral-400">Klient docelowy Twojego studia</p>
            <ul className="mt-3 space-y-2.5 lg:mt-4 lg:space-y-3.5">
              {END_CLIENT.map((c) => (
                <li key={c} className="flex gap-2.5 text-[0.88rem] leading-[1.45] text-neutral-100 lg:text-[0.94rem]">
                  <CheckMark className="text-[#fb923c]" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </NarrativeShell>
    </>
  );
}
