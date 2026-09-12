"use client";

import React from "react";
import Image from "next/image";
import { CountdownTimer } from "@/components/countdown-timer";
import { LegalFooter } from "@/components/legal-footer";

export default function ReplayPage() {
  // Configuration variables
  const wistiaMediaId = ""; // Wklej tutaj ID z Wistia, np. "abc123xyz"
  const expirationDate = "2026-09-19T23:59:59+02:00";
  const expirationLabel = "Ograniczony czas transmisji";
  const ctaHref = "/special-offer";
  const ctaText = "Odbierz ofertę specjalną";

  return (
    <div className="flex min-h-screen w-full flex-col justify-between bg-white font-sans selection:bg-orange-200">
      <main className="relative flex w-full flex-1 flex-col items-center overflow-x-hidden px-4 pt-5 pb-16 sm:px-6 sm:pt-8 sm:pb-20">
        <div className="mx-auto flex w-full max-w-[24rem] sm:max-w-[34rem] md:max-w-[44rem] lg:max-w-[48rem] flex-col items-center">
          
          {/* Expiration Scarcity Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#fed7aa] bg-[#fff7ed] px-3.5 py-1.5 shadow-xs">
            <span className="relative flex h-2.5 w-2.5 shrink-0 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#f87171] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#ef4444]" />
            </span>
            <span className="text-[0.74rem] sm:text-[0.8rem] font-black uppercase tracking-[0.14em] text-[#7c2d12]">
              {expirationLabel}
            </span>
          </div>

          {/* Heading */}
          <h1 className="mt-3 text-center text-[1.45rem] min-[390px]:text-[1.7rem] sm:text-[2.25rem] font-black leading-[1.18] tracking-tight text-neutral-900">
            Obejrzyj pełne nagranie <span className="text-[#ea580c]">szkolenia</span>
          </h1>

          <p className="mt-2 text-center text-[0.8rem] min-[390px]:text-[0.85rem] sm:text-[0.92rem] font-normal leading-[1.4] text-neutral-600">
            Przygotuj notatki i obejrzyj nagranie, zanim licznik dobiegnie końca, a dostęp zostanie zablokowany.
          </p>

          {/* Video Player Card Frame */}
          <div className="mt-5 w-full">
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[16px] sm:rounded-[22px] border-[3.5px] sm:border-[4.5px] border-[#ea580c] bg-black shadow-[0_8px_32px_rgba(234,88,12,0.16)]">
              {wistiaMediaId ? (
                <iframe
                  src={`https://fast.wistia.net/embed/iframe/${wistiaMediaId}?videoFoam=true`}
                  title="Nagranie powtórki szkolenia"
                  allow="autoplay; fullscreen"
                  className="h-full w-full border-none"
                />
              ) : (
                <div className="relative flex h-full w-full select-none flex-col justify-between bg-[#0c0a09] bg-[radial-gradient(ellipse_at_top_left,_#29180c_0%,_#140e0a_40%,_#0c0a09_100%)] p-4 text-white sm:p-7">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      <div className="relative flex h-11 w-11 sm:h-14 sm:w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl sm:rounded-2xl border border-[#fed7aa]/30 bg-white/10 backdrop-blur-xs">
                        <Image
                          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&h=128&fit=crop&crop=face"
                          alt="Prelegent"
                          width={56}
                          height={56}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[0.88rem] sm:text-[1.12rem] font-black leading-tight text-white tracking-tight">
                          Bartłomiej Sikorski
                        </span>
                        <span className="mt-0.5 text-[0.62rem] sm:text-[0.72rem] font-bold text-stone-400">
                          Właściciel Studiów Treningu Personalnego
                        </span>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/60 px-2.5 py-1 text-[0.58rem] sm:text-[0.65rem] font-extrabold uppercase tracking-wider text-emerald-400 backdrop-blur-xs">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      POWTÓRKA TRANSMISJI
                    </span>
                  </div>

                  <div className="my-auto py-2">
                    <h2 className="text-[1.18rem] min-[390px]:text-[1.38rem] sm:text-[1.95rem] md:text-[2.25rem] font-black leading-[1.12] tracking-tight">
                      Jak poukładać studio treningu, <br />
                      <span className="underline decoration-[#ea580c] decoration-[3px] underline-offset-[3px] sm:decoration-[4px]">
                        odzyskać wolny czas
                      </span>
                      <br />
                      <span className="text-[#ea580c]">i przebić 20 000 zł zysku!</span>
                    </h2>

                    <p className="mt-2 max-w-[28rem] text-[0.66rem] sm:text-[0.76rem] font-normal leading-[1.35] text-stone-300 line-clamp-3 sm:line-clamp-none">
                      &bdquo;W tym materiale pokazujemy dokładny, przetestowany proces operacyjny i sprzedażowy, który pozwolił 50 placówkom zejść z sali treningowej i zbudować rentowny, przewidywalny biznes.&rdquo;
                    </p>
                  </div>

                  <div className="w-full">
                    <div className="relative h-1 w-full overflow-hidden rounded-full bg-white/15 sm:h-1.5">
                      <div className="h-full w-1/3 bg-[#ea580c]" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Countdown Block */}
          <div className="mt-7 flex w-full flex-col items-center">
            <span className="text-[0.7rem] sm:text-[0.75rem] font-extrabold uppercase tracking-[0.14em] text-[#ea580c]">
              DOSTĘP WYGASA ZA
            </span>
            <div className="mt-2.5 w-full max-w-[21.5rem] sm:max-w-[23.5rem]">
              <CountdownTimer target={expirationDate} />
            </div>
          </div>

          {/* Primary Action CTA */}
          {ctaHref && (
            <div className="mt-6 flex w-full flex-col items-center">
              <a
                href={ctaHref}
                className="group relative flex w-full max-w-[20rem] min-[390px]:max-w-[22.5rem] flex-col items-center justify-center overflow-hidden rounded-xl bg-gradient-to-b from-[#ea580c] to-[#c2410c] px-4 py-3 text-center shadow-md shadow-orange-500/20 transition-all hover:brightness-105 active:scale-[0.98]"
              >
                {/* Subtle top reflection gloss highlight */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-[30%] bg-gradient-to-b from-white/20 to-transparent" />
                
                <span className="relative inline-flex items-center justify-center gap-1.5 text-[0.92rem] min-[390px]:text-[1rem] sm:text-[1.05rem] font-black uppercase tracking-tight text-white whitespace-nowrap">
                  <span>&raquo;</span>
                  <span>{ctaText}</span>
                  <span>&laquo;</span>
                </span>

                <span className="relative mt-0.5 text-[0.66rem] sm:text-[0.7rem] font-semibold text-orange-100/90 leading-tight">
                  Natychmiastowy dostęp &bull; 100% gwarancja satysfakcji
                </span>
              </a>

              <p className="mt-2 text-center text-[0.72rem] font-medium text-neutral-500">
                Specjalne bonusy do powtórki oraz promocyjna oferta są dostępne wyłącznie przez ograniczony czas.
              </p>
            </div>
          )}

        </div>
      </main>

      <LegalFooter />
    </div>
  );
}