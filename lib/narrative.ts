/* -------------------------------------------------------------------------- *
 * lib/narrative.ts
 *
 * The funnel's sales narrative in one place, so the landing page, the
 * confirmation page and (later) ads and emails say the same thing.
 *
 * Three movements, in this order:
 *   1. OKNO        — the market window: more boutique studios every month,
 *                    still none in most towns. First in wins the location,
 *                    the trust and the cheap ads.
 *   2. ROZWIDLENIE — the personal fork: decide today, or spend the next
 *                    5 years in the same chaos, reinventing the wheel.
 *   3. SELEKCJA    — the program is applied to, not bought. Not everyone
 *                    gets in.
 *
 * Guard rail: urgency here is REAL urgency only (cost of delay, market
 * window, a real qualification call). No fake countdowns or "last spots".
 * If there ever is a real cap or cohort date, add it to PROGRAM_FACTS and
 * render it — never invent one.
 * -------------------------------------------------------------------------- */

export const CTA_LABEL = "APLIKUJ DO PROGRAMU";
export const CTA_MICROCOPY =
  "Rozmowa kwalifikacyjna przez Google Meet. Nie przyjmujemy każdego.";

/** Target monthly profit the cost-of-waiting math is based on (PLN). */
export const TARGET_MONTHLY_PROFIT = 20_000;

/* ---------------- 1. OKNO ------------------------------------------------- */

export const WINDOW_POINTS: { title: string; body: string }[] = [
  {
    title: "Klienci już szukają takiego miejsca",
    body: "Ludzie po 35. i 40. roku życia nie chcą chodzić do sieciówek. Wstydzą się, gubią albo po prostu nie czują się tam dobrze. Szukają małego studia, gdzie ktoś zna ich z imienia i prowadzi za rękę.",
  },
  {
    title: "Takich studiów jest coraz więcej, ale wciąż za mało",
    body: "Kameralne studia w modelu premium dopiero wchodzą do Polski. W większości miast i gmin nie ma jeszcze ani jednego. Karolina zrobiła to w 7-tysięcznym Suszcu.",
  },
  {
    title: "Kto jest pierwszy, ten bierze najwięcej",
    body: "Najlepszy lokal z parkingiem, zaufanie okolicy i najtańszą reklamę. Lead za 100–200 zł jest możliwy dziś, bo prawie nikt w Twojej okolicy nie reklamuje się w ten sposób.",
  },
];

export const WINDOW_TIMELINE: { when: string; what: string; accent?: boolean }[] = [
  { when: "Dziś", what: "Jesteś pierwszy w okolicy. Wybierasz lokal, klienci nie mają alternatywy.", accent: true },
  { when: "Za 2–3 lata", what: "Obok Ciebie otwiera się drugie i trzecie studio. Reklama drożeje." },
  { when: "Za 5 lat", what: "Model jest standardem. Nie wchodzisz na pusty rynek, tylko do walki." },
];

/* ---------------- 2. ROZWIDLENIE ------------------------------------------ */

export const FORK_WAIT: string[] = [
  "Ten sam grafik od rana do wieczora",
  "Strach przed każdym odwołanym treningiem",
  "Urlop, na którym nic nie zarabiasz",
  "Wymyślanie koła na nowo: test za testem, błąd za błędem",
  "W Twojej okolicy otwierają się studia, które zrobiły to przed Tobą",
];

export const FORK_DECIDE: string[] = [
  "Za 4–6 miesięcy studio, które działa bez Ciebie",
  "20–50 tys. zł zysku miesięcznie przy marży 50–80%",
  "Zespół trenerów i ok. 5 godzin Twojej pracy w tygodniu",
  "Gotowy system z ok. 50 działających studiów zamiast zgadywania",
  "Jesteś pierwszy w swojej okolicy",
];

/* ---------------- Wszystkie powody ---------------------------------------- */

