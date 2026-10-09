import { NarrativeShell, SectionHeader } from "@/components/narrative/section-header";

const STEPS: { title: string; body: string; done?: boolean; current?: boolean }[] = [
  { title: "Zgłoszenie wysłane", body: "Podjąłeś decyzję. Większość właścicieli nigdy nie dochodzi do tego kroku.", done: true },
  { title: "Odbierz telefon od naszego zespołu", body: "Wkrótce zadzwonimy, żeby umówić termin rozmowy. To jedyny sposób, żeby ją umówić, więc miej telefon pod ręką.", current: true },
  { title: "Rozmowa kwalifikacyjna z Pawłem lub Olafem", body: "Google Meet. Robimy rentgen Twoich liczb i sprawdzamy, czy jesteśmy w stanie dowieźć Ci wynik." },
  { title: "Decyzja obu stron", body: "Jeśli to Twój moment, startujesz z wdrożeniem. Jeśli nie, powiemy Ci to wprost." },
];

export function NextStepsSection() {
  return (
    <NarrativeShell tone="panel" id="co-teraz">
      <SectionHeader eyebrow="Co dzieje się teraz" before="Twoja droga do" underline="rozmowy kwalifikacyjnej" />

      <ol className="mt-7 w-full space-y-3">
        {STEPS.map((s, i) => (
          <li
            key={s.title}
            className={`flex gap-3.5 rounded-2xl border bg-white p-4 sm:p-5 ${
              s.current ? "border-2 border-[#ea580c]" : "border-neutral-200"
            }`}
          >
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[0.8rem] font-extrabold ${
                s.done
                  ? "bg-emerald-600 text-white"
                  : s.current
                  ? "bg-[#ea580c] text-white"
                  : "border-2 border-neutral-300 text-neutral-500"
              }`}
            >
              {s.done ? "✓" : i + 1}
            </span>
            <div>
              <h3 className="text-[0.98rem] font-extrabold leading-snug text-neutral-900">
                {s.title}
                {s.current && (
                  <span className="ml-2 inline-block rounded-full bg-orange-100 px-2 py-0.5 align-middle text-[0.62rem] font-extrabold uppercase tracking-wider text-[#c2410c]">
                    Teraz
                  </span>
                )}
              </h3>
              <p className="mt-1 text-[0.86rem] leading-[1.55] text-neutral-700">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </NarrativeShell>
  );
}
