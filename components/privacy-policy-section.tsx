import React from "react";

const CONTACT_EMAIL = "bartlomiej.sikorski.96@gmail.com";

const DATA_SCOPE = [
  "imię i nazwisko",
  "adres e-mail",
  "numer telefonu",
  "NIP (w przypadku przedsiębiorców)",
  "adres zamieszkania lub siedziby",
  "dane dotyczące transakcji i płatności",
  "dane przekazane dobrowolnie w formularzach",
  "dane dotyczące korzystania ze strony (adres IP, cookies – jeśli używane)",
];

const PURPOSES = [
  {
    label: "realizacji umowy",
    basis: "art. 6 ust. 1 lit. b RODO",
  },
  {
    label: "obowiązków księgowych",
    basis: "art. 6 ust. 1 lit. c RODO",
  },
  {
    label: "działań marketingowych na podstawie zgody",
    basis: "art. 6 ust. 1 lit. a RODO",
  },
  {
    label: "analitycznych, statystycznych i remarketingowych",
    basis: "art. 6 ust. 1 lit. f RODO",
  },
  {
    label: "ustalenia lub dochodzenia roszczeń",
    basis: "art. 6 ust. 1 lit. f RODO",
  },
];

const RECIPIENTS = [
  "firmom księgowym i IT",
  "dostawcom usług mailingowych i CRM (np. GoHighLevel)",
  "operatorom płatności (np. Stripe, PayNow)",
  "narzędziom marketingowym (Meta/Facebook, Google)",
  "organom publicznym w zakresie wymaganym przez przepisy",
];

const RETENTION = [
  "zgodnie z przepisami podatkowymi i księgowymi (min. 5 lat)",
  "do czasu wycofania zgody",
  "do upływu okresu przedawnienia roszczeń",
];

const RIGHTS = [
  "dostępu do danych",
  "sprostowania",
  "usunięcia",
  "ograniczenia przetwarzania",
  "sprzeciwu",
  "przenoszenia danych",
  "wycofania zgody w dowolnym momencie",
];

