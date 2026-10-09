import { NarrativeShell, SectionHeader } from "@/components/narrative/section-header";
import { ScrollToFormCta } from "@/components/scroll-to-form-cta";
import { WINDOW_POINTS, WINDOW_TIMELINE } from "@/lib/narrative";

/** Movement 1 — OKNO: the market window is open now and closing. */
export function WhyNowSection() {
  return (
    <NarrativeShell tone="panel" id="dlaczego-teraz">
      <SectionHeader eyebrow="Dlaczego teraz" before="To jest ten moment," underline="albo nigdy na takich warunkach" />

      <p className="mt-4 max-w-md text-center text-[0.9rem] leading-[1.55] text-neutral-700 sm:text-[0.98rem]">
        Kameralnych studiów jest coraz więcej. Ale wciąż za mało. Dziś jeszcze możesz być pierwszy w swojej okolicy. Za parę lat będziesz trzeci albo piąty.
      </p>

      <ol className="mt-7 w-full space-y-3">
        {WINDOW_POINTS.map((p, i) => (
          <li key={p.title} className="flex gap-3.5 rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-[0.8rem] font-extrabold text-white">
              {i + 1}
            </span>
            <div>
              <h3 className="text-[0.98rem] font-extrabold leading-snug text-neutral-900 sm:text-[1.05rem]">{p.title}</h3>
              <p className="mt-1 text-[0.86rem] leading-[1.55] text-neutral-700 sm:text-[0.92rem]">{p.body}</p>
            </div>
          </li>
        ))}
      </ol>

      {/* The window, drawn as a simple vertical timeline */}
      <div className="mt-8 w-full rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6">
        <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-neutral-500">Twoja okolica w czasie</p>
        <ol className="relative mt-4 space-y-5 border-l-2 border-neutral-200 pl-5">
          {WINDOW_TIMELINE.map((t) => (
            <li key={t.when} className="relative">
              <span
                className={`absolute -left-[1.72rem] top-1 h-3.5 w-3.5 rounded-full border-2 ${
                  t.accent ? "border-[#ea580c] bg-[#ea580c]" : "border-neutral-300 bg-white"
                }`}
                aria-hidden="true"
              />
              <p className={`text-[0.92rem] font-extrabold ${t.accent ? "text-[#c2410c]" : "text-neutral-900"}`}>{t.when}</p>
              <p className="mt-0.5 text-[0.86rem] leading-[1.5] text-neutral-700">{t.what}</p>
            </li>
          ))}
        </ol>
      </div>

      <ScrollToFormCta location="why_now" className="mt-8" />
    </NarrativeShell>
  );
}
