import React from "react";

const CONTACT_EMAIL = "bartlomiej.sikorski.96@gmail.com";

const DEFINITIONS = [
  {
    label: "Usługodawca",
    description:
      "SPORTOWE PRZEDMIEŚCIE SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ, organizator Programu.",
  },
  {
    label: "Klient / Uczestnik",
    description:
      "osoba fizyczna prowadząca działalność gospodarczą lub zawodową, która zawarła Umowę o udział w Programie.",
  },
  {
    label: "Program",
    description:
      "sześciomiesięczny program mentoringowo-wdrożeniowy „Instalacja Systemu Dochodowe Studio”.",
  },
  {
    label: "Platforma",
    description:
      "platforma szkoleniowa Skool oraz komunikator Telegram wykorzystywane do realizacji Programu.",
  },
  {
    label: "Umowa",
    description:
      "umowa o udział w Programie zawierana na odległość za pośrednictwem Autenti.",
  },
];

const PROGRAM_SCOPE = [
  "dostęp do platformy szkoleniowej Skool i materiałów udostępnionych w Programie",
  "dostęp do mapy biznesu oraz materiałów wdrożeniowych",
  "indywidualny kontakt 1:1 z mentorem za pośrednictwem Telegrama",
  "udział w cotygodniowych grupowych spotkaniach online (środa i czwartek, po 2 godziny)",
  "dostęp do grupy uczestników Programu na Telegramie oraz materiałów dotyczących modelu biznesowego, sprzedaży, marketingu, budowy zespołu i retencji",
];

const RESPONSIBILITIES = [
  "wykonywanie zadań oraz samodzielne wdrażanie rekomendacji otrzymanych w ramach Programu",
  "prawdziwość i kompletność przekazywanych danych",
  "podejmowane decyzje biznesowe i zgodność własnej działalności z prawem",
  "nieudostępnianie danych dostępowych do Platformy osobom trzecim",
  "niezakłócanie pracy społeczności uczestników",
];

const TERMINATION_REASONS = [
  "bezprawne rozpowszechnianie materiałów Programu",
  "udostępnienie konta lub danych dostępowych osobom trzecim",
  "poważne zakłócanie pracy społeczności uczestników",
  "zwłoka w zapłacie mimo wezwania do zapłaty",
];

