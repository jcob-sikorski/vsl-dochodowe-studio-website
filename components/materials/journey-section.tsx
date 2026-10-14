import { NarrativeShell, SectionHeader } from "@/components/narrative/section-header";
import { CLIENT_JOURNEY } from "@/lib/materials";

/**
 * The client path inside the studio, with the economics of each step and the
 * reason the step exists. This is "how the model works and why it looks
 * like this" in one screen. Desktop reads like a table:
 * step + number | what happens | why.
 */
export function JourneySection() {
  return (
    <NarrativeShell id="sciezka-klienta" width="wide">
      <SectionHeader eyebrow="4 · Jak działa model" before="Ścieżka klienta w studiu" underline="i dlaczego tak" />

      {/* Column labels — desktop only */}
      <div className="mt-8 hidden w-full grid-cols-[19rem_1fr_1fr] gap-6 px-6 text-[0.66rem] font-extrabold uppercase tracking-[0.16em] text-neutral-500 lg:grid">
        <p>Etap i liczby</p>
        <p>Co się dzieje</p>
        <p>Dlaczego tak</p>
      </div>

      <ol className="mt-7 w-full space-y-3 lg:mt-2">
        {CLIENT_JOURNEY.map((s) => (
          <li
            key={s.step}
            className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5 lg:grid lg:grid-cols-[19rem_1fr_1fr] lg:gap-6 lg:p-6"
          >
            <div>
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-[0.85rem] font-extrabold text-white">
                  {s.step}
                </span>
                <h3 className="text-[1rem] font-extrabold leading-snug text-neutral-900 lg:text-[1.05rem]">{s.title}</h3>
              </div>
              <p className="mt-2.5 inline-block rounded-lg bg-orange-50 px-2 py-1 text-[0.78rem] font-extrabold leading-snug text-[#c2410c]">
                {s.metric}
              </p>
            </div>
            <p className="mt-2.5 text-[0.86rem] leading-[1.55] text-neutral-700 lg:mt-0 lg:text-[0.9rem]">{s.body}</p>
            <p className="mt-2.5 border-l-2 border-[#ea580c] pl-3 text-[0.84rem] leading-[1.5] text-neutral-800 lg:mt-0 lg:text-[0.9rem]">
              <span className="font-extrabold lg:hidden">Dlaczego: </span>
              {s.why}
            </p>
          </li>
        ))}
      </ol>

      <div className="mt-5 grid w-full grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Unit economics in one line */}
        <div className="flex w-full flex-col justify-center rounded-2xl bg-neutral-900 p-5 text-white sm:p-6">
          <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-neutral-400">Ekonomia jednego klienta</p>
          <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-center">
            <div>
              <p className="font-display text-[1.2rem] font-extrabold leading-none min-[390px]:text-[1.3rem] sm:text-[1.5rem]">100–200 zł</p>
              <p className="mt-1.5 text-[0.72rem] leading-snug text-neutral-400 sm:text-[0.76rem]">wydajesz na reklamę za klienta, który kupi</p>
            </div>
            <span className="text-[1.4rem] text-[#fb923c]" aria-hidden="true">→</span>
            <div>
              <p className="font-display text-[1.2rem] font-extrabold leading-none text-[#fb923c] min-[390px]:text-[1.3rem] sm:text-[1.5rem]">20–40 tys. zł</p>
              <p className="mt-1.5 text-[0.72rem] leading-snug text-neutral-400 sm:text-[0.76rem]">zarabiasz na nim przez ok. 2 lata (LTV)</p>
            </div>
          </div>
          <p className="mt-4 text-center text-[0.9rem] font-extrabold">Zwrot rzędu 200×</p>
        </div>

        {/* A taste of the program */}
        <div className="w-full rounded-2xl border-2 border-[#faea75] bg-[#fffbe0] p-4 sm:p-5 lg:p-6">
          <p className="text-[0.66rem] font-extrabold uppercase tracking-[0.16em] text-neutral-700">Wskazówka z programu</p>
          <p className="mt-1.5 text-[0.88rem] leading-[1.6] text-neutral-800 lg:text-[0.92rem]">
            Wystaw materiały sprzedażowe przed wejściem do studia — zdjęcia z wyjazdów i transformacje klientów. To podgrzewa klientów, zanim jeszcze wejdą do środka. Takich wskazówek, wziętych z życia, raczej nie znajdziesz w internecie — to przedsmak tego, co dostajesz w programie.
          </p>
        </div>
      </div>
    </NarrativeShell>
  );
}
