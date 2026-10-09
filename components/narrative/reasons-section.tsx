import { CheckMark, NarrativeShell, SectionHeader } from "@/components/narrative/section-header";
import { REASON_GROUPS } from "@/lib/narrative";

/** Every reason to buy, grouped so it can be scanned in 20 seconds. */
export function ReasonsSection() {
  return (
    <NarrativeShell tone="panel" id="co-zyskujesz">
      <SectionHeader eyebrow="Co zyskujesz" before="System Dochodowego Studia" underline="w liczbach" />

      <p className="mt-4 max-w-md text-center text-[0.9rem] leading-[1.55] text-neutral-700 sm:text-[0.98rem]">
        Cztery filary: klient premium, kameralne studio z ofertą transformacyjną, sekwencja płatnej diagnozy i zespół z pętlą retencji. Oto, co dają w praktyce.
      </p>

      <div className="mt-7 grid w-full gap-3 sm:grid-cols-2">
        {REASON_GROUPS.map((g) => (
          <div key={g.title} className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5">
            <h3 className="text-[1rem] font-extrabold text-neutral-900">{g.title}</h3>
            <ul className="mt-3 space-y-2.5">
              {g.reasons.map((r) => (
                <li key={r} className="flex gap-2.5 text-[0.84rem] leading-[1.45] text-neutral-700">
                  <CheckMark className="text-neutral-900" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p className="mt-5 max-w-md text-center text-[0.72rem] leading-[1.5] text-neutral-500">
        Liczby pochodzą z modelu i wyników uczestników programu. Wyniki są zróżnicowane i zależą od wdrożenia.
      </p>
    </NarrativeShell>
  );
}