export function TermsConditionsSection() {
  return (
    <section className="relative w-full bg-white font-sans selection:bg-blue-200 flex flex-col items-center overflow-x-hidden pt-4 pb-20 px-4 sm:px-6">
      <div className="mx-auto flex w-full max-w-[22.5rem] sm:max-w-[28rem] flex-col items-center">
        
        {/* Top Tag Pill */}
        <div className="inline-flex items-center justify-center rounded-full border border-[#dbeafe] bg-[#f0f6fe] px-3.5 py-0.5 shadow-2xs">
          <span className="text-[0.65rem] sm:text-[0.7rem] font-bold uppercase tracking-[0.16em] text-[#1665f5]">
            DOKUMENT PRAWNY
          </span>
        </div>

        {/* Section Heading */}
        <h1 className="mt-3 text-center text-[1.85rem] min-[390px]:text-[2.1rem] sm:text-[2.45rem] font-black leading-tight tracking-tight text-[#0c1e38]">
          Regulamin
        </h1>

        {/* Date Subtitle */}
        <p className="mt-1.5 text-center text-[0.8rem] sm:text-[0.85rem] font-medium text-[#64748b]">
          Data wejścia w życie: 19 sierpnia 2025 r.
        </p>

        {/* Legal Body */}
        <div className="mt-8 w-full space-y-8 text-[0.82rem] sm:text-[0.875rem] leading-[1.46] text-[#475569]">
          
          {/* 1. Postanowienia ogólne */}
          <div>
            <h2 className="text-[1.05rem] sm:text-[1.15rem] font-extrabold tracking-tight text-[#0c1e38]">
              1. Postanowienia ogólne
            </h2>
            <p className="mt-2.5">
              Niniejszy Regulamin określa zasady uczestnictwa w programie
              mentoringowo-wdrożeniowym „Instalacja Systemu Dochodowe Studio”
              oraz zasady korzystania ze strony DochodoweStudio.com,
              prowadzonej przez{" "}
              <strong className="font-bold text-[#0c1e38]">
                SPORTOWE PRZEDMIEŚCIE SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ
              </strong>{" "}
              z siedzibą przy ul. Partyzantów 42B, 99-200 Poddębice, wpisaną do
              Krajowego Rejestru Sądowego pod numerem{" "}
              <strong className="font-bold text-[#0c1e38]">
                KRS: 0001189312
              </strong>
              , <strong className="font-bold text-[#0c1e38]">NIP 8281424752</strong>
              , <strong className="font-bold text-[#0c1e38]">REGON 542481505</strong>
              , kapitał zakładowy{" "}
              <strong className="font-bold text-[#0c1e38]">5 000,00 PLN</strong>.
            </p>
            <p className="mt-2.5">
              Korzystanie ze strony oraz przystąpienie do Programu oznacza
              akceptację postanowień niniejszego Regulaminu.
            </p>
          </div>

          <div className="h-[1px] w-full bg-[#f1f5f9]" />

          {/* 2. Definicje */}
          <div>
            <h2 className="text-[1.05rem] sm:text-[1.15rem] font-extrabold tracking-tight text-[#0c1e38]">
              2. Definicje
            </h2>
            <ul className="mt-3 divide-y divide-[#f1f5f9]">
              {DEFINITIONS.map((item) => (
                <li key={item.label} className="flex items-start gap-2.5 py-2.5">
                  <svg
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#1665f5]"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="2.5 8.5 6 12 13.5 4" />
                  </svg>
                  <p className="text-[0.8rem] sm:text-[0.85rem] leading-snug text-[#475569]">
                    <strong className="font-bold text-[#0c1e38]">{item.label}</strong> —{" "}
                    {item.description}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div className="h-[1px] w-full bg-[#f1f5f9]" />

          {/* 3. Charakter i cel Programu */}
          <div>
            <h2 className="text-[1.05rem] sm:text-[1.15rem] font-extrabold tracking-tight text-[#0c1e38]">
              3. Charakter i cel Programu
            </h2>
            <p className="mt-2.5">
              Program ma charakter edukacyjny i doradczy. Usługodawca nie
              przejmuje zarządzania przedsiębiorstwem Klienta, nie wykonuje za
              niego wdrożeń i nie świadczy usług prawnych, podatkowych ani
              inwestycyjnych.
            </p>
            <p className="mt-2.5">
              Celem Programu jest wsparcie Klienta w uporządkowaniu modelu
              biznesowego studia, sprzedaży i marketingu lokalnego, budowie
              zespołu, delegowaniu, retencji oraz społeczności. Usługodawca nie
              gwarantuje osiągnięcia konkretnych wyników finansowych — wyniki
              uczestników są zróżnicowane i zależą od ich zaangażowania,
              doświadczenia oraz sytuacji rynkowej.
            </p>
          </div>

          <div className="h-[1px] w-full bg-[#f1f5f9]" />

          {/* 4. Warunki uczestnictwa */}
          <div>
            <h2 className="text-[1.05rem] sm:text-[1.15rem] font-extrabold tracking-tight text-[#0c1e38]">
              4. Warunki uczestnictwa
            </h2>
            <p className="mt-2.5">
              Uczestnikiem Programu może zostać osoba fizyczna prowadząca
              działalność gospodarczą lub zawodową, zawierająca Umowę w
              bezpośrednim związku z tą działalnością. Umowa zawierana jest na
              odległość za pośrednictwem platformy Autenti i zostaje zawarta po
              złożeniu podpisów elektronicznych przez Klienta oraz osobę
              uprawnioną do reprezentowania Usługodawcy.
            </p>
            <p className="mt-2.5">
              Korzystanie z Programu wymaga dostępu do internetu oraz
              aktywnego konta na platformie Skool i komunikatorze Telegram.
            </p>
          </div>

          <div className="h-[1px] w-full bg-[#f1f5f9]" />

          {/* 5. Zakres Programu */}
          <div>
            <h2 className="text-[1.05rem] sm:text-[1.15rem] font-extrabold tracking-tight text-[#0c1e38]">
              5. Zakres Programu
            </h2>
            <p className="mt-2.5">W ramach ceny Klient otrzymuje:</p>
            <ul className="mt-3 divide-y divide-[#f1f5f9]">
              {PROGRAM_SCOPE.map((item) => (
                <li key={item} className="flex items-start gap-2.5 py-2.5">
                  <svg
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#1665f5]"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="2.5 8.5 6 12 13.5 4" />
                  </svg>
                  <p className="text-[0.8rem] sm:text-[0.85rem] leading-snug text-[#475569]">{item}</p>
                </li>
              ))}
            </ul>
            <p className="mt-3.5">
              Szczegółowa kolejność wdrożeń zależy od sytuacji Klienta i może
              zostać dostosowana w toku Programu bez zmniejszenia uzgodnionego
              zakresu świadczenia. Kanał indywidualny na Telegramie jest
              obsługiwany co do zasady od poniedziałku do czwartku w godzinach
              7:00–18:00, bez gwarancji odpowiedzi natychmiastowej ani stałej
              dostępności mentora.
            </p>
          </div>

          <div className="h-[1px] w-full bg-[#f1f5f9]" />

          {/* 6. Czas trwania i rozpoczęcie */}
          <div>
            <h2 className="text-[1.05rem] sm:text-[1.15rem] font-extrabold tracking-tight text-[#0c1e38]">
              6. Czas trwania i rozpoczęcie
            </h2>
            <p className="mt-2.5">
              Program trwa 6 miesięcy. Dostęp do platformy zostanie przyznany
              po zaksięgowaniu pełnej ceny albo spełnieniu warunków
              finansowania, niezwłocznie, nie później niż w terminie 7 dni,
              chyba że Strony wskażą późniejszą datę startu.
            </p>
            <p className="mt-2.5">
              Niewykorzystywanie Programu przez Klienta, nieobecność na
              spotkaniach, brak korzystania z kanałów komunikacji lub
              niewykonywanie zadań nie przedłuża okresu obowiązywania Umowy i
              nie wstrzymuje płatności. Przerwa lub wydłużenie Programu wymaga
              udokumentowanego uzgodnienia Stron na trwałym nośniku.
            </p>
          </div>

          <div className="h-[1px] w-full bg-[#f1f5f9]" />

          {/* 7. Cena i płatność */}
          <div>
            <h2 className="text-[1.05rem] sm:text-[1.15rem] font-extrabold tracking-tight text-[#0c1e38]">
              7. Cena i płatność
            </h2>
            <p className="mt-2.5">
              Cena Programu wynosi 21 000,00 zł netto, powiększona o VAT według
              stawki obowiązującej w dniu wystawienia faktury; przy stawce 23%
              cena brutto wynosi 25 830,00 zł. Sposób zapłaty — jednorazowy,
              ratalny lub finansowany przez podmiot trzeci — jest każdorazowo
              określany w warunkach przekazanych Klientowi przed zawarciem
              Umowy.
            </p>
            <p className="mt-2.5">
              Odmowa udzielenia finansowania przez podmiot trzeci nie oznacza
              zawarcia Umowy na raty z Usługodawcą. Opóźnienie w płatności
              uprawnia Usługodawcę, po wezwaniu Klienta i wyznaczeniu
              odpowiedniego dodatkowego terminu, do czasowego wstrzymania
              świadczeń oraz dochodzenia odsetek ustawowych za opóźnienie, bez
              naruszenia praw Klienta wynikających z bezwzględnie
              obowiązujących przepisów.
            </p>
          </div>

          <div className="h-[1px] w-full bg-[#f1f5f9]" />

          {/* 8. Prawa autorskie i licencja */}
          <div>
            <h2 className="text-[1.05rem] sm:text-[1.15rem] font-extrabold tracking-tight text-[#0c1e38]">
              8. Prawa autorskie i licencja
            </h2>
            <p className="mt-2.5">
              Materiały udostępniane w ramach Programu są chronione prawem
              autorskim. Klient otrzymuje niewyłączną, nieprzenoszalną
              licencję na korzystanie z nich wyłącznie na potrzeby własnej
              działalności, przez okres udostępnienia określony w Umowie lub
              na platformie.
            </p>
            <p className="mt-2.5">
              Bez uprzedniej zgody Usługodawcy Klient nie może kopiować,
              sprzedawać, publicznie udostępniać, przekazywać osobom trzecim
              ani wykorzystywać materiałów do prowadzenia konkurencyjnych
              szkoleń lub mentoringu. Klient może wdrażać poznane metody we
              własnym przedsiębiorstwie i udostępniać zespołowi wyłącznie te
              narzędzia, które zostały wyraźnie oznaczone jako przeznaczone do
              wdrożenia zespołowego.
            </p>
          </div>

          <div className="h-[1px] w-full bg-[#f1f5f9]" />

          {/* 9. Odpowiedzialność Uczestnika */}
          <div>
            <h2 className="text-[1.05rem] sm:text-[1.15rem] font-extrabold tracking-tight text-[#0c1e38]">
              9. Odpowiedzialność Uczestnika
            </h2>
            <p className="mt-2.5">Klient odpowiada w szczególności za:</p>
            <ul className="mt-3 divide-y divide-[#f1f5f9]">
              {RESPONSIBILITIES.map((item) => (
                <li key={item} className="flex items-start gap-2.5 py-2.5">
                  <svg
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#1665f5]"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="2.5 8.5 6 12 13.5 4" />
                  </svg>
                  <p className="text-[0.8rem] sm:text-[0.85rem] leading-snug text-[#475569]">{item}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="h-[1px] w-full bg-[#f1f5f9]" />

          {/* 10. Poufność i dane osobowe */}
          <div>
            <h2 className="text-[1.05rem] sm:text-[1.15rem] font-extrabold tracking-tight text-[#0c1e38]">
              10. Poufność i dane osobowe
            </h2>
            <p className="mt-2.5">
              Strony zachowują w poufności informacje biznesowe oznaczone jako
              poufne lub takie, których poufny charakter wynika z okoliczności.
              Regulamin nie udziela Usługodawcy zgody na publikację wizerunku,
              nazwy firmy, wypowiedzi, wyników ani case study Klienta — taka
              publikacja wymaga odrębnej zgody.
            </p>
            <p className="mt-2.5">
              Zasady przetwarzania danych osobowych określa{" "}
              <a
                href="/privacy-policy"
                className="font-bold text-[#1665f5] underline-offset-4 hover:underline"
              >
                Polityka Prywatności
              </a>
              .
            </p>
          </div>

          <div className="h-[1px] w-full bg-[#f1f5f9]" />

          {/* 11. Rozwiązanie Umowy */}
          <div>
            <h2 className="text-[1.05rem] sm:text-[1.15rem] font-extrabold tracking-tight text-[#0c1e38]">
              11. Rozwiązanie Umowy
            </h2>
            <p className="mt-2.5">
              Każda Strona może rozwiązać Umowę ze skutkiem natychmiastowym w
              razie istotnego naruszenia Umowy przez drugą Stronę, po
              uprzednim wezwaniu do usunięcia naruszenia i bezskutecznym
              upływie odpowiedniego terminu, chyba że charakter naruszenia
              uzasadnia natychmiastowe zakończenie współpracy. Za istotne
              naruszenie przez Klienta uważa się w szczególności:
            </p>
            <ul className="mt-3 divide-y divide-[#f1f5f9]">
              {TERMINATION_REASONS.map((item) => (
                <li key={item} className="flex items-start gap-2.5 py-2.5">
                  <svg
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#ef4444]"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="12" y1="4" x2="4" y2="12" />
                    <line x1="4" y1="4" x2="12" y2="12" />
                  </svg>
                  <p className="text-[0.8rem] sm:text-[0.85rem] leading-snug text-[#475569]">{item}</p>
                </li>
              ))}
            </ul>
            <p className="mt-3.5">
              Rozliczenie po rozwiązaniu Umowy następuje z uwzględnieniem
              świadczeń prawidłowo spełnionych do dnia rozwiązania oraz
              bezwzględnie obowiązujących przepisów. Postanowienie nie
              ogranicza ustawowego prawa odstąpienia, jeżeli Klientowi ono
              przysługuje.
            </p>
          </div>

          <div className="h-[1px] w-full bg-[#f1f5f9]" />

          {/* 12. Postanowienia końcowe */}
          <div>
            <h2 className="text-[1.05rem] sm:text-[1.15rem] font-extrabold tracking-tight text-[#0c1e38]">
              12. Postanowienia końcowe
            </h2>
            <p className="mt-2.5">
              Zmiana Umowy lub Regulaminu wymaga utrwalenia na trwałym nośniku
              i akceptacji obu Stron, chyba że Regulamin wyraźnie przewiduje
              dopuszczalną zmianę organizacyjną, która nie zmniejsza
              świadczenia. W sprawach nieuregulowanych stosuje się prawo
              polskie, w szczególności Kodeks cywilny oraz — gdy ma
              zastosowanie — ustawę o prawach konsumenta.
            </p>
            <p className="mt-2.5">
              Spory będą rozpoznawane przez sąd właściwy według przepisów
              powszechnie obowiązujących. Wobec Klienta niebędącego
              konsumentem Strony mogą uzgodnić właściwość sądu dla siedziby
              Usługodawcy.
            </p>
            <p className="mt-2.5">
              Pytania dotyczące Regulaminu można kierować na adres:{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="font-bold text-[#1665f5] underline-offset-4 hover:underline"
              >
                {CONTACT_EMAIL}
              </a>
            </p>
          </div>

          <div className="h-[1px] w-full bg-[#f1f5f9]" />

          {/* 13. Data wejścia w życie */}
          <div>
            <h2 className="text-[1.05rem] sm:text-[1.15rem] font-extrabold tracking-tight text-[#0c1e38]">
              13. Data wejścia w życie
            </h2>
            <p className="mt-2.5 font-bold text-[#0c1e38]">19 sierpnia 2025 r.</p>
          </div>

        </div>

      </div>
    </section>
  );
}