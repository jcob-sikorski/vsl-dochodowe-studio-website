"use client";

import React from "react";

interface ThankYouVideoSectionProps {
  workshopDateTime?: string;
  thumbnailUrl?: string;
  videoUrl?: string;
}

export function ThankYouVideoSection({
  workshopDateTime = "CZWARTEK, 17 WRZEŚNIA o 20:00",
  thumbnailUrl = "https://ucarecdn.com/3cb95e08-818a-470b-b52a-a9e5d9d37d8d/unnamed9.webp",
  videoUrl,
}: ThankYouVideoSectionProps) {
  return (
    <section className="relative w-full bg-white font-sans selection:bg-orange-200 flex flex-col items-center overflow-x-hidden pt-3 pb-12 px-4 sm:px-6">
      <div className="mx-auto flex w-full max-w-[28rem] sm:max-w-xl md:max-w-2xl flex-col items-center">
        
        {/* Top 72% Progress Bar: Warm peach track with punchy orange fill */}
        <div className="w-full mb-4">
          <div className="relative h-3.5 sm:h-4 w-full overflow-hidden rounded-full bg-[#fff7ed] border border-[#fed7aa] shadow-2xs">
            {/* Orange Fill */}
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
        <h1 className="mx-auto w-full text-center text-[1.12rem] min-[390px]:text-[1.25rem] sm:text-[1.45rem] font-black uppercase leading-[1.2] tracking-tight text-neutral-900">
          Gratki, Widzimy Się Na Szkoleniu!<br />
          <span className="text-[#ea580c]">{workshopDateTime}</span>
        </h1>

        {/* Subheadline */}
        <p className="mx-auto mt-2.5 w-full text-center text-[0.78rem] min-[390px]:text-[0.84rem] sm:text-[0.92rem] font-normal leading-[1.35] tracking-tight text-neutral-800">
          Krótka wiadomość ode mnie przed szkoleniem{" "}
          <span className="font-bold text-black">następnie przewiń stronę w dół</span>
        </p>

        {/* Extended Video Container */}
        <div className="relative mx-auto mt-6 w-full overflow-hidden rounded-2xl border-[3.5px] sm:border-[4px] border-[#ea580c] shadow-xl">
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