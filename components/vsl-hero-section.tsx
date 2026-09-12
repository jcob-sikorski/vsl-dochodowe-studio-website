"use client";

import Image from "next/image";
import { CountdownTimer } from "@/components/countdown-timer";
import { RegisterForm } from "@/components/register-form";

const WORKSHOP_START = "2026-09-17T20:00:00+02:00";
const MUX_PLAYER_SRC =
  "https://player.mux.com/t6BcSjNXtsAFs01M01w9ls7kia2WZNxf4A7TZrip5RPvs";

function StepBar({ step, title }: { step: number; title: string }) {
  return (
    <div
      className="
        flex w-full items-center justify-center gap-2.5
        rounded-full border-[1.5px] border-[#ea580c] bg-[#fff7ed]
        px-3.5 py-1.5
        sm:gap-3 sm:px-4 sm:py-2
      "
    >
      <div
        className="
          flex h-5 w-5 shrink-0 items-center justify-center
          rounded-full bg-[#ea580c] text-[0.68rem] font-extrabold
          text-white
          sm:h-[1.35rem] sm:w-[1.35rem] sm:text-[0.72rem]
        "
      >
        {step}
      </div>
      <span
        className="
          text-[0.78rem] font-extrabold leading-tight tracking-tight
          text-[#7c2d12]
          sm:text-[0.86rem]
        "
      >
        {title}
      </span>
    </div>
  );
}

export function VslHeroSection() {
  return (
    <section className="relative w-full overflow-x-hidden bg-white font-sans selection:bg-orange-200">

      {/* TOP BAR — ICP callout, full-bleed */}
      <div className="w-full border-b border-orange-900/10 bg-[#fff7ed]">
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center justify-center gap-0.5 px-3 py-2 text-center min-[390px]:py-2.5 sm:py-3">
          <div className="text-[0.67rem] font-bold leading-tight text-[#ea580c] min-[390px]:text-[0.72rem] sm:text-[0.78rem]">
            Właścicielu Studio Treningu Personalnego, Trenerze
          </div>
        </div>
      </div>

      {/* Removed pt-* classes here to eliminate space ABOVE the logo */}
      <div className="mx-auto w-full max-w-[25rem] px-3 pb-5 min-[390px]:pb-6 sm:max-w-[34rem] sm:px-3.5 sm:pb-8 lg:max-w-3xl lg:px-8 lg:pb-12">
        <div className="flex w-full flex-col items-center text-center">

          {/* Logo */}
          <div className="my-0 flex justify-center">
            <Image
              src="https://assets.cdn.filesafe.space/XC630scPx5PEZe31LmuL/media/09cd3493-7d85-4c2a-8855-e34c95663611.png"
              alt="Logo"
              width={440}
              height={110}
              className="block h-[68px] w-auto object-contain sm:h-[84px] lg:h-24"
              priority
            />
          </div>

          {/* Main Headline - Changed mt-1 to mt-0 to eliminate space BELOW the logo */}
          <h1 className="mt-0 w-full text-[1.28rem] font-extrabold leading-[1.2] tracking-tight text-black min-[390px]:text-[1.42rem] sm:text-[1.85rem] sm:leading-[1.18] lg:text-[2.25rem]">
            <span className="block text-neutral-900">
              Otworzyłeś studio, żeby mieć wolność,{" "}
              <span className="text-[#ea580c]">a stworzyłeś sobie najdroższy etat?</span>
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mt-1.5 w-full text-[0.82rem] font-light leading-[1.32] tracking-normal text-neutral-800 min-[390px]:mt-2 min-[390px]:text-[0.9rem] sm:mt-2.5 sm:text-[1.05rem]">
            Poznaj program wdrożeniowy, w którym przebudujesz model studia, aby{" "}
            <span className="font-bold text-black">wejść na gwarantowane min. 20 tys. zł zysku / mies. pracująć po 5 godzin w tygodniu</span>.
          </p>

          {/* KROK 1 — obejrzyj wideo */}
          <div className="mt-5 w-full min-[390px]:mt-6 sm:mt-7">
            <StepBar step={1} title="Obejrzyj wideo poniżej" />
          </div>

          {/* Mux VSL */}
          <div className="relative mt-3 aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-2xl min-[390px]:mt-3.5 sm:mt-4">
            <iframe
              src={MUX_PLAYER_SRC}
              className="absolute inset-0 h-full w-full"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              title="Szkolenie — Dochodowe Studio"
            />
          </div>

          {/* KROK 2 — formularz */}
          <div id="zapis" className="mt-6 w-full scroll-mt-4 min-[390px]:mt-7 sm:mt-8">
            <StepBar step={2} title="Wypełnij formularz" />

            <div className="mt-3 flex w-full flex-col items-center min-[390px]:mt-3.5">
              <RegisterForm className="shadow-2xl" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}