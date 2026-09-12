"use client";

import React from "react";

export function RealTransparencySection() {
  return (
    <section className="relative w-full bg-white font-sans selection:bg-orange-200 flex flex-col items-center overflow-x-hidden pt-4 pb-14 px-4 sm:px-6">
      <div className="mx-auto flex w-full max-w-[22.5rem] sm:max-w-[25.5rem] flex-col items-center">
        
        {/* Step / Topic Tag */}
        <div className="inline-flex items-center justify-center rounded-full border border-[#fed7aa] bg-[#fff7ed] px-3.5 py-0.5 shadow-2xs">
          <span className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-[#ea580c]">
            DANE HISTORYCZNE Z PLACÓWEK
          </span>
        </div>

        {/* Section Heading */}
        <h2 className="mt-2.5 text-center text-[1.28rem] min-[390px]:text-[1.42rem] sm:text-[1.65rem] font-black leading-tight tracking-tight text-neutral-900">
          Ekonomia studia treningowego: <br />
          <span className="text-[#ea580c]">Marże, czas wdrożenia i twarde realia</span>
        </h2>

        {/* Subtitle */}
        <p className="mt-2 text-center text-[0.78rem] min-[390px]:text-[0.84rem] sm:text-[0.88rem] font-normal leading-[1.38] text-neutral-600">
          Zamiast pustych obietnic o &bdquo;milionach w 2 tygodnie&rdquo; – oto jak wygląda realne poukładanie studia treningu personalnego na podstawie 50 placówek.
        </p>

        {/* 3 Real Data Counter Badges */}
        <div className="mt-5 grid w-full grid-cols-3 gap-2">
          <div className="flex flex-col items-center justify-center rounded-xl border border-[#fed7aa] bg-[#fff7ed]/60 py-2.5 px-1 text-center shadow-2xs">
            <span className="text-[1.05rem] sm:text-[1.15rem] font-black text-[#ea580c] tracking-tight">
              50–80%
            </span>
            <span className="mt-0.5 text-[0.62rem] font-semibold text-neutral-600 leading-tight">
              Marża operacyjna
            </span>
          </div>

          <div className="flex flex-col items-center justify-center rounded-xl border border-neutral-200/90 bg-[#fffcf8] py-2.5 px-1 text-center shadow-2xs">
            <span className="text-[1.05rem] sm:text-[1.15rem] font-black text-neutral-900 tracking-tight">
              7 dni–6 msc
            </span>
            <span className="mt-0.5 text-[0.62rem] font-semibold text-neutral-500 leading-tight">
              Pełne wdrożenie
            </span>
          </div>

          <div className="flex flex-col items-center justify-center rounded-xl border border-neutral-200/90 bg-[#fffcf8] py-2.5 px-1 text-center shadow-2xs">
            <span className="text-[1.05rem] sm:text-[1.15rem] font-black text-neutral-900 tracking-tight">
              ~5h / tyg.
            </span>
            <span className="mt-0.5 text-[0.62rem] font-semibold text-neutral-500 leading-tight">
              Praca właściciela
            </span>
          </div>
        </div>

        {/* Outcome Breakdown Cards */}
        <div className="mt-5 flex w-full flex-col gap-3">
          
          {/* Card 1: Standard Success Model */}
          <div className="w-full rounded-[1.25rem] border border-[#fed7aa] bg-[#fffaf5] p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[0.66rem] font-black uppercase tracking-[0.14em] text-[#ea580c]">
                STANDARDOWE WDROŻENIE (WIĘKSZOŚĆ STUDIÓW)
              </span>
              <span className="rounded-md bg-[#ffedd5] px-1.5 py-0.5 text-[0.62rem] font-bold text-[#c2410c]">
                50–80% marży
              </span>
            </div>

            <h3 className="mt-2 text-[0.92rem] font-extrabold text-neutral-900 leading-snug">
              Zejście z sali treningowej i ~5 godzin pracy właścicielskiej
            </h3>

            <p className="mt-1.5 text-[0.77rem] text-neutral-700 leading-[1.42]">
              W ciągu <strong>6–7 miesięcy</strong> systematycznego wdrażania procedur właściciel przestaje prowadzić 30–40 treningów tygodniowo. Treningi przejmuje zatrudniony zespół trenerów, a studio generuje <strong>50–80% czystej marży</strong>. Rola właściciela ogranicza się do ok. 5 godzin tygodniowo na nadzór wskaźników, marketing i zarządzanie.
            </p>
          </div>

          {/* Card 2: Slower Adaptation */}
          <div className="w-full rounded-[1.25rem] border border-amber-200/80 bg-[#fffcf6] p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[0.66rem] font-black uppercase tracking-[0.14em] text-amber-700">
                WOLNIEJSZA ADAPTACJA (10–15%)
              </span>
              <span className="rounded-md bg-amber-100/70 px-1.5 py-0.5 text-[0.62rem] font-bold text-amber-800">
                Wydłużony czas
              </span>
            </div>

            <h3 className="mt-2 text-[0.92rem] font-extrabold text-neutral-900 leading-snug">
              Trudność z delegowaniem i dłuższa rekrutacja trenerów
            </h3>

            <p className="mt-1.5 text-[0.77rem] text-neutral-700 leading-[1.42]">
              Zamiast 6–7 miesięcy proces trwa 8–10 miesięcy. Z czego to wynika? Najczęściej z bariery psychicznej właściciela przed oddaniem swoich wieloletnich podopiecznych nowym trenerom lub z wolniejszego procesu rekrutacji. Studio pozostaje zyskowne, ale zejście z sali zajmuje po prostu więcej czasu.
            </p>
          </div>

          {/* Card 3: When Things Fail / Refunds */}
          <div className="w-full rounded-[1.25rem] border border-red-200/80 bg-[#fffafa] p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[0.66rem] font-black uppercase tracking-[0.14em] text-red-600">
                KIEDY POJAWIAJĄ SIĘ ZWROTY
              </span>
              <span className="rounded-md bg-red-100 px-1.5 py-0.5 text-[0.62rem] font-bold text-red-700">
                Sytuacje losowe
              </span>
            </div>

            <h3 className="mt-2 text-[0.92rem] font-extrabold text-neutral-900 leading-snug">
              Nagłe wypadki losowe lub całkowita rezygnacja ze studia
            </h3>

            <p className="mt-1.5 text-[0.77rem] text-neutral-700 leading-[1.42]">
              Jedyny powód, dla którego ktoś u nas nie osiąga wyników, to <strong>nagłe sytuacje życiowe, przez które właściciel całkowicie rezygnuje z prowadzenia studia</strong> (np. ciężkie problemy zdrowotne, przeprowadzka czy zamknięcie lokalu). Żaden system ani know-how nie zadziała, jeśli fizycznie porzucisz biznes. W takich nagłych przypadkach zachowujemy się w 100% fair i zwracamy środki.
            </p>
          </div>

        </div>

        {/* Closing Truth Callout */}
        <div className="mt-5 flex w-full items-center gap-2.5 rounded-xl border border-neutral-200/90 bg-white p-3 shadow-2xs">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#fed7aa] bg-[#fff7ed] text-[0.7rem] font-black text-[#ea580c]">
            i
          </span>
          <p className="text-[0.74rem] text-neutral-600 leading-tight">
            Jeśli szukasz magicznego przycisku i nie chcesz zatrudniać trenerów – to nie zadziała. Jeśli chcesz poukładać studio z 50–80% marży i pracować 5h w tygodniu jako przedsiębiorca – to jedyna sprawdzona droga.
          </p>
        </div>

      </div>
    </section>
  );
}