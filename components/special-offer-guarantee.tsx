"use client";

import React from "react";
import { CountdownTimer } from "./countdown-timer";
import { LegalFooter } from "./legal-footer";

export function SpecialOfferGuarantee() {
  const EXPIRATION_DATE = "2026-09-19T23:59:59+02:00"; 

  return (
    <>
      <section className="relative w-full bg-[#fffcf9] border-t border-neutral-200/80 pt-8 pb-16 px-4 sm:px-6 selection:bg-orange-200">
        <div className="mx-auto flex w-full max-w-[23rem] sm:max-w-[27rem] flex-col items-center">
          
          {/* Guarantee Badge */}
          <div className="inline-flex items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-0.5 shadow-2xs">
            <span className="text-[0.66rem] font-bold uppercase tracking-[0.16em] text-emerald-800">
              BEZPIECZEŃSTWO WSPÓŁPRACY
            </span>
          </div>

          {/* Section Heading */}
          <h2 className="mt-3 text-center text-[1.65rem] min-[390px]:text-[1.9rem] sm:text-[2.2rem] font-black leading-tight tracking-tight text-neutral-900">
            Gwarancja ZYSKU <span className="text-[#ea580c]">20,000 zł msc.</span>
          </h2>

          {/* Guarantee Copy */}
          <div className="mt-4 w-full text-center space-y-3">
            <p className="text-[0.84rem] min-[390px]:text-[0.9rem] sm:text-[0.98rem] font-normal leading-[1.48] tracking-tight text-neutral-700">
              Dołączasz do programu i zostajesz w nim z nami tak długo, aż osiągniesz minimum{" "}
              <strong className="font-bold text-neutral-900">
                20 000 złotych zysku właścicielskiego miesięcznie
              </strong>.
            </p>

            <p className="text-[0.84rem] min-[390px]:text-[0.9rem] sm:text-[0.98rem] font-bold text-neutral-900 leading-snug">
              Liczy się wynik. Dopóki go nie osiągniesz — pracujemy dalej,{" "}
              <span className="text-[#ea580c]">bez żadnych dodatkowych opłat</span>.
            </p>
          </div>

          {/* Scarcity Note */}
          <p className="mt-7 text-center text-[0.78rem] sm:text-[0.84rem] font-black uppercase tracking-tight text-neutral-900">
            LICZBA MIEJSC JEST OGRANICZONA – DECYDUJE KOLEJNOŚĆ ZGŁOSZEŃ. APLIKUJ TERAZ!
          </p>

          {/* Primary Action CTA */}
          <div className="mt-3.5 flex w-full justify-center">
            <a
              id="register"
              href="#aplikacja"
              className="group relative flex w-full max-w-[20rem] min-[390px]:max-w-[22.5rem] flex-col items-center justify-center overflow-hidden rounded-xl bg-gradient-to-b from-[#ea580c] to-[#c2410c] px-4 py-3 text-center shadow-md shadow-orange-500/20 transition-all hover:brightness-105 active:scale-[0.98]"
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-[30%] bg-gradient-to-b from-white/20 to-transparent" />
              <span className="relative inline-flex items-center justify-center gap-1.5 text-[0.98rem] min-[390px]:text-[1.05rem] font-black uppercase tracking-tight text-white whitespace-nowrap">
                <span>&raquo;</span>
                <span>WYPEŁNIJ APLIKACJĘ</span>
                <span>&laquo;</span>
              </span>
            </a>
          </div>

          {/* Warning Expiry Label */}
          <p className="mt-8 text-center text-[0.85rem] font-black uppercase tracking-tight text-red-600">
            Uwaga! Oferta wygasa za...
          </p>

          {/* Bottom Countdown */}
          <div className="mt-3 w-full">
            <CountdownTimer target={EXPIRATION_DATE} />
          </div>

        </div>
      </section>

      <LegalFooter />
    </>
  );
}