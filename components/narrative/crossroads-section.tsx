import { CheckMark, CrossMark, NarrativeShell, SectionHeader } from "@/components/narrative/section-header";
import { CostOfWaiting } from "@/components/narrative/cost-of-waiting";
import { ScrollToFormCta } from "@/components/scroll-to-form-cta";
import { FORK_DECIDE, FORK_WAIT } from "@/lib/narrative";

/** Movement 2 — ROZWIDLENIE: decide today, or another 5 years of chaos. */
export function CrossroadsSection({
  showCta = true,
  eyebrow = "Masz wybór",
}: {
  showCta?: boolean;
  eyebrow?: string;
}) {
  return (
    <NarrativeShell id="rozwidlenie">
      <SectionHeader eyebrow={eyebrow} before="Za 5 lat będziesz w" underline="jednym z dwóch miejsc" />

      <p className="mt-4 max-w-md text-center text-[0.9rem] leading-[1.55] text-neutral-700 sm:text-[0.98rem]">
        Albo podejmujesz decyzję dzisiaj, albo czekasz kolejne 5 lat. A te 5 lat to nie pauza. To 5 lat chaosu i wymyślania koła na nowo.
      </p>

      <div className="mt-7 grid w-full gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 sm:p-5">
          <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-neutral-500">Droga 1</p>
          <h3 className="mt-1 text-[1.05rem] font-extrabold text-neutral-900">Czekasz</h3>
          <ul className="mt-3 space-y-2.5">
            {FORK_WAIT.map((t) => (
              <li key={t} className="flex gap-2.5 text-[0.86rem] leading-[1.45] text-neutral-700">
                <CrossMark className="text-neutral-400" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[0.82rem] font-bold text-neutral-500">Tylko 5 lat starszy.</p>
        </div>

        <div className="rounded-2xl border-2 border-[#ea580c] bg-orange-50/60 p-4 sm:p-5">
          <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-[#c2410c]">Droga 2</p>
          <h3 className="mt-1 text-[1.05rem] font-extrabold text-neutral-900">Decydujesz dziś</h3>
          <ul className="mt-3 space-y-2.5">
            {FORK_DECIDE.map((t) => (
              <li key={t} className="flex gap-2.5 text-[0.86rem] leading-[1.45] text-neutral-800">
                <CheckMark className="text-[#ea580c]" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[0.82rem] font-bold text-[#c2410c]">Joanna: 6 tygodni od decyzji do 66 tys. zł przychodu.</p>
        </div>
      </div>

      <div className="mt-6 w-full">
        <CostOfWaiting />
      </div>

      <p className="mt-6 max-w-md text-center text-[0.9rem] font-semibold leading-[1.5] text-neutral-900">
        Różnica między właścicielami z historii poniżej a tymi, którzy dalej się męczą, to nie talent ani miasto. To moment, w którym podjęli decyzję.
      </p>

      {showCta && <ScrollToFormCta location="crossroads" className="mt-7" />}
    </NarrativeShell>
  );
}
