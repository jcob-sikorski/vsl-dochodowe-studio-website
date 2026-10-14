import { MATERIALS_CHECKLIST } from "@/lib/materials";

/**
 * Top of /materialy. Says the rule before anything else: these materials are
 * a condition of the call, and if they show it's not a fit — cancel.
 */
export function MaterialsHeroSection() {
  return (
    <section
      data-track-section="zasady"
      className="relative w-full bg-white px-4 pb-10 pt-3 font-sans selection:bg-orange-200 sm:px-6 lg:pb-14 lg:pt-5"
    >
      <div className="mx-auto flex w-full max-w-[28rem] flex-col items-center sm:max-w-xl md:max-w-3xl lg:max-w-5xl">
        {/* Progress bar — same system as the landing page */}
        <div className="mb-4 w-full md:max-w-2xl">
          <div className="relative h-3.5 w-full overflow-hidden rounded-full border-[1.5px] border-neutral-300 bg-neutral-100 shadow-2xs sm:h-4">
            <div className="h-full bg-[#ea580c]" style={{ width: "86%" }} />
            <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-[0.62rem] font-black leading-none tracking-wider text-white sm:text-[0.68rem]">
              86%
            </span>
          </div>
        </div>

        <div className="inline-flex items-center justify-center rounded-full border-[1.5px] border-[#ea580c] bg-orange-50 px-3 py-1 sm:px-3.5">
          <span className="text-[0.6rem] font-extrabold uppercase tracking-[0.14em] text-[#c2410c] min-[390px]:text-[0.65rem] sm:tracking-[0.16em]">
            Obowiązkowe przed rozmową decyzyjną
          </span>
        </div>

        <h1 className="mt-3 w-full max-w-3xl text-center text-[1.28rem] font-extrabold uppercase leading-[1.2] tracking-tight text-neutral-900 min-[390px]:text-[1.42rem] sm:text-[1.7rem] lg:text-[2.1rem]">
          Materiały przed rozmową:{" "}
          <span className="underline decoration-[#ea580c] decoration-[3px] underline-offset-4">
            model, liczby i opinie właścicieli
          </span>
        </h1>

        <p className="mt-3 w-full max-w-xl text-center text-[0.86rem] leading-[1.5] text-neutral-700 sm:text-[0.95rem] lg:text-[1.02rem]">
          Na rozmowie decyzyjnej nie tłumaczymy podstaw — rozmawiamy o Twoim studiu i Twoich liczbach. Wszystko, co musisz wiedzieć wcześniej, jest na tej stronie.
        </p>

        {/* The rule */}
        <div className="mt-6 w-full rounded-2xl bg-neutral-900 p-5 text-white sm:p-6 lg:mt-8 lg:flex lg:items-center lg:gap-8 lg:px-8">
          <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-[#fb923c] lg:shrink-0">Zasada</p>
          <div>
            <p className="mt-1.5 text-[1.02rem] font-extrabold leading-snug sm:text-[1.12rem] lg:mt-0 lg:text-[1.2rem]">
              Bez zapoznania się z podstawowymi materiałami rozmowa się nie odbędzie.
            </p>
            <p className="mt-2 text-[0.84rem] leading-[1.55] text-neutral-300 lg:mt-1">
              Szanujemy Twój czas i czas naszego eksperta. Dlatego na rozmowę przychodzą tylko osoby, które znają model.
            </p>
          </div>
        </div>

        {/* What to do — total ~45 min */}
        <p className="mt-5 w-full text-center text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-neutral-500 md:text-left">
          3 kroki przed rozmową · razem ok. 45 min
        </p>
        <ol className="mt-2 grid w-full grid-cols-1 gap-2.5 md:grid-cols-3">
          {MATERIALS_CHECKLIST.map((item, i) => (
            <li key={item.id}>
              <a
                href={item.href}
                className="group flex h-full items-start gap-3 rounded-2xl border border-neutral-200 bg-white p-4 transition-colors hover:border-neutral-400 sm:p-5 md:flex-col md:gap-3"
              >
                <span className="flex w-full items-center gap-3 md:justify-between">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#ea580c] text-[0.8rem] font-extrabold text-white">
                    {i + 1}
                  </span>
                  <span className="flex-1 text-[0.98rem] font-extrabold leading-snug text-neutral-900 md:hidden">{item.title}</span>
                  <span className="shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-[0.66rem] font-extrabold uppercase tracking-wider text-neutral-600">
                    {item.time}
                  </span>
                </span>
                <span className="hidden text-[1.02rem] font-extrabold leading-snug text-neutral-900 md:block">{item.title}</span>
                <span className="sr-only md:not-sr-only md:block md:text-[0.86rem] md:leading-[1.5] md:text-neutral-700">{item.body}</span>
                <span className="hidden text-[0.72rem] font-extrabold uppercase tracking-wider text-[#c2410c] md:mt-auto md:inline-flex md:items-center md:gap-1">
                  Przejdź <span aria-hidden="true" className="transition-transform group-hover:translate-y-0.5">↓</span>
                </span>
              </a>
            </li>
          ))}
        </ol>

        {/* Opt-out */}
        <div className="mt-4 w-full rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-50 p-4 sm:p-5 md:flex md:items-center md:gap-6">
          <p className="text-[0.92rem] font-extrabold text-neutral-900 md:shrink-0">To nie dla Ciebie? Zrezygnuj z rozmowy.</p>
          <p className="mt-1 text-[0.86rem] leading-[1.55] text-neutral-700 md:mt-0">
            Jeśli po zapoznaniu się z materiałami uznasz, że ten model Ci nie pasuje — to w porządku. Daj nam znać — odpisz na naszą wiadomość albo powiedz to, gdy zadzwonimy — i odwołaj rozmowę. Oszczędzimy sobie nawzajem czasu.
          </p>
        </div>
      </div>
    </section>
  );
}
