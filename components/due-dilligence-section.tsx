"use client";

import React, { useState } from "react";

interface DueDiligenceItem {
  id: string;
  categoryNumber: string;
  title: string;
  subtitle: string;
  badge?: string;
  questions: {
    q: string;
    a: React.ReactNode;
  }[];
}

const DUE_DILIGENCE_DATA: DueDiligenceItem[] = [
  {
    id: "legitimacy",
    categoryNumber: "01",
    title: "Wiarygodność i dane rejestrowe",
    subtitle: "Czy istniejemy naprawdę, jesteśmy zarejestrowani i bierzemy odpowiedzialność?",
    badge: "ZWERYFIKOWANY PODMIOT",
    questions: [
      {
        q: "Czy ci ludzie w ogóle istnieją i czy kogoś oszukali?",
        a: (
          <>
            <p>
              Tak, prowadzimy w pełni zarejestrowaną działalność z zerową liczbą sporów prawnych czy zarzutów o oszustwo. Zachęcamy do sprawdzenia oficjalnych rejestrów, weryfikacji danych i przejrzenia udokumentowanych wyników naszych klientów, zanim wydasz choćby złotówkę.
            </p>
            <p className="mt-1.5 font-medium text-neutral-900">
              NIP: <span className="font-mono">8281424752</span>
            </p>
          </>
        ),
      },
      {
        q: "Czy adres siedziby i dane firmy są prawdziwe?",
        a: (
          <>
            <p>
              Nie ukrywamy się za wirtualnymi biurami czy anonimowymi skrytkami pocztowymi. Nasza firma jest zarejestrowana pod adresem: <strong>ul. Partyzantów 42B, 99-200 Poddębice</strong>. 
            </p>
            <p className="mt-1.5 text-neutral-600">
              Prowadzimy realne, fizyczne studia treningowe, w których codziennie pracujemy z klientami. Poniżej znajdziesz bezpośrednie lokalizacje naszych obiektów w Google Maps.
            </p>
          </>
        ),
      },
    ],
  },
  {
    id: "pricing",
    categoryNumber: "02",
    title: "Dlaczego za darmo i gdzie jest haczyk?",
    subtitle: "Uczciwe wyjaśnienie naszego modelu i dlaczego nie pobieramy opłaty.",
    questions: [
      {
        q: "Dlaczego to szkolenie jest w 100% darmowe? Gdzie jest haczyk?",
        a: (
          <>
            Stawiamy sprawę jasno: <strong>to nasza najlepsza forma marketingu, ponieważ to szkolenie przynosi nam klientów</strong>. Wychodzimy z prostego założenia – najpierw udowadniamy naszą wartość w praktyce, zamiast tylko o niej mówić. Jeśli dostarczymy Ci potężną dawkę wiedzy i konkretny plan, część uczestników będzie chciała wdrożyć to z naszą bezpośrednią pomocą. Jeśli zdecydujesz się zrobić wszystko sam – masz kompletną wiedzę za 0 zł. Obie strony wygrywają.
          </>
        ),
      },
      {
        q: "Czym to się różni od darmowych materiałów na YouTube?",
        a: (
          <>
            Na YouTube znajdziesz masę chaotycznej teorii i ogólnych porad od osób, które często nie prowadzą realnego biznesu. Tutaj nie tracisz tygodni na sklejanie pojedynczych wskazówek – dostajesz gotowy, przetestowany proces krok po kroku, nasze wewnętrzne procedury oraz sprawdzone rozwiązania, które działają w praktyce tu i teraz.
          </>
        ),
      },
    ],
  },
  {
    id: "risk",
    categoryNumber: "03",
    title: "Ryzyko i gwarancja bezpieczeństwa",
    subtitle: "Zasady zwrotów, transparentność i brak ukrytego ryzyka.",
    badge: "< 1% SPORÓW",
    questions: [
      {
        q: "Czy oferujecie realną gwarancję zwrotu pieniędzy, czy to marketingowy chwyt?",
        a: (
          <>
            Oferujemy bezdyskusyjną, pełną gwarancję na min. 20 tys. zł miesięcznie ZYSKU. Mówiąc zupełnie wprost: <strong>jedyne osoby, które u nas proszą o zwrot pieniędzy, to takie, którym po prostu przeszkodziło życie</strong> – nagłe sytuacje losowe, zdrowotne czy rodzinne. Żaden system, strategia ani najlepsze know-how na świecie tego nie zmieni, jeśli nagłe okoliczności całkowicie krzyżują plany. W takich sytuacjach zawsze zachowujemy się w 100% fair i zwracamy środki bez zbędnych pytań.
          </>
        ),
      },
      {
        q: "Co jeśli to nie zadziała lub zostanę z niczym?",
        a: (
          <>
            Nasz wskaźnik sporów i reklamacji wynosi poniżej 0,1%. Prowadzimy fizyczne, stacjonarne studia treningowe i oficjalnie zarejestrowaną spółkę w Polsce – podpisujemy się pod tym własnym nazwiskiem i twarzą. Nie jesteśmy anonimowym kursem z internetu, który znika po kilku tygodniach. Twoje bezpieczeństwo i nasza wieloletnia reputacja są na pierwszym miejscu.
          </>
        ),
      },
    ],
  },
  {
    id: "timeline",
    categoryNumber: "04",
    title: "Harmonogram i efekty",
    subtitle: "Wymagany czas i realne tempo osiągania rezultatów.",
    questions: [
      {
        q: "Ile czasu zajmuje proces i kiedy pojawią się pierwsze rezultaty?",
        a: (
          <>
            To zależy od specyfiki Twojej sytuacji i punktu wyjścia – realny czas wynosi <strong>od 7 dni do 4 miesięcy, w zależności od skali problemu</strong>. Pierwsze widoczne efekty i wdrożenie podstawowych elementów można zauważyć już w ciągu pierwszych 7 dni, natomiast pełne rozwiązanie problemu i zbudowanie stabilnych, długoterminowych rezultatów wymaga zazwyczaj od 2 do 4 miesięcy systematycznego działania.
          </>
        ),
      },
      {
        q: "Czy to będzie kolidować z moim obecnym grafikiem i obowiązkami?",
        a: (
          <>
            Nie. Całość została zaprojektowana tak, aby dopasować się do Twojego codziennego życia, a nie wywracać je do góry nogami. Działamy w oparciu o konkretne, poukładane kroki, które wdrażasz bez konieczności poświęcania dziesiątek godzin tygodniowo.
          </>
        ),
      },
    ],
  },
  {
    id: "success-rate",
    categoryNumber: "05",
    title: "Skuteczność i twarde dane",
    subtitle: "Rzetelne liczby i pełna weryfikowalność naszych wyników.",
    badge: "50/50 PLACÓWEK",
    questions: [
      {
        q: "Czy Wasze case study i liczby są sztucznie wyselekcjonowane?",
        a: (
          <>
            Nie pokazujemy pojedynczych „szczęśliwych trafów” ani sztucznie napompowanych przychodów. Sprawa wygląda tak: <strong>każda z 50 placówek, która wdrożyła nasz model, przebiła poziom 20 000 zł czystego zysku miesięcznie</strong>. To nie jest kwestia przypadku czy szczęścia do lokalizacji – to powtarzalny, precyzyjnie poukładany proces operacyjny i sprzedażowy.
          </>
        ),
      },
      {
        q: "Jak mogę to zweryfikować przed podjęciem decyzji?",
        a: (
          <>
            Wręcz do tego zachęcamy: <strong>wejdź na nasz profil i napisz bezpośrednio na Instagramie do naszych uczestników</strong>. Nie ukrywamy ich tożsamości – oznaczamy ich w postach i relacjach. Odezwij się do nich na priv, zapytaj bez owijania w bawełnę o realia współpracy, czas wdrożenia i ich obecne liczby. Szczera rozmowa z kimś, kto był dokładnie w Twoim miejscu, to najlepsza możliwa weryfikacja.
          </>
        ),
      },
    ],
  },
  {
    id: "social-proof",
    categoryNumber: "06",
    title: "Opinie, social proof i weryfikacja",
    subtitle: "Gdzie sprawdzić realne dowody i opinie o Bartłomieju Sikorskim.",
    questions: [
      {
        q: "Gdzie mogę zobaczyć autentyczne opinie i dowody wyników?",
        a: (
          <>
            Najlepszym miejscem jest Instagram: <strong>prosimy wejść na konto Bartłomieja Sikorskiego i sprawdzić wyróżnione relacje w zakładce „Rezultaty”</strong>. Znajdziesz tam setki bezpośrednich zrzutów ekranu, raportów z systemów, wiadomości od właścicieli studiów oraz oznaczenia profili konkretnych osób, które osiągnęły te wyniki.
          </>
        ),
      },
      {
        q: "Czy te opinie nie są sfałszowane lub kupione?",
        a: (
          <>
            Nie stosujemy anonimowych gwiazdek ani botów z fałszywymi komentarzami. Na profilu Bartłomieja Sikorskiego każde case study to realny człowiek z podanym z imienia i nazwiska kontem na Instagramie. Wejdź na profil Bartłomieja, kliknij w zakładkę z rezultatami i jeśli masz jakiekolwiek wątpliwości – napisz bezpośrednio do którejkolwiek z oznaczonych tam osób.
          </>
        ),
      },
    ],
  },
];

