"use client";

import { RegisterForm } from "@/components/register-form";
import {
  HEADLINE_EXPERIMENT,
  defaultVariant,
  parseHeadline,
  type AbVariant,
} from "@/lib/ab";

const MUX_PLAYER_SRC =
  "https://player.mux.com/t6BcSjNXtsAFs01M01w9ls7kia2WZNxf4A7TZrip5RPvs";

function StepBar({ step, title }: { step: number; title: string }) {
  return (
    <div
      className="
        flex w-full items-center justify-center gap-2.5
        rounded-full border-[1.5px] border-neutral-300 bg-neutral-50
        px-3.5 py-1.5
        sm:gap-3 sm:px-4 sm:py-2
      "
    >
      <div
        className="
          flex h-5 w-5 shrink-0 items-center justify-center
          rounded-full bg-neutral-900 text-[0.68rem] font-extrabold
          text-white
          sm:h-[1.35rem] sm:w-[1.35rem] sm:text-[0.72rem]
        "
      >
        {step}
      </div>
      <span
        className="
          text-[0.78rem] font-extrabold leading-tight tracking-tight
          text-neutral-900
          sm:text-[0.86rem]
        "
      >
        {title}
      </span>
    </div>
  );
}

interface VslHeroSectionProps {
  /**
   * Which headline to show. Chosen in middleware, read from a cookie in
   * app/page.tsx, rendered here — so the visitor never sees it change.
   * Defaults to the control, which keeps this component usable anywhere.
   */
  variant?: AbVariant;
}

export function VslHeroSection({ variant }: VslHeroSectionProps) {
  const active = variant ?? defaultVariant();
  const segments = parseHeadline(active.headline);
  const subheadline = active.subheadline ?? HEADLINE_EXPERIMENT.subheadline;

  return (
    <section className="relative w-full overflow-x-hidden bg-white pt-6 font-sans selection:bg-orange-200 sm:pt-8 lg:pt-10">
      <div className="mx-auto w-full max-w-[25rem] px-3 pb-5 min-[390px]:pb-6 sm:max-w-[34rem] sm:px-3.5 sm:pb-8 lg:max-w-3xl lg:px-8 lg:pb-12">
        <div className="flex w-full flex-col items-center text-center">

          {/* Main Headline */}
          <h1 className="mt-0 w-full text-[1.28rem] font-extrabold leading-[1.2] tracking-tight text-black min-[390px]:text-[1.42rem] sm:text-[1.85rem] sm:leading-[1.18] lg:text-[2.25rem]">
            <span className="block text-neutral-900">
              {segments.map((segment, index) =>
                segment.underline ? (
                  <span
                    key={index}
                    className="underline decoration-neutral-900 decoration-2 underline-offset-2"
                  >
                    {segment.text}
                  </span>
                ) : (
                  <span key={index}>{segment.text}</span>
                )
              )}
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mt-1.5 w-full text-[0.82rem] font-light leading-[1.32] tracking-normal text-neutral-800 min-[390px]:mt-2 min-[390px]:text-[0.9rem] sm:mt-2.5 sm:text-[1.05rem]">
            {subheadline}
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