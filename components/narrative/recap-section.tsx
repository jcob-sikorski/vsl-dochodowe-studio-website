import { NarrativeShell, SectionHeader } from "@/components/narrative/section-header";

const RECAP: { label: string; title: string; body: string }[] = [
  {
    label: "Okno",
    title: "Jesteś przed rynkiem",
    body: "Kameralnych studiów jest coraz więcej, ale w większości okolic nie ma jeszcze ani jednego. Kto otworzy się pierwszy, bierze lokal, zaufanie i tanią reklamę.",
  },
  {
    label: "Rozwidlenie",
    title: "Wybrałeś drugą drogę",
    body: "Zamiast kolejnych 5 lat chaosu i wymyślania koła na nowo: gotowy system z ok. 50 działających studiów.",
  },
  {
    label: "Selekcja",
    title: "Teraz sprawdzamy, czy to Twój moment",
    body: "Do programu się aplikuje. Na rozmowie zdecydujemy razem, czy jesteśmy w stanie dowieźć Ci wynik.",
  },
];

/** Reinforces the decision just made, so the applicant shows up to the call. */
export function RecapSection() {
  return (
    <NarrativeShell id="dlaczego-to-dobra-decyzja">
      <SectionHeader eyebrow="Pamiętaj, dlaczego to robisz" before="Ten moment" underline="nie wróci" />
      <ol className="mt-7 w-full space-y-3">
        {RECAP.map((r) => (
          <li key={r.label} className="rounded-2xl border border-neutral-200 p-4 sm:p-5">
            <p className="text-[0.66rem] font-extrabold uppercase tracking-[0.16em] text-[#c2410c]">{r.label}</p>
            <h3 className="mt-1 text-[1rem] font-extrabold text-neutral-900">{r.title}</h3>
            <p className="mt-1 text-[0.86rem] leading-[1.55] text-neutral-700">{r.body}</p>
          </li>
        ))}
      </ol>
    </NarrativeShell>
  );
}
