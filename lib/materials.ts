/* -------------------------------------------------------------------------- *
 * lib/materials.ts
 *
 * Content of /materialy — the MANDATORY pre-call page the setter sends before
 * every decision call. It replaces the pre-consultation email sequence: what
 * the emails used to explain (who we are, the model and why it looks like
 * this, who we worked with) now lives here, in one place.
 *
 * Source of truth: the setter's education script. Keep the numbers here in
 * sync with that script — the page and the setter must say the same thing.
 * -------------------------------------------------------------------------- */

/** Public proof the prospect can check on their own. */
// TODO: podmień na bezpośredni link do kanału, gdy będzie pod ręką.
export const YOUTUBE_CHANNEL_URL = "https://www.youtube.com/results?search_query=Dochodowe+Studio";

/* ---------------- Zasady strony ------------------------------------------- */

export const MATERIALS_CHECKLIST: { id: string; title: string; body: string; time: string; href: string }[] = [
  {
    id: "model",
    title: "Przeczytaj model i liczby",
    body: "Kim jesteśmy, dla kogo to jest, ile zarabia właściciel i jak działa ścieżka klienta w studiu.",
    time: "ok. 10 min",
    href: "#model",
  },
  {
    id: "playbook",
    title: "Przekartkuj Playbook (PDF)",
    body: "Cały model od podszewki i dlaczego wygląda właśnie tak. Obowiązkowy.",
    time: "ok. 20 min",
    href: "#playbook",
  },
  {
    id: "polecajki",
    title: "Obejrzyj min. 2 polecajki",
    body: "Wywiady z właścicielami studiów, którzy już wdrożyli ten model.",
    time: "ok. 15 min",
    href: "#polecajki",
  },
];

/* ---------------- Kim jesteśmy -------------------------------------------- */

export const ABOUT_STATS: { value: string; label: string }[] = [
  { value: "4", label: "własne studia Bartka (Sportowe Przedmieście)" },
  { value: "~50", label: "studiów, z którymi już pracowaliśmy" },
  { value: "60+", label: "właścicieli obecnie w programie" },
  { value: "~3 lata", label: "drogi prób i błędów, którą pomijasz" },
];

/**
 * Bartek's 4 studios, linked to their Google Maps listings. Photos are the
 * listings' main photos, saved to /public/studios (Google photo URLs expire).
 * Ratings/review counts are a snapshot from 14.10.2026 — refresh now and then.
 */
export const BARTEK_STUDIOS: {
  id: string;
  name: string;
  city: string;
  address: string;
  photo: string;
  rating: string;
  reviews: number;
  mapsUrl: string;
}[] = [
  {
    id: "poddebice",
    name: "Sportowe Przedmieście",
    city: "Poddębice",
    address: "Partyzantów 42B, 99-200 Poddębice",
    photo: "/studios/studio-poddebice.jpg",
    rating: "5,0",
    reviews: 177,
    mapsUrl:
      "https://www.google.com/maps/place/Sportowe+Przedmie%C5%9Bcie+Studio+Treningu+Personalnego+Podd%C4%99bice/@51.892702,18.9705149,17z/data=!4m15!1m8!3m7!1s0x471bab7e594f3cef:0x3a93847f35ebc902!2sSportowe+Przedmie%C5%9Bcie+Studio+Treningu+Personalnego+Podd%C4%99bice!8m2!3d51.892702!4d18.9705149!10e5!16s%2Fg%2F11mfsrzzr4!3m5!1s0x471bab7e594f3cef:0x3a93847f35ebc902!8m2!3d51.892702!4d18.9705149!16s%2Fg%2F11mfsrzzr4?entry=ttu",
  },
  {
    id: "julianow",
    name: "Sportowe Przedmieście",
    city: "Łódź — Julianów",
    address: "Gen. Józefa Bema 25A, 91-492 Łódź",
    photo: "/studios/studio-julianow.jpg",
    rating: "5,0",
    reviews: 21,
    mapsUrl:
      "https://www.google.com/maps/place/Sportowe+Przedmie%C5%9Bcie+Studio+Treningu+Personalnego+Julian%C3%B3w/@51.8142182,19.4396614,17z/data=!3m1!4b1!4m6!3m5!1s0x471bcb685612e4dd:0x3f8fa117f7a7773b!8m2!3d51.8142182!4d19.4422363!16s%2Fg%2F11m776vl48?entry=ttu",
  },
  {
    id: "leczyca",
    name: "Sportowe Przedmieście dla Kobiet",
    city: "Łęczyca",
    address: "Kaliska 9a, 99-100 Łęczyca",
    photo: "/studios/studio-leczyca.jpg",
    rating: "5,0",
    reviews: 33,
    mapsUrl:
      "https://www.google.com/maps/place/Sportowe+Przedmie%C5%9Bcie+Studio+Treningu+Personalnego+dla+Kobiet+%C5%81%C4%99czyca/@52.059355,19.1967356,17z/data=!3m1!4b1!4m6!3m5!1s0x471ba5cfc686ea47:0x9702cb93592eb7ed!8m2!3d52.059355!4d19.1993105!16s%2Fg%2F11sk4rp2jq?entry=ttu",
  },
  {
    id: "mikolow",
    name: "PG Power Studio",
    city: "Mikołów",
    address: "Jana Koja 3, 43-190 Mikołów",
    photo: "/studios/studio-mikolow.jpg",
    rating: "5,0",
    reviews: 43,
    mapsUrl:
      "https://www.google.com/maps/place/PG+Power+Studio+Miko%C5%82%C3%B3w+-+Studio+Treningu+Personalnego/@50.1770082,18.8994821,17z/data=!3m1!4b1!4m6!3m5!1s0x4716cb59d37a5881:0xdd0cf618191f4b56!8m2!3d50.1770082!4d18.902057!16s%2Fg%2F11wwjf27qy?entry=ttu",
  },
];

