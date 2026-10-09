"use client";

import { useState } from "react";
import { TARGET_MONTHLY_PROFIT } from "@/lib/narrative";
import { tag, track } from "@/lib/track";

const pln = new Intl.NumberFormat("pl-PL", { maximumFractionDigits: 0 });

function monthsLabel(m: number): string {
  if (m === 1) return "1 miesiąc";
  const lastTwo = m % 100;
  const last = m % 10;
  if (last >= 2 && last <= 4 && !(lastTwo >= 12 && lastTwo <= 14)) return `${m} miesiące`;
  return `${m} miesięcy`;
}

/**
 * "Ile kosztuje czekanie" — a slider from 1 to 60 months. Pure arithmetic
 * against the target, framed as potential, never as a promise.
 */
export function CostOfWaiting() {
  const [months, setMonths] = useState(60);
  const lost = months * TARGET_MONTHLY_PROFIT;

  return (
    <div className="w-full rounded-2xl bg-neutral-900 p-5 text-white sm:p-6">
      <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-neutral-400">Ile kosztuje czekanie</p>

      <label htmlFor="cost-of-waiting" className="mt-3 block text-[0.92rem] leading-snug text-neutral-200">
        Jeśli odłożę decyzję o <span className="font-extrabold text-white">{monthsLabel(months)}</span>
      </label>
      <input
        id="cost-of-waiting"
        type="range"
        min={1}
        max={60}
        step={1}
        value={months}
        onChange={(e) => {
          setMonths(Number(e.target.value));
          track("cost_slider_used", { once: true });
        }}
        onPointerUp={() => {
          tag("cost_slider_months", String(months));
          track("cost_slider_set", { value: String(months) });
        }}
        onKeyUp={() => {
          tag("cost_slider_months", String(months));
          track("cost_slider_set", { value: String(months) });
        }}
        className="mt-3 w-full accent-[#ea580c]"
      />
      <div className="mt-1 flex justify-between text-[0.7rem] text-neutral-500">
        <span>1 mies.</span>
        <span>5 lat</span>
      </div>

      <p className="mt-4 text-[0.86rem] text-neutral-300">tracę potencjał</p>
      <p className="font-display text-[2.1rem] font-extrabold leading-none tabular-nums text-[#fb923c] sm:text-[2.5rem]">
        min. {pln.format(lost)} zł
      </p>

      <p className="mt-4 text-[0.72rem] leading-[1.5] text-neutral-500">
        Wyliczenie przy celu {pln.format(TARGET_MONTHLY_PROFIT)} zł zysku miesięcznie. To potencjał, nie gwarancja wyniku. Wyniki uczestników są zróżnicowane.
      </p>
    </div>
  );
}
