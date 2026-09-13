import React from "react";

const PLAYBOOK_URL = "https://dochodowestudio.pl/playbook.pdf"; // TODO: podmień na docelowy link do PDF

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

export function PlaybookSection() {
  return (
    <section className="relative w-full bg-white font-sans selection:bg-orange-200 flex flex-col items-center overflow-x-hidden pt-4 pb-16 px-4 sm:px-6">
      <div className="mx-auto flex w-full max-w-[26rem] sm:max-w-xl flex-col items-center border-t border-neutral-200 pt-10">

        {/* Eyebrow Pill */}
        <div className="inline-flex items-center justify-center rounded-full border-[1.5px] border-neutral-300 bg-neutral-50 px-3.5 py-1 shadow-2xs">
          <span className="text-[0.65rem] font-extrabold uppercase tracking-[0.16em] text-neutral-900">
            Materiały dodatkowe
          </span>
        </div>

        {/* Headline */}
        <h3 className="mx-auto mt-3 max-w-[24ch] text-center text-[1.25rem] sm:text-[1.45rem] font-extrabold leading-tight tracking-tight text-neutral-900">
          <span className="underline decoration-neutral-900 decoration-2 underline-offset-2">
            Playbook Dochodowe Studio
          </span>
        </h3>
    
        {/* Stat Row */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[0.72rem] sm:text-[0.78rem] font-bold uppercase tracking-widest text-neutral-500">
          <span>Cały Model od Podszewki</span>
        </div>

        <p className="mx-auto mt-5 max-w-md text-center text-[0.82rem] sm:text-[0.88rem] font-light leading-[1.5] text-neutral-600">
          Przekartkuj go przed rozmową:
        </p>

        {/* Highlights List */}
        <div className="mx-auto mt-5 w-full max-w-md text-left">
          <ul className="space-y-3.5">
            {PLAYBOOK_HIGHLIGHTS.map((highlight, idx) => (
              <li
                key={idx}
                className="flex items-start gap-3 text-[0.83rem] sm:text-[0.88rem] leading-[1.5] text-neutral-700"
              >
                <CheckIcon />
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Download CTA */}
        <div className="mt-8 flex w-full flex-col items-center">
          <a
            href={PLAYBOOK_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-full max-w-md items-center justify-center gap-2 rounded-xl bg-neutral-900 px-8 py-4 text-center text-[0.95rem] sm:text-[1.05rem] font-bold uppercase tracking-wide text-white shadow-md transition-all duration-200 hover:bg-neutral-800 active:scale-[0.99]"
          >
            <FileIcon />
            Pobierz Playbook (PDF)
          </a>
        </div>

      </div>
    </section>
  );
}
