import React from "react";

interface BonusItem {
  number: string;
  badge?: string;
  title: string;
  description: string[];
  icon: React.ReactNode;
}

const BONUSES: BonusItem[] = [
  {
    number: "Bonus #1",
    badge: "FLAGOWY TRANSFER • BEZ OPŁAT LICENCYJNYCH",
    title: "Kompletne Procedury & Know-How „Sportowe Przedmieście” na Własność",
    description: [
      "Przekazujemy Ci 1:1 wszystkie procedury operacyjne wypracowane i przetestowane w boju w sieci studiów Sportowe Przedmieście (Poddębice, Łódź Julianów, Łęczyca). To gotowy system, który pozwolił zdjąć właściciela z 30–40 godzin stania na sali tygodniowo i wygenerować 50–80% czystej marży.",
      "Otrzymujesz te materiały w 100% na własność – bez kupowania drogiej franczyzy, bez abonamentów i bez oddawania choćby złotówki prowizji od obrotu. Kopiujesz pliki, podmieniasz logo i budujesz w pełni niezależny biznes pod własną marką.",
    ],
    icon: (
      <svg className="h-6 w-6 text-[#ea580c]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
  },
  {
    number: "Bonus #2",
    badge: "WSPARCIE 1:1",
    title: "Aktywny Coaching & Bezpośrednie Prowadzenie Wdrożenia",
    description: [
      "Nie zostajesz sam z plikami na dysku. Dostajesz bezpośrednie wsparcie merytoryczne i analizę Twojej sytuacji biznesowej na bieżąco.",
      "Pracujemy na Twoich realnych liczbach: diagnozujemy wąskie gardła w grafiku, wyliczamy optymalne marże, układamy politykę cenową i prowadzimy Cię krok po kroku przez proces delegowania pierwszych treningów.",
    ],
    icon: (
      <svg className="h-6 w-6 text-[#ea580c]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <polyline points="16 11 18 13 22 9" />
      </svg>
    ),
  },
  {
    number: "Bonus #3",
    badge: "FUNDAMENT",
    title: "Playbook Kompletny Dochodowe Studio 2026 (PDF)",
    description: [
      "18-rozdziałowy podręcznik operacyjny: 5 kompletnych systemów i 21 gotowych narzędzi wyciągniętych prosto z 4 stacjonarnych studiów treningowych.",
      "Zawiera twarde i miękkie standardy „Metodyki Miejsca”, architekturę pakietów transformacyjnych oraz 21 brutalnych prawd biznesu fitness, które chronią Cię przed kosztownymi błędami.",
    ],
    icon: (
      <svg className="h-6 w-6 text-[#ea580c]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
  {
    number: "Bonus #4",
    badge: "WSPARCIE 24/7",
    title: "Prywatny Asystent AI „Wisienka” z Pełną Bazą Procedur",
    description: [
      "Dedykowany model sztucznej inteligencji nakarmiony wszystkimi skryptami, umowami, kalkulatorami i procedurami Dochodowego Studia.",
      "Działa 24/7 w prostym języku polskim. Jeśli o 22:00 masz trudną sytuację z trenerem, klient odwołuje trening lub nie wiesz, jak wycenić pakiet – wpisujesz problem i natychmiast dostajesz gotową instrukcję działania oraz odpowiedni dokument.",
    ],
    icon: (
      <svg className="h-6 w-6 text-[#ea580c]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="10" rx="2" />
        <circle cx="12" cy="5" r="2" />
        <path d="M12 7v4" />
        <line x1="8" y1="16" x2="8" y2="16" />
        <line x1="16" y1="16" x2="16" y2="16" />
      </svg>
    ),
  },
  {
    number: "Bonus #5",
    badge: "AKADEMIA TRENERÓW",
    title: "Biblioteka Wdrożeniowa Trenerów: 48 Szkoleń + 40 Live'ów",
    description: [
      "Przeogromna baza edukacyjna, która eliminuje konieczność osobistego, żmudnego szkolenia personelu od zera przez Ciebie.",
      "Wysyłasz nowemu trenerowi dostęp, a system wdraża go sam w standardy obsługi klienta na sali, komunikację, prowadzenie konsultacji diagnostycznych i budowanie lojalności wobec Twojej marki.",
    ],
    icon: (
      <svg className="h-6 w-6 text-[#ea580c]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 7l-7 5 7 5V7z" />
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
      </svg>
    ),
  },
  {
    number: "Bonus #6",
    badge: "SPRZEDAŻ HIGH-TICKET",
    title: "Skrypty Konsultacji i Oferty 90 Dni (+ Prompt AI)",
    description: [
      "Słowo w słowo rozpisany proces diagnostyczny, dzięki któremu nawet początkujący trener w Twoim studiu bez problemu zamyka pakiety za 5 000 – 12 000 zł.",
      "Zawiera kwestionariusz konsultacyjny, skrypt obrony ceny, instrukcję zbierania zaliczek oraz gotowy prompt AI generujący dedykowany arkusz ofertowy dla Twojej placówki.",
    ],
    icon: (
      <svg className="h-6 w-6 text-[#ea580c]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    number: "Bonus #7",
    badge: "OCHRONA BIZNESU",
    title: "Pakiet Prawny: Regulamin, Umowy & Ochrona Bazy Klientów",
    description: [
      "Prawne zabezpieczenie przed najczęstszą obawą właścicieli: odejściem trenera i próbą podebrania podopiecznych z Twojego studia.",
      "Zawiera żelazny regulamin studia, procedury obrony zasad przy odwoływaniu treningów z dnia na dzień, system 6 leveli trenerskich oraz legalną mechanikę premii frekwencyjnej.",
    ],
    icon: (
      <svg className="h-6 w-6 text-[#ea580c]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    ),
  },
  {
    number: "Bonus #8",
    badge: "MARKETING BEZ AGENCJI",
    title: "Niezależny System Generowania Leadów (Meta Ads + Canva)",
    description: [
      "Praktyczny kurs pozyskiwania klientów z płatnych reklam, dzięki któremu uniezależniasz się od agencji pobierających prowizje i dostarczających zimne, przypadkowe kontakty.",
      "Gotowe szablony voucherów do druku w Canvie, prompt AI do tworzenia rolek na Instagram oraz mechanika wiralowego konkursu „Wygraj transformację”, która przynosi ponad 140 udostępnień w 24 godziny.",
    ],
    icon: (
      <svg className="h-6 w-6 text-[#ea580c]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
  },
  {
    number: "Bonus #9",
    badge: "EVENT LOKALNY",
    title: "Harmonogram & Scenariusz Dnia Otwartego (4 Tygodnie)",
    description: [
      "Rozpisana minuta po minucie sekwencja organizacji wielkiego otwarcia lub dnia otwartego, która buduje ogromny szum i pozycjonuje studio jako lidera w Twoim mieście.",
      "Plan działań marketingowych na 4 tygodnie przed eventem, system rejestracji wejść oraz mechanika sprzedaży pakietów długoterminowych uczestnikom wydarzenia.",
    ],
    icon: (
      <svg className="h-6 w-6 text-[#ea580c]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    number: "Bonus #10",
    badge: "WARTOŚĆ DLA KLIENTÓW",
    title: "Gotowy System Żywieniowy & Kalkulatory BMR dla Podopiecznych",
    description: [
      "Kompletna encyklopedia odżywiania, arkusze kalkulacyjne zapotrzebowania kalorycznego i profesjonalne materiały edukacyjne dla Twoich klientów.",
      "Podnosisz postrzeganą wartość oferty do poziomu absolutnego premium, nie marnując ani minuty na ręczne, żmudne rozpisywanie diet przez Ciebie lub Twoich trenerów.",
    ],
    icon: (
      <svg className="h-6 w-6 text-[#ea580c]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 2v8a3 3 0 0 1-3 3h-2" />
        <path d="M18 22v-9" />
        <path d="M6 2v6a3 3 0 0 0 3 3h1" />
        <path d="M6 22v-11" />
        <path d="M10 2v5" />
      </svg>
    ),
  },
  {
    number: "Bonus #11",
    badge: "BEZPIECZEŃSTWO LOKALU",
    title: "Kalkulatory Wyposażenia & Checklista Negocjacji Umowy Najmu",
    description: [
      "3 gotowe kosztorysy wyposażenia studia (START: 35-45k, PRO: 60-70k, PREMIUM: 80-100k zł) oraz checklista 20 pytań demaskująca ukryte koszty lokalu przed podpisaniem umowy na lata.",
      "Skrypty negocjacyjne z wynajmującym: jak wywalczyć 2–3 miesiące wakacji czynszowych i partycypację właściciela budynku w kosztach remontu (oszczędność od kilkunastu do kilkudziesięciu tysięcy złotych).",
    ],
    icon: (
      <svg className="h-6 w-6 text-[#ea580c]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="2" width="16" height="20" rx="2" />
        <line x1="8" y1="6" x2="16" y2="6" />
        <line x1="8" y1="10" x2="16" y2="10" />
        <line x1="8" y1="14" x2="16" y2="14" />
        <line x1="8" y1="18" x2="16" y2="18" />
      </svg>
    ),
  },
  {
    number: "Bonus #12",
    badge: "SPOŁECZNOŚĆ",
    title: "Dostęp do Zamkniętego Kręgu Właścicieli Studiów Fitness",
    description: [
      "Bezpośredni kontakt z przedsiębiorcami prowadzącymi studia w całej Polsce, którzy wdrożyli te zasady i generują od 20 000 do 70 000 zł zysku miesięcznie.",
      "Bieżąca wymiana stawek, sprawdzonych lokalnie rozwiązań i natychmiastowa pomoc w sytuacjach kryzysowych. Zyskujesz silne środowisko ludzi, którzy myślą jak przedsiębiorcy, a nie tylko jak trenerzy.",
    ],
    icon: (
      <svg className="h-6 w-6 text-[#ea580c]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
];

export function SpecialOfferBonuses() {
  return (
    <section className="relative w-full bg-white py-12 px-4 sm:px-6 selection:bg-orange-200">
      <div className="mx-auto flex w-full max-w-[23rem] sm:max-w-[27rem] flex-col items-center">
        
        {/* Section Pill */}
        <div className="inline-flex items-center justify-center rounded-full border border-[#fed7aa] bg-[#fff7ed] px-3.5 py-0.5 shadow-2xs">
          <span className="text-[0.66rem] font-bold uppercase tracking-[0.16em] text-[#ea580c]">
            KOMPLETNY SKARBIEC MATERIAŁÓW
          </span>
        </div>

        {/* Section Heading */}
        <h2 className="mt-3 text-center text-[1.4rem] min-[390px]:text-[1.6rem] sm:text-[1.85rem] font-black leading-tight tracking-tight text-neutral-900">
          Dodatkowo, otrzymujesz <br />
          <span className="text-[#ea580c]">ten kompletny zestaw</span>
        </h2>

        {/* Subtitle */}
        <p className="mt-2 text-center text-[0.78rem] min-[390px]:text-[0.84rem] sm:text-[0.88rem] text-neutral-600 leading-[1.4]">
          Dostajesz na własność cały sprawdzony system operacyjny i marketingowy — bez kupowania licencji i bez wymyślania koła na nowo.
        </p>

        {/* Bonuses Stack */}
        <div className="mt-6 flex w-full flex-col gap-4">
          {BONUSES.map((bonus) => (
            <div
              key={bonus.number}
              className="w-full rounded-[1.4rem] border border-neutral-200/90 bg-white p-4 sm:p-5 shadow-2xs transition-all hover:border-[#fed7aa] hover:shadow-xs"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#fed7aa] bg-[#fff7ed]">
                    {bonus.icon}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[0.68rem] font-extrabold uppercase tracking-wider text-[#ea580c]">
                      {bonus.number}
                    </span>
                    <h3 className="text-[0.98rem] sm:text-[1.08rem] font-black text-neutral-900 leading-tight">
                      {bonus.title}
                    </h3>
                  </div>
                </div>

                {bonus.badge && (
                  <span className="shrink-0 rounded-md border border-[#fed7aa] bg-[#fff7ed] px-2 py-0.5 text-[0.58rem] font-bold uppercase tracking-wider text-[#c2410c]">
                    {bonus.badge}
                  </span>
                )}
              </div>

              <div className="mt-3.5 space-y-2 border-t border-neutral-100 pt-3 text-[0.79rem] sm:text-[0.84rem] text-neutral-600 leading-[1.44]">
                {bonus.description.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}