/* ---------------- Dla kogo ------------------------------------------------ */

export const FIT_SPEC: { label: string; value: string }[] = [
  { label: "Typ studia", value: "Trening personalny, pilates, EMS, boks / klub walki, physio" },
  { label: "Metraż", value: "40–150 m² (czasem do 200 m²)" },
  { label: "Lokalizacja", value: "Zwykle przedmieścia — niższe koszty" },
  { label: "Etap", value: "Nowe studia oraz istniejące, które chcą się naprawić — wdrażamy im wszystkie systemy" },
];

export const END_CLIENT: string[] = [
  "Klient premium, zwykle po 35. roku życia",
  "Ma konkretny ból: problem zdrowotny albo sylwetka",
  "Ma pieniądze i dojedzie do 20 minut samochodem",
  "Dlatego studio powinno mieć parking",
];

/* ---------------- Liczby dla właściciela ---------------------------------- */

export const OWNER_KPIS: { label: string; value: string; note: string; accent?: boolean }[] = [
  {
    label: "Zysk właściciela",
    value: "20–50 tys. zł / mies.",
    note: "Rekordzistka: 54 tys. zł miesięcznie.",
    accent: true,
  },
  {
    label: "Gwarancja w umowie",
    value: "20 tys. zł / mies.",
    note: "Zysku miesięcznie — zapisane w umowie.",
    accent: true,
  },
  {
    label: "Marża",
    value: "50–80%",
    note: "Czysty zysk właściciela ÷ przychód. Ok. 50% tam, gdzie część marży zabiera manager.",
  },
  {
    label: "Czas pracy właściciela",
    value: "5–10 h / tydz.",
    note: "Zespół wie, co robi. Ty wypełniasz raporty i sprawdzasz wskaźniki.",
  },
  {
    label: "Koszt otwarcia studia",
    value: "37–100 tys. zł",
    note: "Bartek otworzył za tę kwotę studio w Łodzi.",
  },
  {
    label: "Start operacji",
    value: "< 10 klientów",
    note: "Tylu potrzeba, żeby studio ruszyło.",
  },
];

export const OWNER_OPERATIONS: { label: string; value: string }[] = [
  { label: "Reklama — zapełnienie studia", value: "ok. 3 000 zł" },
  { label: "Reklama — utrzymanie zapełnienia przez cały rok (w tym luki po odchodzących klientach)", value: "ok. 7 000 zł" },
  { label: "Pojemność jednego trenera", value: "15 klientów" },
  { label: "Stawka trenera", value: "60–100 zł / h" },
];

/* ---------------- Ścieżka klienta w studiu -------------------------------- */

