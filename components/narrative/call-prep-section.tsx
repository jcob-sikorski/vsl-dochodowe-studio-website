import { CheckMark, NarrativeShell, SectionHeader } from "@/components/narrative/section-header";
import { CALL_CHECKS, CALL_PREP_NUMBERS } from "@/lib/narrative";

/** Prepares the applicant for the qualification call and restates the bar. */
export function CallPrepSection() {
  return (
    <NarrativeShell id="przygotowanie">
      <SectionHeader eyebrow="Przed rozmową" before="Na rozmowę przychodzą" underline="osoby przygotowane" />

      <p className="mt-4 max-w-md text-center text-[0.9rem] leading-[1.55] text-neutral-700 sm:text-[0.98rem]">
        Szkoda czasu rozmowy na podstawy. Miej pod ręką trzy liczby. Na ich podstawie pokażemy Ci, jak daleko jesteś od progu 45 klientów i 40 tys. zł zysku.
      </p>

      <ol className="mt-6 grid w-full grid-cols-3 gap-2">
        {CALL_PREP_NUMBERS.map((n, i) => (
          <li key={n} className="rounded-2xl border border-neutral-200 bg-neutral-50 px-2 py-3.5 text-center sm:p-4">
            <span className="font-display text-[1.6rem] font-extrabold leading-none text-[#ea580c]">{i + 1}</span>
            <p className="mt-2 text-[0.74rem] font-semibold leading-snug text-neutral-900 sm:text-[0.84rem]">{n}</p>
          </li>
        ))}
      </ol>

      <div className="mt-6 w-full rounded-2xl border border-neutral-200 p-4 sm:p-5">
        <p className="text-[0.92rem] font-extrabold text-neutral-900">I jedno pytanie do przemyślenia</p>
        <p className="mt-1 text-[0.86rem] leading-[1.55] text-neutral-700">
          Co konkretnie musiałoby się zmienić w Twoim biznesie w ciągu 6–12 miesięcy, żeby działał tak, jak chcesz? Zanotuj to. Od tego zaczniemy rozmowę.
        </p>
      </div>

      <div className="mt-6 w-full rounded-2xl bg-neutral-900 p-5 text-white sm:p-6">
        <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-neutral-400">Na rozmowie sprawdzimy</p>
        <ul className="mt-3 space-y-2.5">
          {CALL_CHECKS.map((c) => (
            <li key={c} className="flex gap-2.5 text-[0.88rem] leading-[1.45] text-neutral-100">
              <CheckMark className="text-[#fb923c]" />
              <span>{c}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[0.84rem] leading-[1.55] text-neutral-300">
          Nie przyjmujemy każdego. Z programu odeszła jedna osoba, bo nie była życiowo gotowa na prowadzenie firmy. Jeśli uznamy, że to nie jest Twój moment, usłyszysz to od nas uczciwie.
        </p>
      </div>
    </NarrativeShell>
  );
}
