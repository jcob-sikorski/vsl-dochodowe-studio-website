const PILLARS = [
  {
    number: "01",
    pillarLabel: "FILAR 1: WIĘCEJ PIENIĘDZY Z JEDNEGO KLIENTA",
    title: "Przestań sprzedawać pojedyncze treningi",

    description:
      "Zamiast sprzedawać pojedynczą godzinę, zbuduj Program 90 Dni, w którym klient kupuje konkretną zmianę. Dzięki temu możesz podnieść wartość współpracy bez dokładania sobie kolejnych godzin na sali.",

    stats: [
      { value: "3 120–3 600 zł", label: "wartość programu 90 dni" },
      { value: "24–36", label: "treningów w programie" },
      { value: "130–150 zł", label: "za trening" },
    ],

    bullets: [
      "Jak zbudować Program 90 Dni, żeby klient kupował rozwiązanie swojego problemu, a nie kolejny pakiet wejść.",
      "Jak zwiększyć wartość jednej współpracy bez zwiększania liczby godzin pracy.",
    ],
  },

  {
    number: "02",
    pillarLabel: "FILAR 2: PIENIĄDZE, KTÓRE ZOSTAJĄ NA DŁUŻEJ",
    title: "Nie zaczynaj każdego miesiąca od zera",

    description:
      "Największa różnica w biznesie pojawia się wtedy, gdy klient nie kończy współpracy po 90 dniach. Pokażemy Ci, jak przeprowadzić go do semi-personal i budować przychód, który zostaje z Tobą przez kolejne miesiące i lata.",

    stats: [
      { value: "800 zł/mies.", label: "przykładowy semi-personal" },
      { value: "16 800 zł", label: "wartość 21 mies. od klienta" },
      { value: "2–4 osoby", label: "w semi-personal" },
    ],

    bullets: [
      "Jak wykorzystać semi-personal jako naturalny kolejny etap po Programie 90 Dni — bez zamieniania studia w zwykłą grupówkę.",
      "Jak zaprojektować doświadczenie klienta tak, żeby chciał zostać na lata, a nie odejść po pierwszych 3 miesiącach.",
    ],
  },

  {
    number: "03",
    pillarLabel: "FILAR 3: CZAS I ZESPÓŁ",
    title: "Przestań być najlepszym trenerem własnego biznesu",

    description:
      "Jeżeli każdy klient musi trenować z Tobą, masz pracę, a nie skalowalny biznes. Pokażemy Ci, jak wdrożyć pierwszego trenera, przekazać mu klientów i odzyskać czas bez obniżania standardu.",

    stats: [
      { value: "4–6 tyg.", label: "wdrożenie pierwszego trenera" },
      { value: "8 h/mies.", label: "przykład czasu właściciela" },
      { value: "20–50 tys.", label: "docelowy zysk miesięczny" },
    ],

    bullets: [
      "Jak wdrożyć pierwszego trenera krok po kroku: obserwacja → fragmenty treningu → nadzór → klienci testowi → pierwsi płacący podopieczni.",
      "Jak stworzyć twardą i miękką metodykę, żeby klient dostawał ten sam standard niezależnie od trenera.",
    ],
  },
];

export function PillarsSection() {
  return (
    <section className="w-full bg-white px-4 py-10 sm:px-6">
      <div
        className="
          mx-auto flex w-full max-w-[22.5rem]
          flex-col items-center
          sm:max-w-[25.5rem]
        "
      >
        <h2
          className="
            mt-3.5 text-center
            text-[1.42rem] font-bold leading-tight tracking-tight
            text-neutral-900
            min-[390px]:text-[1.6rem]
            sm:text-[2rem]
          "
        >
          Tematy,{" "}
          <span className="text-[#ea580c]">
            jakie poruszymy
          </span>
        </h2>

        <p
          className="
            mt-2 text-center
            text-[0.84rem] font-normal leading-[1.38]
            text-neutral-600
            min-[390px]:text-[0.9rem]
            sm:text-[0.98rem]
          "
        >
          Pokażę Ci, jak zejść z sali, ogarnąć zespół trenerów
          i zacząć wyciągać ze studia 20–50 tys. zysku miesięcznie,
          zamiast dalej pracować od rana do wieczora.
        </p>

        <div className="mt-7 mb-4 flex w-full items-center gap-3" />

        <div className="flex w-full flex-col gap-4">
          {PILLARS.map((pillar) => (
            <div
              key={pillar.number}
              className="
                relative overflow-hidden
                rounded-[1.75rem]
                border border-orange-950/30
                bg-[#0c0a09]
                bg-[radial-gradient(
                  ellipse_at_top_left,
                  #29180c_0%,
                  #140e0a_40%,
                  #0c0a09_100%
                )]
                p-5 shadow-xl
                sm:p-6
              "
            >
              {/* Header */}
              <div className="flex items-center gap-3.5">
                <div
                  className="
                    flex h-[3rem] w-[3rem] shrink-0
                    items-center justify-center
                    rounded-[14px]
                    bg-[#ea580c]
                    text-[1.25rem] font-bold
                    text-white shadow-sm
                  "
                >
                  {pillar.number}
                </div>

                <div className="flex flex-col justify-center">
                  <span
                    className="
                      text-[0.66rem] font-bold uppercase
                      tracking-[0.18em] text-[#fb923c]
                    "
                  >
                    {pillar.pillarLabel}
                  </span>

                  <h3
                    className="
                      text-[1.28rem] font-bold leading-tight
                      tracking-tight text-white
                      sm:text-[1.4rem]
                    "
                  >
                    {pillar.title}
                  </h3>
                </div>
              </div>

              {/* Description */}
              <p
                className="
                  mt-4 text-[0.84rem] font-normal
                  leading-[1.46] text-stone-300
                  sm:text-[0.88rem]
                "
              >
                {pillar.description}
              </p>

              {/* Stats */}
              <div className="mt-5 grid grid-cols-3 gap-2">
                {pillar.stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="
                      rounded-xl border border-white/10
                      bg-white/[0.04] px-2 py-3
                      text-center
                    "
                  >
                    <div
                      className="
                        text-[0.92rem] font-bold
                        leading-tight text-white
                      "
                    >
                      {stat.value}
                    </div>

                    <div
                      className="
                        mt-1 text-[0.58rem]
                        leading-tight text-stone-400
                      "
                    >
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Bullet points */}
              <ul className="mt-5 space-y-2.5">
                {pillar.bullets.map((bullet, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5"
                  >
                    <svg
                      className="
                        mt-0.5 h-[1.05rem] w-[1.05rem]
                        shrink-0 text-emerald-400
                      "
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="2.5 8.5 6 12 13.5 4" />
                    </svg>

                    <span
                      className="
                        text-[0.84rem] font-normal
                        leading-[1.38] text-stone-100
                        sm:text-[0.88rem]
                      "
                    >
                      {bullet}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}