"use client";

import React from "react";
import { track } from "@/lib/track";

const PLAYBOOK_URL = "https://drive.google.com/file/d/1HfpuFoPEpsr2ijQ5ZVWE297gUL7SBnoD/view?usp=sharing"; // TODO: podmień na docelowy link do PDF

const PLAYBOOK_HIGHLIGHTS: string[] = [
  "Ile realnie kosztują złe decyzje, zanim podpiszesz umowę najmu",
  "Osobny język komunikacji do kobiet 35+ i mężczyzn 40+",
  "Program 90 dni zamiast pakietu treningów",
  "Jak dobra retencja daje +168–264 tys. zł na 10 klientach",
  "20 pytań przed podpisaniem umowy najmu i trzy poziomy inwestycji w sprzęt (START / PRO / PREMIUM)",
  "Struktura konsultacji, która sprzedaje czyli rozmowa, trening pokazowy i domknięcie krok po kroku",
  "Proces wdrożenia pierwszego trenera w 4–6 tygodni",
  "21 prawd o prowadzeniu studia i gotowy plan działania na 90 dni do otwarcia",
];

function CheckIcon() {
  return (
    <svg
      className="mt-0.5 h-5 w-5 shrink-0 text-neutral-900"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 12.5l2.5 2.5 4.5-5" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg
      className="h-5 w-5 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
    </svg>
  );
}

interface PlaybookSectionProps {
  eyebrow?: string;
  intro?: string;
  /** Shows the "obowiązkowe" badge and reading time (used on /przygotowanie). */
  required?: boolean;
  /** `split`: on desktop, pitch + download on the left, contents on the right. */
  layout?: "stack" | "split";
}

const DEFAULT_INTRO =
  "Na rozmowę przychodzą osoby przygotowane. Zapoznaj się z playbookiem, zanim zadzwoni nasz ekspert, a od razu zajmiemy się Twoimi liczbami zamiast podstaw:";

export function PlaybookSection({
  eyebrow = "Materiały dodatkowe",
  intro = DEFAULT_INTRO,
  required = false,
  layout = "stack",
}: PlaybookSectionProps = {}) {
  const split = layout === "split";

  return (
    <section
      id="playbook"
      data-track-section="playbook"
      className={`relative flex w-full scroll-mt-14 flex-col items-center overflow-x-hidden bg-white px-4 pb-16 pt-4 font-sans selection:bg-orange-200 sm:px-6 ${split ? "lg:pb-20" : ""}`}
    >
      <div
        className={`mx-auto flex w-full max-w-[26rem] flex-col items-center border-t border-neutral-200 pt-10 sm:max-w-xl ${
          split ? "md:max-w-3xl lg:grid lg:max-w-5xl lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-x-14 lg:pt-16" : ""
        }`}
      >
        {/* Pitch */}
        <div className={`flex w-full flex-col items-center ${split ? "lg:col-start-1 lg:row-start-1 lg:items-start lg:self-end" : ""}`}>
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center justify-center rounded-full border-[1.5px] border-neutral-300 bg-neutral-50 px-3.5 py-1 shadow-2xs">
            <span className="text-[0.65rem] font-extrabold uppercase tracking-[0.16em] text-neutral-900">
              {eyebrow}
            </span>
          </div>

          {/* Headline */}
          <h3 className={`mx-auto mt-3 max-w-[24ch] text-center text-[1.25rem] font-extrabold leading-tight tracking-tight text-neutral-900 sm:text-[1.45rem] ${split ? "lg:mx-0 lg:text-left lg:text-[1.8rem]" : ""}`}>
            <span className="underline decoration-neutral-900 decoration-2 underline-offset-2">
              Playbook Dochodowe Studio
            </span>
          </h3>

          {/* Stat Row */}
          <div className={`mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[0.72rem] font-bold uppercase tracking-widest text-neutral-500 sm:text-[0.78rem] ${split ? "lg:justify-start" : ""}`}>
            <span>Cały Model od Podszewki</span>
            {required && <span className="text-[#c2410c]">Obowiązkowe · ok. 20 min</span>}
          </div>

          <p className={`mx-auto mt-5 max-w-md text-center text-[0.82rem] font-light leading-[1.5] text-neutral-600 sm:text-[0.88rem] ${split ? "lg:mx-0 lg:text-left lg:text-[0.98rem] lg:font-normal" : ""}`}>
            {intro}
          </p>
        </div>

        {/* Highlights List */}
        <div
          className={`mx-auto mt-5 w-full max-w-md text-left ${
            split ? "lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mt-0 lg:max-w-none lg:rounded-2xl lg:border lg:border-neutral-200 lg:bg-neutral-50 lg:p-7" : ""
          }`}
        >
          <ul className="space-y-3.5">
            {PLAYBOOK_HIGHLIGHTS.map((highlight, idx) => (
              <li
                key={idx}
                className="flex items-start gap-3 text-[0.83rem] leading-[1.5] text-neutral-700 sm:text-[0.88rem]"
              >
                <CheckIcon />
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Download CTA */}
        <div className={`mt-8 flex w-full flex-col items-center ${split ? "lg:col-start-1 lg:row-start-2 lg:mt-7 lg:items-start lg:self-start" : ""}`}>
          <a
            href={PLAYBOOK_URL}
            onClick={() => track("playbook_download")}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-full max-w-md items-center justify-center gap-2 rounded-xl bg-neutral-900 px-8 py-4 text-center text-[0.95rem] font-bold uppercase tracking-wide text-white shadow-md transition-all duration-200 hover:bg-neutral-800 active:scale-[0.99] sm:text-[1.05rem]"
          >
            <FileIcon />
            Pobierz Playbook (PDF)
          </a>
        </div>
      </div>
    </section>
  );
}
