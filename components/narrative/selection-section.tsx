import { CheckMark, CrossMark, NarrativeShell, SectionHeader } from "@/components/narrative/section-header";
import { ScrollToFormCta } from "@/components/scroll-to-form-cta";
import { FOR_WHO, NOT_FOR_WHO, QUALIFICATION_STEPS } from "@/lib/narrative";

/** Movement 3 — SELEKCJA: you apply, we decide together. */
export function SelectionSection() {
  return (
    <NarrativeShell id="dla-kogo">
      <SectionHeader eyebrow="Kwalifikacja" before="Nie przyjmujemy" underline="każdego" />

      <p className="mt-4 max-w-md text-center text-[0.9rem] leading-[1.55] text-neutral-700 sm:text-[0.98rem]">
        To nie jest kurs dla każdego, kto ma kartę. To program wdrożeniowy, do którego się aplikuje. Skoro bierzemy odpowiedzialność za Twój wynik, musimy mieć pewność, że jesteś w stanie go dowieźć.
      </p>

      <div className="mt-7 grid w-full gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-neutral-200 p-4 sm:p-5">
          <h3 className="text-[1rem] font-extrabold text-neutral-900">Program jest dla Ciebie, jeśli</h3>
          <ul className="mt-3 space-y-2.5">
            {FOR_WHO.map((t) => (
              <li key={t} className="flex gap-2.5 text-[0.86rem] leading-[1.45] text-neutral-800">
                <CheckMark className="text-emerald-600" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 sm:p-5">
          <h3 className="text-[1rem] font-extrabold text-neutral-900">Nie jest dla Ciebie, jeśli</h3>
          <ul className="mt-3 space-y-2.5">
            {NOT_FOR_WHO.map((t) => (
              <li key={t} className="flex gap-2.5 text-[0.86rem] leading-[1.45] text-neutral-600">
                <CrossMark className="text-red-500" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-8 w-full">
        <p className="text-center text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-neutral-500">Jak wygląda kwalifikacja</p>
        <ol className="mt-4 grid w-full gap-2.5 sm:grid-cols-2">
          {QUALIFICATION_STEPS.map((s, i) => (
            <li key={s.title} className="flex gap-3 rounded-2xl border border-neutral-200 p-4">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-neutral-900 text-[0.8rem] font-extrabold text-neutral-900">
                {i + 1}
              </span>
              <div>
                <h3 className="text-[0.94rem] font-extrabold text-neutral-900">{s.title}</h3>
                <p className="mt-0.5 text-[0.82rem] leading-[1.5] text-neutral-700">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <p className="mt-6 max-w-md text-center text-[0.9rem] font-semibold leading-[1.5] text-neutral-900">
        Kto przechodzi kwalifikację, dołącza do pierwszej generacji właścicieli kameralnych studiów premium w Polsce.
      </p>

      <ScrollToFormCta location="selection" className="mt-7" />
    </NarrativeShell>
  );
}