const MAP_LOCATIONS = [
  {
    name: "Siedziba & Studio Poddębice",
    location: "ul. Partyzantów 42B",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Sportowe+Przedmieście+Partyzantów+42B+Poddębice",
  },
  {
    name: "Studio Łódź (Julianów)",
    location: "ul. Gen. Józefa Bema 25A",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Sportowe+Przedmieście+Gen+Józefa+Bema+25A+Łódź",
  },
  {
    name: "Studio dla Kobiet Łęczyca",
    location: "ul. Kaliska 9a",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Sportowe+Przedmieście+Kaliska+9a+Łęczyca",
  },
];

export function DueDiligenceSection() {
  const [openSection, setOpenSection] = useState<string>("legitimacy");

  return (
    <section className="relative w-full bg-white font-sans selection:bg-orange-200 flex flex-col items-center overflow-x-hidden pt-4 pb-16 px-4 sm:px-6">
      <div className="mx-auto flex w-full max-w-[22.5rem] sm:max-w-[25.5rem] flex-col items-center">
        
        {/* Step Badge */}
        <div className="inline-flex items-center justify-center rounded-full border border-[#fed7aa] bg-[#fff7ed] px-3.5 py-0.5 shadow-2xs">
          <span className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-[#ea580c]">
            KROK 4
          </span>
        </div>

        {/* Section Heading */}
        <h2 className="mt-2.5 text-center text-[1.3rem] min-[390px]:text-[1.45rem] sm:text-[1.65rem] font-black leading-tight tracking-tight text-neutral-900">
          Jesteś Sceptyczny? <br />
          <span className="text-[#ea580c]">Oto Fakty Bez Filtra!</span>
        </h2>

        {/* Subheadline */}
        <p className="mt-2 text-center text-[0.78rem] min-[390px]:text-[0.84rem] sm:text-[0.88rem] font-normal leading-[1.4] text-neutral-600">
          Sprawdź Dochodowe Studio w Google, przeszukaj Instagram lub zweryfikuj lokalizacje Sportowe Przedmieście.<br />
          Stawiamy na 100% transparentności, zanim dołączysz do szkolenia.
        </p>

        {/* Streamlined Social Links */}
        <div className="mt-5 grid w-full grid-cols-3 gap-2">
          <a
            href="https://www.youtube.com/@bartlomiej.sikorski"
            target="_blank"
            rel="noreferrer"
            className="group flex h-10 items-center justify-center gap-1.5 rounded-xl border border-neutral-200/90 bg-white px-2 shadow-2xs transition-all hover:border-[#ea580c] hover:bg-[#fff7ed]/80 active:scale-[0.97]"
          >
            <svg className="h-4 w-4 shrink-0 text-[#ff0000]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
            <span className="text-[0.74rem] sm:text-[0.78rem] font-bold tracking-tight text-neutral-800 transition-colors group-hover:text-[#ea580c]">
              YouTube
            </span>
          </a>

          <a
            href="https://www.instagram.com/sikorski.bartlomiej"
            target="_blank"
            rel="noreferrer"
            className="group flex h-10 items-center justify-center gap-1.5 rounded-xl border border-neutral-200/90 bg-white px-2 shadow-2xs transition-all hover:border-[#ea580c] hover:bg-[#fff7ed]/80 active:scale-[0.97]"
          >
            <svg className="h-4 w-4 shrink-0 text-[#e1306c]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
            </svg>
            <span className="text-[0.74rem] sm:text-[0.78rem] font-bold tracking-tight text-neutral-800 transition-colors group-hover:text-[#ea580c]">
              Instagram
            </span>
          </a>

          <a
            href="https://www.facebook.com/sikorskibartlomiej1"
            target="_blank"
            rel="noreferrer"
            className="group flex h-10 items-center justify-center gap-1.5 rounded-xl border border-neutral-200/90 bg-white px-2 shadow-2xs transition-all hover:border-[#ea580c] hover:bg-[#fff7ed]/80 active:scale-[0.97]"
          >
            <svg className="h-4 w-4 shrink-0 text-[#1877f2]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <span className="text-[0.74rem] sm:text-[0.78rem] font-bold tracking-tight text-neutral-800 transition-colors group-hover:text-[#ea580c]">
              Facebook
            </span>
          </a>
        </div>

        {/* Plain Text Accordion List */}
        <div className="mt-6 w-full divide-y divide-neutral-200 border-y border-neutral-200">
          {DUE_DILIGENCE_DATA.map((item) => {
            const isOpen = openSection === item.id;

            return (
              <div key={item.id} className="py-3.5 sm:py-4">
                <button
                  type="button"
                  onClick={() => setOpenSection(isOpen ? "" : item.id)}
                  className="group flex w-full items-center justify-between text-left select-none"
                >
                  <span
                    className={`text-[0.92rem] sm:text-[1rem] font-bold tracking-tight transition-colors ${
                      isOpen ? "text-[#ea580c]" : "text-neutral-900 group-hover:text-[#ea580c]"
                    }`}
                  >
                    {item.title}
                  </span>

                  <span
                    className={`ml-3 shrink-0 text-neutral-400 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-[#ea580c]" : ""
                    }`}
                  >
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </span>
                </button>

                {/* Accordion Content */}
                {isOpen && (
                  <div className="pt-3 pb-1 space-y-3.5 text-[0.8rem] sm:text-[0.85rem] leading-relaxed text-neutral-700">
                    {item.questions.map((faq, idx) => (
                      <div key={idx} className="space-y-1">
                        <p className="font-bold text-neutral-900">{faq.q}</p>
                        {/* Changed from <p>{faq.a}</p> to <div> to avoid invalid nesting */}
                        <div>{faq.a}</div>
                      </div>
                    ))}

                    {/* Google Maps Hub Links */}
                    {item.id === "legitimacy" && (
                      <div className="pt-2">
                        <p className="text-[0.72rem] font-bold uppercase tracking-wider text-neutral-500">
                          Zweryfikowane lokalizacje:
                        </p>
                        <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1.5 text-[0.76rem]">
                          {MAP_LOCATIONS.map((loc) => (
                            <a
                              key={loc.name}
                              href={loc.mapUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="font-medium text-[#ea580c] hover:underline"
                            >
                              {loc.name} ({loc.location}) →
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Downside Acknowledgment Callout */}
        <div className="mt-6 w-full rounded-[1.35rem] border border-[#fed7aa] bg-[#fffaf5] p-4 shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#faea75] text-[0.9rem] font-black text-black">
              ⚖️
            </div>
            <div className="flex flex-col">
              <h4 className="text-[0.84rem] sm:text-[0.88rem] font-black text-neutral-900 leading-tight">
                Zasada pełnej, bezkompromisowej szczerości
              </h4>
              <p className="mt-1 text-[0.74rem] sm:text-[0.78rem] text-neutral-600 leading-[1.38]">
                Jeśli szukasz magicznego przycisku i nie zamierzasz wdrażać procedur, żaden system sam nie zbuduje rentownego studia. <strong>Każda z 50 placówek, która rzetelnie zastosowała ten model, przekroczyła 20 000 zł zysku miesięcznie</strong>. Niepowodzenia zdarzają się wyłącznie wtedy, gdy ktoś całkowicie rezygnuje z działania lub gdy plany krzyżują nagłe sytuacje losowe. Mówimy o tym otwarcie i bez koloryzowania.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}