export function PrivacyPolicySection() {
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
          Polityka Prywatności
        </h1>

        {/* Date Subtitle */}
        <p className="mt-1.5 text-center text-[0.8rem] sm:text-[0.85rem] font-medium text-[#64748b]">
          Data wejścia w życie: 19 sierpnia 2025 r.
        </p>

        {/* Legal Body */}
        <div className="mt-8 w-full space-y-8 text-[0.82rem] sm:text-[0.875rem] leading-[1.46] text-[#475569]">
          
          {/* 1. Informacje ogólne */}
          <div>
            <h2 className="text-[1.05rem] sm:text-[1.15rem] font-extrabold tracking-tight text-[#0c1e38]">
              1. Informacje ogólne
            </h2>
            <p className="mt-2.5">
              Niniejsza Polityka Prywatności określa zasady przetwarzania i
              ochrony danych osobowych w związku z działalnością gospodarczą
              prowadzoną przez{" "}
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
          </div>

          <div className="h-[1px] w-full bg-[#f1f5f9]" />

          {/* 2. Administrator danych */}
          <div>
            <h2 className="text-[1.05rem] sm:text-[1.15rem] font-extrabold tracking-tight text-[#0c1e38]">
              2. Administrator danych
            </h2>
            <p className="mt-2.5">Administratorem danych osobowych jest:</p>

            {/* Seamless Left-Border Brand Box */}
            <div className="relative mt-3.5 w-full rounded-[1.35rem] border border-[#dce8fd] bg-[#f8fbff] p-4 shadow-xs">
              <div
                className="pointer-events-none absolute -inset-[1px] rounded-[1.35rem] border-[3px] border-[#1665f5]"
                style={{
                  WebkitMaskImage: "linear-gradient(to right, #000 24px, transparent 38px)",
                  maskImage: "linear-gradient(to right, #000 24px, transparent 38px)",
                }}
              />
              <p className="font-bold text-[#0c1e38]">
                SPORTOWE PRZEDMIEŚCIE SP. Z O.O.
              </p>
              <p className="mt-1 text-[0.8rem] sm:text-[0.85rem] text-[#64748b] leading-snug">
                ul. Partyzantów 42B
                <br />
                99-200 Poddębice
              </p>
              <p className="mt-3 text-[0.8rem] sm:text-[0.85rem] text-[#64748b]">
                Kontakt w sprawach związanych z przetwarzaniem danych osobowych:
                <br />
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="font-bold text-[#1665f5] underline-offset-4 hover:underline"
                >
                  {CONTACT_EMAIL}
                </a>
              </p>
            </div>
          </div>

          <div className="h-[1px] w-full bg-[#f1f5f9]" />

          {/* 3. Zakres przetwarzanych danych */}
          <div>
            <h2 className="text-[1.05rem] sm:text-[1.15rem] font-extrabold tracking-tight text-[#0c1e38]">
              3. Zakres przetwarzanych danych
            </h2>
            <p className="mt-2.5">
              Przetwarzane mogą być dane osobowe takie jak:
            </p>
            <ul className="mt-3 divide-y divide-[#f1f5f9]">
              {DATA_SCOPE.map((item) => (
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

          {/* 4. Cele i podstawy prawne przetwarzania */}
          <div>
            <h2 className="text-[1.05rem] sm:text-[1.15rem] font-extrabold tracking-tight text-[#0c1e38]">
              4. Cele i podstawy prawne przetwarzania
            </h2>
            <p className="mt-2.5">Dane osobowe przetwarzane są w celach:</p>
            <ul className="mt-3 divide-y divide-[#f1f5f9]">
              {PURPOSES.map((purpose) => (
                <li key={purpose.label} className="flex items-start gap-2.5 py-2.5">
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
                    <strong className="font-bold text-[#0c1e38]">{purpose.label}</strong> —{" "}
                    <span className="italic">{purpose.basis}</span>
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div className="h-[1px] w-full bg-[#f1f5f9]" />

          {/* 5. Odbiorcy danych */}
          <div>
            <h2 className="text-[1.05rem] sm:text-[1.15rem] font-extrabold tracking-tight text-[#0c1e38]">
              5. Odbiorcy danych
            </h2>
            <p className="mt-2.5">Dane mogą być przekazywane m.in.:</p>
            <ul className="mt-3 divide-y divide-[#f1f5f9]">
              {RECIPIENTS.map((item) => (
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

          {/* 6. Okres przechowywania danych */}
          <div>
            <h2 className="text-[1.05rem] sm:text-[1.15rem] font-extrabold tracking-tight text-[#0c1e38]">
              6. Okres przechowywania danych
            </h2>
            <p className="mt-2.5">Dane są przechowywane:</p>
            <ul className="mt-3 divide-y divide-[#f1f5f9]">
              {RETENTION.map((item) => (
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

          {/* 7. Prawa osób, których dane dotyczą */}
          <div>
            <h2 className="text-[1.05rem] sm:text-[1.15rem] font-extrabold tracking-tight text-[#0c1e38]">
              7. Prawa osób, których dane dotyczą
            </h2>
            <p className="mt-2.5">Osobie przysługuje prawo do:</p>
            <ul className="mt-3 divide-y divide-[#f1f5f9]">
              {RIGHTS.map((item) => (
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
              W celu realizacji praw należy kontaktować się pod adresem:{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="font-bold text-[#1665f5] underline-offset-4 hover:underline"
              >
                {CONTACT_EMAIL}
              </a>
            </p>

            <p className="mt-2.5">
              Osoba ma również prawo złożyć skargę do Prezesa Urzędu Ochrony
              Danych Osobowych (UODO).
            </p>
          </div>

          <div className="h-[1px] w-full bg-[#f1f5f9]" />

          {/* 8. Zmiany Polityki Prywatności */}
          <div>
            <h2 className="text-[1.05rem] sm:text-[1.15rem] font-extrabold tracking-tight text-[#0c1e38]">
              8. Zmiany Polityki Prywatności
            </h2>
            <p className="mt-2.5">
              Administrator zastrzega sobie prawo do wprowadzania zmian w
              niniejszej Polityce Prywatności. Zmiany obowiązują od momentu
              publikacji na stronie.
            </p>
          </div>

          <div className="h-[1px] w-full bg-[#f1f5f9]" />

          {/* 9. Data wejścia w życie */}
          <div>
            <h2 className="text-[1.05rem] sm:text-[1.15rem] font-extrabold tracking-tight text-[#0c1e38]">
              9. Data wejścia w życie
            </h2>
            <p className="mt-2.5 font-bold text-[#0c1e38]">19 sierpnia 2025 r.</p>
          </div>

        </div>

      </div>
    </section>
  );
}