"use client";

import React from "react";

interface ThankYouVideoSectionProps {
  stepMessage?: string;
  thumbnailUrl?: string;
  videoUrl?: string;
}

export function ThankYouVideoSection({
  stepMessage = "Jesteś O Krok Od Zmiany",
  thumbnailUrl = "https://ucarecdn.com/3cb95e08-818a-470b-b52a-a9e5d9d37d8d/unnamed9.webp",
  videoUrl,
}: ThankYouVideoSectionProps) {
  return (
    <section className="relative w-full bg-white font-sans selection:bg-orange-200 flex flex-col items-center overflow-x-hidden pt-3 pb-12 px-4 sm:px-6">
      <div className="mx-auto flex w-full max-w-[28rem] sm:max-w-xl md:max-w-2xl flex-col items-center">

        {/* Top 72% Progress Bar: neutral track, black fill — matches opt-in page system */}
        <div className="w-full mb-4">
          <div className="relative h-3.5 sm:h-4 w-full overflow-hidden rounded-full border-[1.5px] border-neutral-300 bg-neutral-100 shadow-2xs">
            {/* Black Fill */}
            <div
              className="h-full bg-[#ea580c]"
              style={{ width: "72%" }}
            />
            {/* Perfectly Centered Label */}
            <span className="absolute inset-0 flex items-center justify-center text-[0.62rem] sm:text-[0.68rem] font-black leading-none text-white tracking-wider pointer-events-none">
              72%
            </span>
          </div>
        </div>

        {/* Headline */}
        <h1 className="mx-auto w-full text-center text-[1.12rem] min-[390px]:text-[1.25rem] sm:text-[1.45rem] font-extrabold uppercase leading-[1.2] tracking-tight text-neutral-900">
          Gratulacje, Twoje Zgłoszenie Do Programu Zostało Wysłane!<br />
          <span className="underline decoration-neutral-900 decoration-2 underline-offset-2">
            {stepMessage}
          </span>
        </h1>

        {/* Subheadline */}
        <p className="mx-auto mt-2.5 w-full text-center text-[0.78rem] min-[390px]:text-[0.84rem] sm:text-[0.92rem] font-light leading-[1.35] tracking-normal text-neutral-800">
          Krótka wiadomość ode mnie, zanim ruszymy z mentoringiem{" "}
          <span className="font-bold text-neutral-900">następnie przewiń stronę w dół</span>
        </p>

        {/* Video Container — same treatment as the hero VSL: black bg, rounded-2xl, shadow-2xl, no colored border */}
        <div className="relative mt-6 w-full overflow-hidden rounded-2xl bg-black shadow-2xl">
          <iframe
            src="https://player.mux.com/t6BcSjNXtsAFs01M01w9ls7kia2WZNxf4A7TZrip5RPvs"
            style={{ width: "100%", display: "block", border: "none", aspectRatio: "53/29" }}
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
            allowFullScreen
          />
        </div>

      </div>
    </section>
  );
}
