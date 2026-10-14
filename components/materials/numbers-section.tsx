import { NarrativeShell, SectionHeader } from "@/components/narrative/section-header";
import { OWNER_KPIS, OWNER_OPERATIONS } from "@/lib/materials";

/** The owner's numbers, scannable: KPI tiles + operating costs. */
export function NumbersSection() {
  return (
    <NarrativeShell tone="panel" id="liczby" width="wide">
      <SectionHeader eyebrow="3 · Liczby dla właściciela" before="Ile zarabiasz i" underline="ile to kosztuje" />

      <div className="mt-7 grid w-full grid-cols-2 gap-2 sm:gap-2.5 lg:grid-cols-3 lg:gap-3">
        {OWNER_KPIS.map((k) => (
          <div
            key={k.label}
            className={`flex flex-col rounded-2xl border bg-white p-3 min-[390px]:p-3.5 sm:p-4 lg:p-5 ${
              k.accent ? "border-2 border-[#ea580c]" : "border-neutral-200"
            }`}
          >
            <p className="text-[0.6rem] font-extrabold uppercase leading-snug tracking-[0.1em] text-neutral-500 min-[390px]:text-[0.64rem] sm:text-[0.68rem] sm:tracking-[0.14em]">
              {k.label}
            </p>
            <p className="mt-1 font-display text-[1.02rem] font-extrabold leading-tight text-neutral-900 min-[390px]:text-[1.12rem] sm:text-[1.35rem] lg:text-[1.55rem]">
              {k.value}
            </p>
            <p className="mt-1 text-[0.74rem] leading-[1.4] text-neutral-600 sm:text-[0.8rem] lg:text-[0.84rem]">{k.note}</p>
          </div>
        ))}
      </div>

      <div className="mt-3 w-full overflow-hidden rounded-2xl border border-neutral-200 bg-white lg:mt-4">
        <p className="border-b border-neutral-200 px-4 py-3 text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-neutral-500 lg:px-5">
          Koszty operacyjne i zespół
        </p>
        <dl className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {OWNER_OPERATIONS.map((row, i) => (
            <div
              key={row.label}
              className={`flex items-start justify-between gap-4 border-neutral-100 px-4 py-3 md:flex-col-reverse md:justify-end md:gap-1 md:px-5 md:py-4 ${
                i > 0 ? "border-t md:border-t-0" : ""
              } ${i % 2 === 1 ? "md:border-l" : ""} ${i >= 2 ? "md:border-t lg:border-t-0" : ""} ${i > 0 ? "lg:border-l" : ""}`}
            >
              <dt className="text-[0.86rem] font-semibold leading-[1.45] text-neutral-700 md:text-[0.8rem]">{row.label}</dt>
              <dd className="whitespace-nowrap text-[0.86rem] font-extrabold text-neutral-900 md:font-display md:text-[1.3rem]">{row.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <p className="mt-4 text-center text-[0.84rem] leading-[1.55] text-neutral-600">
        Cel właściciela: oddać operacje zespołowi i otwierać kolejne placówki.
      </p>
    </NarrativeShell>
  );
}
