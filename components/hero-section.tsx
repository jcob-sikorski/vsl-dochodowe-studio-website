"use client";

import Image from "next/image";
import { CountdownTimer } from "@/components/countdown-timer";
import { RegisterForm } from "@/components/register-form";

const WORKSHOP_START = "2026-09-17T20:00:00+02:00";

export function HeroSection() {
  return (
    <section className="relative w-full overflow-x-hidden bg-white font-sans selection:bg-orange-200">
      <div className="mx-auto w-full max-w-[25rem] px-3 pt-1 pb-4 min-[390px]:pt-1.5 min-[390px]:pb-5 sm:max-w-[34rem] sm:px-3.5 sm:pt-2 sm:pb-6 lg:max-w-6xl lg:px-8 lg:py-10">
        <div className="flex flex-col items-center lg:grid lg:grid-cols-12 lg:items-start lg:gap-10">
          
          {/* LEWA KOLUMNA */}
          <div className="flex w-full flex-col items-center text-center lg:col-span-7 lg:items-start lg:text-left">
            
            {/* Top Badge */}
            <div className="flex w-full max-w-[21.5rem] flex-col items-center justify-center rounded-xl border-[1.5px] border-[#ea580c] bg-[#fff7ed] py-0.5 px-2.5 text-center shadow-xs sm:rounded-2xl sm:py-1 sm:px-3 sm:max-w-[23.5rem] lg:mx-0">
              <div className="flex items-center gap-1.5 text-[0.72rem] font-extrabold tracking-tight text-[#7c2d12] min-[390px]:text-[0.78rem] sm:gap-2 sm:text-[0.85rem]">
                <span className="relative flex h-2 w-2 shrink-0 items-center justify-center sm:h-2.5 sm:w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#f87171] opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#ef4444]" />
                </span>
                SZKOLENIE NA ŻYWO: CZWARTEK, 17 WRZ
              </div>
              <div className="text-[0.67rem] font-bold leading-tight text-[#ea580c] min-[390px]:text-[0.72rem] sm:text-[0.78rem]">
                Dla Właścicieli Studiów PT, Butikowych Siłowni i Boxów
              </div>
            </div>

            {/* Logo */}
            <div className="my-0">
              <Image
                src="https://assets.cdn.filesafe.space/XC630scPx5PEZe31LmuL/media/09cd3493-7d85-4c2a-8855-e34c95663611.png"
                alt="Logo"
                width={440}
                height={110}
                className="block h-[72px] w-auto object-contain sm:h-[88px] lg:h-24"
                priority
              />
            </div>

            {/* Main Headline */}
            <h1 className="mt-0 w-full text-[1.28rem] font-extrabold leading-[1.2] tracking-tight text-black min-[390px]:text-[1.42rem] sm:text-[1.85rem] sm:leading-[1.18] lg:text-[2.25rem]">
              <span className="block text-neutral-900">
                Otworzyłeś studio, żeby mieć wolność,{" "}
                <span className="text-[#ea580c]">a stworzyłeś sobie najdroższy etat?</span>
              </span>
            </h1>

            {/* Subheadline */}
            <p className="mt-1.5 w-full text-[0.82rem] font-light leading-[1.32] tracking-normal text-neutral-800 min-[390px]:mt-2 min-[390px]:text-[0.9rem] sm:mt-2.5 sm:text-[1.05rem]">
              Szkolenie o tym jak przebudować model studio treningu personalnego{" "}
              <span className="font-bold text-black">na 20–50 tys. zł zysku / mies. bez stania na sali</span>
            </p>

          </div>

          {/* PRAWA KOLUMNA */}
          <div id="zapis" className="mt-2.5 flex w-full scroll-mt-4 flex-col items-center min-[390px]:mt-3 sm:mt-4 lg:col-span-5 lg:mt-0">
            <RegisterForm className="shadow-2xl" />
            
            {/* Countdown */}
            <div className="mt-3 flex w-full flex-col items-center min-[390px]:mt-3.5">
              <h2 className="mb-1 text-center text-[0.74rem] font-black uppercase tracking-[0.04em] text-[#ea580c] min-[390px]:text-[0.8rem] sm:text-[0.88rem]">
                SZKOLENIE STARTUJE ZA
              </h2>
              <div className="w-full max-w-[21.5rem] sm:max-w-[23.5rem]">
                <CountdownTimer target={WORKSHOP_START} />
              </div>
            </div>
            
          </div>

        </div>
      </div>
    </section>
  );
}