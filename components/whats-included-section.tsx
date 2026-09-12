import React from "react";

interface PlaybookBonus {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const PLAYBOOK_PILLARS: PlaybookBonus[] = [
  {
    title: "Jak zbudować ofertę, która sprzedaje",
    description:
      "Program 90 Dni, konsultacja i sposób sprzedaży bez licytowania się ceną za trening.",
    icon: (
      <svg
        className="h-5 w-5 text-[#ea580c]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="4" width="18" height="17" rx="3" />
        <path d="M8 2v4M16 2v4M3 9h18" />
        <path d="m9 14 2 2 4-4" />
      </svg>
    ),
  },

  {
    title: "Jak zatrzymać klienta na lata",
    description:
      "Model semi-personal 2–4 osoby i ścieżka od pierwszych 90 dni do długoterminowej współpracy.",
    icon: (
      <svg
        className="h-5 w-5 text-[#ea580c]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <polyline points="16 11 18 13 22 9" />
      </svg>
    ),
  },

  {
    title: "Jak zbudować zespół i odzyskać czas",
    description:
      "Wdrożenie pierwszego trenera, przekazywanie klientów i standard, który pozwala oddawać pracę bez utraty jakości.",
    icon: (
      <svg
        className="h-5 w-5 text-[#ea580c]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
];

export function WhatsIncludedSection() {
  return (
    <section className="w-full bg-white pt-2 pb-8 px-4 sm:px-6">
      <div className="mx-auto flex w-full max-w-[22.5rem] sm:max-w-[25.5rem] flex-col items-center">
        
        {/* Main Playbook Card */}
        <div className="relative w-full rounded-[1.45rem] border border-[#fed7aa] bg-white p-4 sm:p-5 shadow-xs">
          
          {/* Subtle Accent Edge */}
          <div
            className="pointer-events-none absolute -inset-[1px] rounded-[1.45rem] border-[3px] border-[#ea580c]"
            style={{
              WebkitMaskImage: "linear-gradient(to right, #000 24px, transparent 40px)",
              maskImage: "linear-gradient(to right, #000 24px, transparent 40px)",
            }}
          />

          {/* Header */}
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#fed7aa] bg-[#fff7ed]">
              <svg
                className="h-5 w-5 text-[#ea580c]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="4" />
                <polyline points="8.5 12 11 14.5 15.5 9.5" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-[0.66rem] font-bold uppercase tracking-[0.14em] text-[#ea580c]">
                Bonus dla uczestników na żywo
              </span>
              <h3 className="text-[1.02rem] min-[390px]:text-[1.08rem] font-extrabold text-neutral-900 leading-tight tracking-tight">
                Playbook Dochodowego Studia
              </h3>
            </div>
          </div>

          <p className="mt-2.5 text-[0.8rem] sm:text-[0.84rem] text-neutral-600 leading-[1.4]">
            Kompletne narzędzia operacyjne ze stacjonarnych placówek, gotowe do natychmiastowego wdrożenia w Twoim lokalu:
          </p>

          {/* 3 Core Pillars */}
          <div className="mt-4 space-y-3">
            {PLAYBOOK_PILLARS.map((pillar) => (
              <div
                key={pillar.title}
                className="flex items-start gap-3 rounded-xl border border-[#fed7aa]/70 bg-[#fffaf5] p-3"
              >
                <div className="mt-0.5 shrink-0">{pillar.icon}</div>
                <div className="flex flex-col">
                  <h4 className="text-[0.86rem] min-[390px]:text-[0.9rem] font-bold text-neutral-900 leading-snug">
                    {pillar.title}
                  </h4>
                  <p className="mt-1 text-[0.76rem] min-[390px]:text-[0.79rem] text-neutral-600 leading-[1.38]">
                    {pillar.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Footer note inside card */}
          <p className="mt-3.5 text-center text-[0.72rem] font-medium text-neutral-500">
            Dostępny do pobrania bez opłat wyłącznie dla obecnych na transmisji 17 września.
          </p>
        </div>

      </div>
    </section>
  );
}