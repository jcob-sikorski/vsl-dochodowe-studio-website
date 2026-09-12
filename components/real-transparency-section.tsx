"use client";

import React from "react";

export function RealTransparencySection() {
  return (
    <section className="relative w-full bg-white font-sans selection:bg-orange-200 flex flex-col items-center overflow-x-hidden pt-4 pb-14 px-4 sm:px-6">
      <div className="mx-auto flex w-full max-w-[24rem] sm:max-w-[27rem] flex-col items-center">

        {/* Eyebrow Pill */}
        <div className="inline-flex items-center justify-center rounded-full border-[1.5px] border-neutral-300 bg-neutral-50 px-3.5 py-1 shadow-2xs">
          <span className="text-[0.7rem] font-extrabold uppercase tracking-[0.14em] text-neutral-900">
            Dane z 50 placówek
          </span>
        </div>

        {/* Section Heading */}
        <h2 className="mt-3 text-center text-[1.35rem] min-[390px]:text-[1.5rem] sm:text-[1.7rem] font-extrabold leading-tight tracking-tight text-neutral-900">
          Ekonomia studia treningowego: <br />
          <span className="underline decoration-neutral-900 decoration-2 underline-offset-2">
            marże i czas wdrożenia
          </span>
        </h2>

        {/* Subtitle */}
        <p className="mt-2.5 text-center text-[0.88rem] sm:text-[0.94rem] font-light leading-[1.5] text-neutral-600">
          Zamiast pustych obietnic o „milionach w 2 tygodnie" — tak realnie wygląda poukładanie studia treningu personalnego.
        </p>

        {/* 3 Real Data Counter Badges */}
        <div className="mt-6 grid w-full grid-cols-3 gap-2.5">
          <div className="flex flex-col items-center justify-center rounded-2xl border-[1.5px] border-neutral-300 bg-[#faea75] py-3.5 px-1 text-center shadow-2xs">
            <span className="text-[1.2rem] sm:text-[1.35rem] font-black text-neutral-950 tracking-tight">
              50–80%
            </span>
            <span className="mt-1 text-[0.7rem] sm:text-[0.74rem] font-bold text-neutral-800 leading-tight">
              marża
            </span>
          </div>

          <div className="flex flex-col items-center justify-center rounded-2xl border border-neutral-200 bg-neutral-50 py-3.5 px-1 text-center shadow-2xs">
            <span className="text-[1.2rem] sm:text-[1.35rem] font-black text-neutral-900 tracking-tight">
              7 dni–6 msc
            </span>
            <span className="mt-1 text-[0.7rem] sm:text-[0.74rem] font-bold text-neutral-500 leading-tight">
              wdrożenie
            </span>
          </div>

          <div className="flex flex-col items-center justify-center rounded-2xl border border-neutral-200 bg-neutral-50 py-3.5 px-1 text-center shadow-2xs">
            <span className="text-[1.2rem] sm:text-[1.35rem] font-black text-neutral-900 tracking-tight">
              ~5h/tydz.
            </span>
            <span className="mt-1 text-[0.7rem] sm:text-[0.74rem] font-bold text-neutral-500 leading-tight">
              Twoja praca
            </span>
          </div>
        </div>

        {/* Outcome Breakdown Cards — one clear heading per card, plain body text */}
        <div className="mt-6 flex w-full flex-col gap-4">

          {/* Card 1: Standard Success Model */}
          <div className="w-full rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5 shadow-2xs">
            <div className="inline-flex items-center rounded-md bg-[#faea75] px-2 py-0.5">
              <span className="text-[0.68rem] font-bold text-neutral-950">
                Większość studiów
              </span>
            </div>

            <h3 className="mt-2.5 text-[1rem] sm:text-[1.05rem] font-extrabold text-neutral-900 leading-snug">
              Zejście z sali i ~5h pracy tygodniowo
            </h3>

            <p className="mt-2 text-[0.85rem] sm:text-[0.88rem] text-neutral-700 leading-[1.55]">
              W ciągu <strong>6–7 miesięcy</strong> właściciel przestaje prowadzić 30–40 treningów tygodniowo — przejmuje je zatrudniony zespół. Studio generuje <strong>50–80% czystej marży</strong>, a rola właściciela to nadzór, marketing i zarządzanie — ok. 5 godzin w tygodniu.
            </p>
          </div>

          {/* Card 2: Slower Adaptation */}
          <div className="w-full rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5 shadow-2xs">
            <div className="inline-flex items-center rounded-md bg-neutral-100 px-2 py-0.5">
              <span className="text-[0.68rem] font-bold text-neutral-700">
                U części właścicieli (10–15%)
              </span>
            </div>

            <h3 className="mt-2.5 text-[1rem] sm:text-[1.05rem] font-extrabold text-neutral-900 leading-snug">
              Wolniejsze delegowanie, dłuższa rekrutacja
            </h3>

            <p className="mt-2 text-[0.85rem] sm:text-[0.88rem] text-neutral-700 leading-[1.55]">
              Zamiast 6–7 miesięcy proces trwa 8–10. Zwykle wynika to z bariery psychicznej przed oddaniem wieloletnich podopiecznych nowym trenerom, albo z wolniejszej rekrutacji. Studio wciąż jest zyskowne — zejście z sali po prostu trwa dłużej.
            </p>
          </div>

          {/* Card 3: When Things Fail / Refunds */}
          <div className="w-full rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5 shadow-2xs">
            <div className="inline-flex items-center rounded-md bg-neutral-100 px-2 py-0.5">
              <span className="text-[0.68rem] font-bold text-neutral-700">
                Kiedy pojawiają się zwroty
              </span>
            </div>

            <h3 className="mt-2.5 text-[1rem] sm:text-[1.05rem] font-extrabold text-neutral-900 leading-snug">
              Tylko przy nagłej rezygnacji z biznesu
            </h3>

            <p className="mt-2 text-[0.85rem] sm:text-[0.88rem] text-neutral-700 leading-[1.55]">
              Jedyny powód braku wyników to <strong>nagłe sytuacje życiowe</strong>, przez które właściciel całkowicie rezygnuje z prowadzenia studia (problemy zdrowotne, przeprowadzka, zamknięcie lokalu). W takich przypadkach zwracamy środki bez zbędnych pytań.
            </p>
          </div>

        </div>

        {/* Closing Truth Callout */}
        <div className="mt-6 w-full rounded-2xl border border-neutral-200 bg-neutral-50 p-4 sm:p-5">
          <p className="text-[0.85rem] sm:text-[0.88rem] text-neutral-700 leading-[1.55]">
            Szukasz magicznego przycisku i nie chcesz zatrudniać trenerów? To nie zadziała. Chcesz poukładać studio na 50–80% marży i pracować 5h w tygodniu jako przedsiębiorca? <strong className="text-neutral-900">To jedyna sprawdzona droga.</strong>
          </p>
        </div>

      </div>
    </section>
  );
}
