"use client";

import React from "react";

const CALENDAR_LINKS = {
  google: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Warsztat%3A%20Z%C5%82oty%20Model%20Biznesowy%20(Dochodowe%20Studio)&dates=20260917T180000Z/20260917T200000Z&details=Link%20do%20warsztatu%20na%20%C5%BCywo%3A%20sprawd%C5%BA%20skrzynk%C4%99%20e-mail%20oraz%20SMS.%20Przygotuj%20notatnik%20i%20b%C4%85d%C5%BA%205%20minut%20wcze%C5%9Bniej.`,
  apple: `data:text/calendar;charset=utf8,BEGIN%3AVCALENDAR%0AVERSION%3A2.0%0ABEGIN%3AVEEVENT%0ADTSTART%3A20260917T180000Z%0ADTEND%3A20260917T200000Z%0ASUMMARY%3AWarsztat%3A%20Z%C5%82oty%20Model%20Biznesowy%20(Dochodowe%20Studio)%0ADESCRIPTION%3ALink%20do%20warsztatu%20na%20%C5%BCywo%3A%20sprawd%C5%BA%20skrzynk%C4%99%20e-mail%20oraz%20SMS.%20Przygotuj%20notatnik%20i%20b%C4%85d%C5%BA%205%20minut%20wcze%C5%9Bniej.%0AEND%3AVEEVENT%0AEND%3AVCALENDAR`,
  outlook: `https://outlook.office.com/calendar/0/deeplink/compose?subject=Warsztat%3A%20Z%C5%82oty%20Model%20Biznesowy%20(Dochodowe%20Studio)&startdt=2026-09-17T20:00:00%2B02:00&enddt=2026-09-17T22:00:00%2B02:00&body=Link%20do%20warsztatu%20na%20%C5%BCywo%3A%20sprawd%C5%BA%20skrzynk%C4%99%20e-mail%20oraz%20SMS.%20Przygotuj%20notatnik%20i%20b%C4%85d%C5%BA%205%20minut%20wcze%C5%9Bniej.`,
  yahoo: `https://calendar.yahoo.com/?v=60&title=Warsztat%3A%20Z%C5%82oty%20Model%20Biznesowy%20(Dochodowe%20Studio)&st=20260917T180000Z&et=20260917T200000Z&desc=Link%20do%20warsztatu%20na%20%C5%BCywo%3A%20sprawd%C5%BA%20skrzynk%C4%99%20e-mail%20oraz%20SMS.%20Przygotuj%20notatnik%20i%20b%C4%85d%C5%BA%205%20minut%20wcze%C5%9Bniej.`,
};

const CALENDARS = [
  { name: "Google", link: CALENDAR_LINKS.google },
  { name: "Apple", link: CALENDAR_LINKS.apple },
  { name: "Outlook", link: CALENDAR_LINKS.outlook },
  { name: "Yahoo", link: CALENDAR_LINKS.yahoo },
];

export function AddToCalendarSection() {
  return (
    <section className="relative w-full bg-white font-sans selection:bg-orange-200 flex flex-col items-center overflow-x-hidden pt-2 pb-10 px-4 sm:px-6">
      <div className="mx-auto flex w-full max-w-[22rem] sm:max-w-[24.5rem] flex-col items-center">
        
        {/* Step Pill: Amber border & light cream backing */}
        <div className="inline-flex items-center justify-center rounded-full border border-[#fed7aa] bg-[#fff7ed] px-3 py-0.5 shadow-2xs">
          <span className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-[#ea580c]">
            NIE SKOŃCZYŁEŚ!
          </span>
        </div>

        {/* Headline */}
        <h2 className="mt-2.5 text-center text-[1.25rem] min-[390px]:text-[1.38rem] sm:text-[1.55rem] font-black leading-tight tracking-tight text-neutral-900">
          Dodaj To Wydarzenie Do <span className="text-[#ea580c]">Swojego Kalendarza</span>
        </h2>

        {/* Calendar Icon Card: Peach container with high-contrast action orange icon */}
        <div className="mt-4.5 flex h-20 w-20 sm:h-22 sm:w-22 items-center justify-center rounded-[1.35rem] border border-[#fed7aa] bg-[#fff7ed] shadow-xs">
          <svg
            className="h-10 w-10 sm:h-11 sm:w-11 text-[#ea580c]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="4" width="18" height="18" rx="4" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
            <circle cx="8" cy="14" r="1" fill="currentColor" />
            <circle cx="12" cy="14" r="1" fill="currentColor" />
            <circle cx="16" cy="14" r="1" fill="currentColor" />
            <circle cx="8" cy="18" r="1" fill="currentColor" />
            <circle cx="12" cy="18" r="1" fill="currentColor" />
            <circle cx="16" cy="18" r="1" fill="currentColor" />
          </svg>
        </div>

        {/* Slim Button Strip: Warm hover states */}
        <div className="mt-3.5 grid w-full grid-cols-2 min-[390px]:grid-cols-4 gap-1.5">
          {CALENDARS.map((cal) => (
            <a
              key={cal.name}
              href={cal.link}
              target="_blank"
              rel="noreferrer"
              className="group flex h-9 items-center justify-center gap-1.5 rounded-xl border border-neutral-200/90 bg-white px-2 shadow-2xs transition-all hover:border-[#ea580c] hover:bg-[#fff7ed]/80 hover:shadow-xs active:scale-[0.97]"
            >
              <svg
                className="h-3.5 w-3.5 shrink-0 text-neutral-400 transition-colors group-hover:text-[#ea580c]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="4" width="18" height="18" rx="3" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span className="text-[0.75rem] font-bold tracking-tight text-neutral-800 transition-colors group-hover:text-[#ea580c]">
                {cal.name}
              </span>
            </a>
          ))}
        </div>

        <p className="mt-3.5 text-center text-[0.76rem] font-normal leading-[1.38] text-neutral-500">
          Link z dostępem wyślemy na Twój e-mail. Dodaj wydarzenie do kalendarza{" "}
          <span className="font-extrabold text-neutral-900">TERAZ</span>, aby nie przegapić startu transmisji.
        </p>

      </div>
    </section>
  );
}