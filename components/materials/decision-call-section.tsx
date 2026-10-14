"use client";

import { useState } from "react";
import { CheckMark, NarrativeShell, SectionHeader } from "@/components/narrative/section-header";
import { MATERIALS_CHECKLIST } from "@/lib/materials";
import { track } from "@/lib/track";

/**
 * Closing block: a self-check of the mandatory materials, then the next step.
 * The checkboxes are for the prospect only (nothing is stored) — they make the
 * "no materials, no call" rule concrete without a login or a form.
 */
export function DecisionCallSection() {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const allDone = MATERIALS_CHECKLIST.every((i) => done[i.id]);

  const toggle = (id: string) => {
    setDone((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      if (next[id]) track(`cta_materialy_check_${id}`, { once: true });
      if (MATERIALS_CHECKLIST.every((i) => next[i.id])) track("cta_materialy_ready", { once: true });
      return next;
    });
  };

  return (
    <NarrativeShell id="nastepny-krok" width="wide">
      <SectionHeader eyebrow="10 · Następny krok" before="Rozmowa" underline="decyzyjna" />

      <p className="mt-4 max-w-xl text-center text-[0.9rem] leading-[1.55] text-neutral-700 sm:text-[0.98rem]">
        Skoro nadal jesteś zainteresowany — zapraszamy Cię na rozmowę decyzyjną. Poznasz na niej więcej szczegółów i razem z naszym ekspertem zdecydujesz, czy w to wchodzisz.
      </p>

      <div className="mt-6 grid w-full grid-cols-1 gap-4 md:max-w-xl lg:max-w-none lg:grid-cols-2 lg:items-stretch">
      <fieldset className="w-full rounded-2xl border border-neutral-200 p-4 sm:p-5">
        <legend className="px-1 text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-neutral-500">
          Sprawdź, czy jesteś gotowy
        </legend>
        <div className="space-y-2">
          {MATERIALS_CHECKLIST.map((item) => (
            <label
              key={item.id}
              className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors ${
                done[item.id] ? "border-emerald-600 bg-emerald-50" : "border-neutral-200 bg-white hover:border-neutral-400"
              }`}
            >
              <input
                type="checkbox"
                checked={!!done[item.id]}
                onChange={() => toggle(item.id)}
                className="h-5 w-5 shrink-0 accent-emerald-600"
              />
              <span className="text-[0.9rem] font-semibold text-neutral-900">{item.title}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div
        aria-live="polite"
        className={`flex w-full flex-col justify-center rounded-2xl p-5 sm:p-6 lg:p-8 ${allDone ? "bg-emerald-700 text-white" : "bg-neutral-900 text-white"}`}
      >
        {allDone ? (
          <div className="flex gap-3">
            <CheckMark className="h-6 w-6 text-white" />
            <div>
              <p className="text-[1rem] font-extrabold leading-snug">Jesteś gotowy na rozmowę decyzyjną.</p>
              <p className="mt-1 text-[0.86rem] leading-[1.55] text-emerald-50">
                Do zobaczenia w umówionym terminie. Zanotuj pytania, które pojawiły się podczas lektury — od nich zaczniemy.
              </p>
            </div>
          </div>
        ) : (
          <>
            <p className="text-[1rem] font-extrabold leading-snug">Bez tych trzech kroków rozmowa się nie odbędzie.</p>
            <p className="mt-1 text-[0.86rem] leading-[1.55] text-neutral-300">
              Zaznacz każdy punkt, gdy go skończysz. Jeśli po lekturze uznasz, że to nie dla Ciebie — daj nam znać i zrezygnuj z rozmowy.
            </p>
          </>
        )}
      </div>
      </div>
    </NarrativeShell>
  );
}