export const CLIENT_JOURNEY: { step: string; title: string; metric: string; body: string; why: string }[] = [
  {
    step: "1",
    title: "Reklama na bólu klienta",
    metric: "100–200 zł za klienta, który KUPI pakiet",
    body: "Uczymy robić reklamy, które mówią o konkretnym problemie: ból pleców, nadwaga, sylwetka.",
    why: "Przyciąga osoby z realnym problemem i budżetem, a nie łowców najtańszego karnetu.",
  },
  {
    step: "2",
    title: "Trening diagnostyczny",
    metric: "45 min · płatny · ok. 80% sprzedaży",
    body: "Płatna konsultacja w studiu, na której trener diagnozuje problem klienta.",
    why: "Płatność odsiewa przypadkowe osoby, a diagnoza pokazuje wartość, zanim padnie oferta.",
  },
  {
    step: "3",
    title: "Pakiet 90‑dniowej transformacji",
    metric: "5–12 tys. zł · trening 1:1",
    body: "Zgodnie z arkuszem ofertowym: 24–36 treningów 1:1 z trenerem + dodatki (np. kontakt z trenerem na WhatsAppie, spotkanie na żywo poza studiem, bonusy podnoszące wartość). Często z gwarancją wyniku.",
    why: "Klient nie kupuje treningów, tylko rozwiązanie swojego bólu — dlatego płaci za wynik, a nie za godzinę.",
  },
  {
    step: "4",
    title: "Kontynuacja: trening semi-personalny",
    metric: "grupy 2–4 os. · 300–580 zł za slot (1 h)",
    body: "Proponowany po zakończeniu transformacji. Ćwiczą w małej grupie z jednym trenerem.",
    why: "Zachowuje personalizację i kameralność — klient nadal czuje się zaopiekowany, a godzina trenera (60–100 zł) generuje kilkukrotnie wyższy przychód.",
  },
  {
    step: "5",
    title: "Retencja",
    metric: "średnio 2 lata · LTV 20–40 tys. zł",
    body: "Semi-personal utrzymuje klienta w studiu średnio przez 2 lata.",
    why: "Zysk robi się na długim kliencie, a nie na ciągłym szukaniu nowych.",
  },
];

/* ---------------- Co dostajesz -------------------------------------------- */

export const PROGRAM_AZ: string[] = [
  "Dobór sprzętu",
  "Zatrudnianie trenerów",
  "Ścieżki kariery dla trenerów",
  "Szkolenia dla trenerów",
  "Umowy i regulaminy",
  "Skrypty sprzedaży",
  "Negocjacja czynszu lokalu",
  "Budowanie społeczności klientów",
  "Procedury na wyjazdy z klientami",
];

export const PROGRAM_PILLARS: { title: string; body: string; points?: string[] }[] = [
  {
    title: "Know-how Bartka",
    body: "Cały system z 4 studiów treningu personalnego Sportowe Przedmieście, które łącznie generują 50–80 tys. zł zysku miesięcznie.",
  },
  {
    title: "Pozyskiwanie klientów premium 35+",
    body: "Zobacz, ile jest w Polsce BMW i Mercedesów — tych ludzi jest mnóstwo i są gotowi zapłacić za takie pakiety. Uczymy Cię ich pozyskiwać.",
    points: [
      "Sam konfigurujesz kampanie i nagrywasz rolki w ok. 20 minut",
      "Przez kolejne 10–30 lat nie potrzebujesz agencji marketingowej za 30–40 tys. zł rocznie",
    ],
  },
  {
    title: "Trenerzy, którzy zostają",
    body: "Nie szukamy freelancerów-indywidualistów. Uczymy szukać trenerów, którzy chcą bezpieczeństwa i stabilności i są bardzo empatyczni.",
    points: [
      "Proces: reklama → formularz → szkolenie → 6 tygodni stopniowego wdrożenia i przekazywania odpowiedzialności",
      "Ścieżki awansu, żeby trener widział perspektywę i został na dłużej",
    ],
  },
];

export const SUPPORT_RHYTHM: { when: string; what: string; detail: string }[] = [
  { when: "Wtorek", what: "Mentoring biznesowy z Bartkiem", detail: "Co tydzień. Zadajesz tyle pytań, ile chcesz." },
  { when: "Czwartek", what: "Optymalizacja kampanii Meta Ads", detail: "Co tydzień, z innymi właścicielami — zwykle 15–20 osób." },
  { when: "Telegram", what: "Kontakt 1:1 z Bartkiem + grupa właścicieli", detail: "Bartek odpowiada zwykle w ciągu kilku godzin. W grupie 61 aktywnych właścicieli studiów." },
  { when: "Wyjazdy", what: "Spotkania na żywo z właścicielami", detail: "Raz lub kilka razy w roku: hotel 5*, spa, góry, rower." },
];
