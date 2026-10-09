import { NarrativeShell, SectionHeader } from "@/components/narrative/section-header";
import { TEXT_FAQ } from "@/lib/narrative";

/** Written FAQ — native <details>, no JS needed. */
export function TextFaqSection() {
  return (
    <NarrativeShell tone="panel" id="pytania">
      <SectionHeader eyebrow="Zanim zadzwonimy" before="Pytania, które" underline="słyszymy najczęściej" />
      <div className="mt-7 w-full space-y-2.5">
        {TEXT_FAQ.map((f) => (
          <details key={f.q} className="group rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[0.96rem] font-extrabold text-neutral-900 [&::-webkit-details-marker]:hidden">
              {f.q}
              <span className="text-[1.2rem] leading-none text-neutral-400 transition-transform group-open:rotate-45" aria-hidden="true">+</span>
            </summary>
            <p className="mt-2.5 text-[0.88rem] leading-[1.6] text-neutral-700">{f.a}</p>
          </details>
        ))}
      </div>
    </NarrativeShell>
  );
}
