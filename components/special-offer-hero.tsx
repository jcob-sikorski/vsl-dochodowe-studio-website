"use client";

import React from "react";
import { CountdownTimer } from "./countdown-timer";

export function SpecialOfferHero() {
  const EXPIRATION_DATE = "2026-09-19T23:59:59+02:00"; 

  return (
    <section className="relative w-full bg-white pt-4 pb-10 px-4 sm:px-6 flex flex-col items-center overflow-x-hidden selection:bg-orange-200">
      <div className="mx-auto flex w-full max-w-[23rem] sm:max-w-[27rem] flex-col items-center">
        
        {/* Scarcity Pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3.5 py-1 shadow-2xs">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#f87171] opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#ef4444]" />
          </span>
          <span className="text-[0.68rem] sm:text-[0.74rem] font-black uppercase tracking-[0.12em] text-red-700">
            TYLKO 2 DOSTĘPNE MIEJSCA
          </span>
        </div>

        {/* Main Headline */}
        <h1 className="mt-3 text-center text-[1.95rem] min-[390px]:text-[2.2rem] sm:text-[2.6rem] font-black leading-[1.12] tracking-tight text-neutral-900">
          Tak, Panowie — <br />
          <span className="text-[#ea580c]">Wchodzę w to!</span>
        </h1>

        {/* Expiry Subhead */}
        <p className="mt-2 text-center text-[0.85rem] sm:text-[0.92rem] font-semibold text-neutral-600">
          Oferta wygasa za...
        </p>

        {/* Countdown Box */}
        <div className="mt-3 w-full">
          <CountdownTimer target={EXPIRATION_DATE} />
        </div>

        {/* Subheadline */}
        <p className="mt-5 w-full text-center text-[0.84rem] min-[390px]:text-[0.9rem] sm:text-[0.98rem] font-normal leading-[1.45] tracking-tight text-neutral-700">
          Zapisując się dzisiaj, gwarantujesz sobie aplikację do{" "}
          <span className="font-bold text-neutral-900">programu Dochodowe Studio</span>, gdzie nauczysz się od{" "}
          <span className="font-bold text-[#ea580c]">Bartłomieja Sikorskiego</span>, jak zyskać spokój, stabilny dochód bez stania na sali, pełną kontrolę nad marżą oraz jak zduplikować to know-how na kolejne swoje placówki.
        </p>

        <p className="mt-6 text-center text-[0.78rem] sm:text-[0.84rem] font-black uppercase tracking-tight text-neutral-900">
          LICZBA MIEJSC JEST OGRANICZONA – DECYDUJE KOLEJNOŚĆ ZGŁOSZEŃ. APLIKUJ TERAZ!
        </p>

        {/* Primary Action CTA */}
        <div className="mt-3 flex w-full justify-center">
          <a
            href="#register"
            className="group relative flex w-full max-w-[20rem] min-[390px]:max-w-[22.5rem] flex-col items-center justify-center overflow-hidden rounded-xl bg-gradient-to-b from-[#ea580c] to-[#c2410c] px-4 py-3 text-center shadow-md shadow-orange-500/20 transition-all hover:brightness-105 active:scale-[0.98]"
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[30%] bg-gradient-to-b from-white/20 to-transparent" />
            <span className="relative inline-flex items-center justify-center gap-1.5 text-[0.98rem] min-[390px]:text-[1.05rem] font-black uppercase tracking-tight text-white whitespace-nowrap">
              <span>&raquo;</span>
              <span>APLIKUJ TUTAJ</span>
              <span>&laquo;</span>
            </span>
          </a>
        </div>

        {/* Bullet Section Header */}
        <div className="mt-7 mb-3 flex w-full items-center gap-3">
          <span className="shrink-0 text-[0.7rem] sm:text-[0.75rem] font-extrabold uppercase tracking-[0.14em] text-[#ea580c]">
            Co dzieje się po aplikacji
          </span>
          <div className="h-[1px] flex-1 bg-neutral-200" />
        </div>

        {/* Co dzieje się po aplikacji / Etapy & Korzyści */}
        <div className="flex w-full flex-col gap-3">
          {/* Krok 1 */}
          <div className="flex items-start gap-3 rounded-2xl border border-neutral-200/90 bg-white p-3.5 shadow-2xs">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[#fed7aa] bg-[#fff7ed] text-[0.75rem] font-black text-[#ea580c]">
              01
            </div>
            <div className="flex flex-col">
              <h4 className="text-[0.86rem] sm:text-[0.9rem] font-bold text-neutral-900 leading-snug">
                Wstępna weryfikacja (krótki telefon)
              </h4>
              <p className="mt-1 text-[0.78rem] text-neutral-600 leading-[1.38]">
                Nasz konsultant dzwoni do Ciebie, aby zadać kilka kluczowych pytań o Twoją obecną sytuację, zweryfikować czy kwalifikujesz się do programu i ustalić termin pełnej sesji diagnostycznej.
              </p>
            </div>
          </div>

          {/* Krok 2 */}
          <div className="flex items-start gap-3 rounded-2xl border border-neutral-200/90 bg-white p-3.5 shadow-2xs">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[#fed7aa] bg-[#fff7ed] text-[0.75rem] font-black text-[#ea580c]">
              02
            </div>
            <div className="flex flex-col">
              <h4 className="text-[0.86rem] sm:text-[0.9rem] font-bold text-neutral-900 leading-snug">
                Bezpłatna diagnoza i rozmowa strategiczna
              </h4>
              <p className="mt-1 text-[0.78rem] text-neutral-600 leading-[1.38]">
                Podczas rozmowy 1:1 prześwietlimy Twój biznes i precyzyjnie zlokalizujemy wąskie gardła w grafiku, cenach i zespole. Dowiesz się dokładnie, czego brakuje w Twoim studiu, abyś mógł bezpiecznie wyjść z sali.
              </p>
            </div>
          </div>

          {/* Krok 3 */}
          <div className="flex items-start gap-3 rounded-2xl border border-neutral-200/90 bg-white p-3.5 shadow-2xs">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[#fed7aa] bg-[#fff7ed] text-[0.75rem] font-black text-[#ea580c]">
              03
            </div>
            <div className="flex flex-col">
              <h4 className="text-[0.86rem] sm:text-[0.9rem] font-bold text-neutral-900 leading-snug">
                Spersonalizowany plan wdrożenia na 6 miesięcy
              </h4>
              <p className="mt-1 text-[0.78rem] text-neutral-600 leading-[1.38]">
                Jeśli zobaczymy pełne dopasowanie – pokażemy Ci gotową ścieżkę wdrożenia naszych modułów operacyjnych, która pozwoli zdjąć Ciebie z sali treningowej i zwiększyć zysk właścicielski do 20 000 – 70 000 zł miesięcznie.
              </p>
            </div>
          </div>

        {/* Korzyść: Procedury Sportowe Przedmieście & Niezależność */}
          <div className="flex items-start gap-3 rounded-2xl border border-neutral-200/90 bg-white p-3.5 shadow-2xs">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[#fed7aa] bg-[#fff7ed] text-[#ea580c]">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
            <div className="flex flex-col">
              <h4 className="text-[0.86rem] sm:text-[0.9rem] font-bold text-neutral-900 leading-snug">
                Procedury Sportowe Przedmieście (bez opłat licencyjnych) &amp; pełna niezależność
              </h4>
              <p className="mt-1 text-[0.78rem] text-neutral-600 leading-[1.38]">
                Dostajesz na własność sprawdzone w boju procedury i systemy ze studiów Sportowe Przedmieście — <strong>bez kupowania franczyzy i płacenia prowizji licencyjnych</strong>. Do tego otrzymujesz aktywny coaching, bezpośredni kontakt z zamkniętą grupą innych właścicieli dochodowych studiów oraz wszystkie narzędzia, abyś zbudował silną markę, zszedł z sali i stał się w 100% wolnym oraz niezależnym przedsiębiorcą.
              </p>
            </div>
          </div>

          {/* Korzyść 2: Wsparcie zespołu */}
          <div className="flex items-start gap-3 rounded-2xl border border-neutral-200/90 bg-white p-3.5 shadow-2xs">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[#fed7aa] bg-[#fff7ed] text-[#ea580c]">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
            <div className="flex flex-col">
              <h4 className="text-[0.86rem] sm:text-[0.9rem] font-bold text-neutral-900 leading-snug">
                Dedykowane wsparcie doświadczonych praktyków
              </h4>
              <p className="mt-1 text-[0.78rem] text-neutral-600 leading-[1.38]">
                Nasz zespół zadba o to, abyś otrzymał pełną jasność co do każdego etapu wdrożenia i wyciągnął maksymalną wartość biznesową z całej ścieżki.
              </p>
            </div>
          </div>
        </div>

        {/* Urgency Box */}
        <p className="mt-6 text-center text-[0.78rem] sm:text-[0.84rem] font-black uppercase tracking-tight text-neutral-900">
          LICZBA MIEJSC JEST OGRANICZONA – DECYDUJE KOLEJNOŚĆ ZGŁOSZEŃ. APLIKUJ TERAZ!
        </p>

        {/* Secondary Action CTA */}
        <div className="mt-3 flex w-full justify-center">
          <a
            href="#register"
            className="group relative flex w-full max-w-[20rem] min-[390px]:max-w-[22.5rem] flex-col items-center justify-center overflow-hidden rounded-xl bg-gradient-to-b from-[#ea580c] to-[#c2410c] px-4 py-3 text-center shadow-md shadow-orange-500/20 transition-all hover:brightness-105 active:scale-[0.98]"
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[30%] bg-gradient-to-b from-white/20 to-transparent" />
            <span className="relative inline-flex items-center justify-center gap-1.5 text-[0.98rem] min-[390px]:text-[1.05rem] font-black uppercase tracking-tight text-white whitespace-nowrap">
              <span>&raquo;</span>
              <span>APLIKUJ TUTAJ</span>
              <span>&laquo;</span>
            </span>
          </a>
        </div>

      </div>
    </section>
  );
}