export const REASON_GROUPS: { title: string; reasons: string[] }[] = [
  {
    title: "Pieniądze",
    reasons: [
      "20–50 tys. zł zysku miesięcznie przy marży 50–80%",
      "Do 40 tys. zł zysku wystarczy 45–50 aktywnych klientów, nie 150",
      "Klient za 100–200 zł z reklamy, który zostawia 20–40 tys. zł przez 2 lata",
      "Godzina sali w mikrogrupie: 300–580 zł przychodu przy koszcie trenera 60–100 zł",
    ],
  },
  {
    title: "Czas i wolność",
    reasons: [
      "Cel: ok. 5 godzin pracy w biznesie tygodniowo",
      "Urlop, na którym studio dalej zarabia",
      "Koniec sprzedawania własnych godzin: pełny grafik 1:1 to sufit, nie sukces",
      "Zespół, który trzyma standard bez Ciebie: rekrutacja, 4–6 tygodni wdrożenia, 6 leveli awansu",
    ],
  },
  {
    title: "Mniejsze ryzyko",
    reasons: [
      "Gotowy system z ok. 50 studiów zamiast wymyślania koła na nowo",
      "Robienie tego samemu to 116–211 tys. zł kosztów i 1–3 lata błędów",
      "20 pytań przed podpisaniem umowy najmu: unikasz najdroższego błędu",
      "Otwarcie za 37–100 tys. zł w lokalu 40–150 m², czynsz poniżej 20% przychodu",
    ],
  },
  {
    title: "Twoje studio, Twoja marka",
    reasons: [
      "„Franczyza bez franczyzy”: zero opłat licencyjnych i procentu od obrotu",
      "Klient widzi w Tobie eksperta, a nie tani karnet",
      "Aktywo, które można powielić: drugie i trzecie studio",
      "Grono właścicieli, którzy już to zrobili: live'y, Telegram, Mastermind",
    ],
  },
];

/* ---------------- 3. SELEKCJA --------------------------------------------- */

export const FOR_WHO: string[] = [
  "Masz studio albo realny plan i kapitał na otwarcie",
  "Chcesz zejść z sali i zbudować zespół, a nie trenować więcej",
  "Jesteś gotowy zainwestować w swój biznes",
  "Wdrażasz od pierwszego tygodnia",
];

export const NOT_FOR_WHO: string[] = [
  "Szukasz kolejnego kursu do obejrzenia",
  "Chcesz konkurować ceną z sieciówką",
  "Nie jesteś gotowy inwestować w swój biznes",
  "Nie jesteś teraz życiowo gotowy na prowadzenie firmy",
];

export const QUALIFICATION_STEPS: { title: string; body: string }[] = [
  { title: "Zgłoszenie", body: "Wypełniasz krótki formularz. Zajmuje to ok. 10 sekund." },
  { title: "Telefon od zespołu", body: "Oddzwaniamy i umawiamy termin rozmowy." },
  { title: "Rozmowa kwalifikacyjna", body: "Na Google Meet sprawdzamy Twoje liczby i to, czy jesteśmy w stanie dowieźć Ci wynik." },
  { title: "Decyzja obu stron", body: "Jeśli to Twój moment, startujesz. Jeśli nie, usłyszysz to od nas wprost." },
];

/* ---------------- Strona po zgłoszeniu ------------------------------------ */

export const CALL_PREP_NUMBERS: string[] = [
  "Obecny miesięczny przychód studia",
  "Liczba stałych klientów",
  "Średnia cena za trening",
];

export const CALL_CHECKS: string[] = [
  "Czy masz studio albo realny plan i kapitał na otwarcie",
  "Czy chcesz zejść z sali i budować zespół",
  "Czy jesteś gotowy wdrażać od pierwszego tygodnia",
];

export const TEXT_FAQ: { q: string; a: string }[] = [
  {
    q: "Czy każdy zostaje przyjęty?",
    a: "Nie. Skoro bierzemy odpowiedzialność za Twój wynik, przyjmujemy tylko osoby, którym jesteśmy w stanie go dowieźć. Jeśli na rozmowie uznamy, że to nie jest Twój moment, usłyszysz to od nas uczciwie.",
  },
  {
    q: "A jeśli poczekam pół roku?",
    a: "Możesz. Tylko że przez te 6 miesięcy Twoja okolica nie będzie czekać. Każde studio, które otworzy się przed Tobą, zabiera klientów, najlepszy lokal i tanią reklamę. A przy celu 20 tys. zł zysku miesięcznie pół roku to 120 tys. zł potencjału.",
  },
  {
    q: "Czym to się różni od kursu?",
    a: "Kurs się ogląda. Do programu się aplikuje i go wdraża: dostajesz skrypty, arkusze, wsparcie przez 6 miesięcy i ludzi, którzy już to zrobili. Dlatego zaczynamy od rozmowy kwalifikacyjnej, a nie od przycisku „kup”.",
  },
];
