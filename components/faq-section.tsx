"use client";

import React from "react";

interface FaqVideo {
  id: string;
  question: string;
  videoUrl: string;
}

const FAQ_VIDEOS: FaqVideo[] = [
  {
    id: "live",
    question: "Czy to szkolenie jest na żywo?",
    videoUrl: "https://player.mux.com/L00VgJ9ZfPkVpXB9GTsX02DCIUT64JhtoBWouHFZ3Zr018",
  },
  {
    id: "cant-make-it",
    question: "Co jeśli nie mogę pojawić się na szkoleniu?",
    videoUrl: "https://player.mux.com/iLQZInH78coFBEblAy2AZXldrqgY0291uy4BHk5AFfL8",
  },
  {
    id: "burned-before",
    question: "Już wcześniej się sparzyłem... czy to zadziała?",
    videoUrl: "https://player.mux.com/WsxEHKzmzQgUqn01tDFEQkQy4FRPi3yhiaXG8j6j01q8U",
  },
  {
    id: "selling",
    question: "Czy będziesz próbował mi coś sprzedać?",
    videoUrl: "https://player.mux.com/aEPKkLGHnMgKOxwOS8ZaWa7qRvrzDgQRtZMujEHK3o8",
  },
  {
    id: "experience",
    question: "Czy muszę mieć już własną społeczność lub ofertę?",
    videoUrl: "https://player.mux.com/9JZP3FHPuh4mQZCUTYPebaRj67F3IKN02t5ne6SWkMX4",
  },
  {
    id: "bonuses",
    question: "Gdzie i kiedy otrzymam swoje bonusy?",
    videoUrl: "https://player.mux.com/Nx02s3Qd98i01YZNX8z5S1PlCfvAe5ZunDW8Czgp9BjKs",
  },
];

export function FaqVideosSection() {
  return (
    <section className="relative w-full bg-white font-sans selection:bg-orange-200 flex flex-col items-center overflow-x-hidden pt-4 pb-14 px-4 sm:px-6">
      <div className="mx-auto flex w-full max-w-[28rem] sm:max-w-xl md:max-w-2xl flex-col items-center">
        
        {/* Step Badge */}
        <div className="inline-flex items-center justify-center rounded-full border border-[#fed7aa] bg-[#fff7ed] px-3.5 py-0.5 shadow-2xs">
          <span className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-[#ea580c]">
            NASTĘPNY KROK
          </span>
        </div>

        {/* Section Headline */}
        <h2 className="mt-2.5 text-center text-[1.25rem] min-[390px]:text-[1.38rem] sm:text-[1.58rem] font-black leading-tight tracking-tight text-neutral-900">
          Odpowiedzi na najbardziej <br />
          <span className="text-[#ea580c]">palące pytania</span>
        </h2>

        <p className="mt-2 text-center text-[0.78rem] min-[390px]:text-[0.84rem] sm:text-[0.88rem] font-normal leading-[1.38] text-neutral-600">
          Krótkie odpowiedzi Jakuba na najczęściej poruszane kwestie przed szkoleniem.
        </p>

        {/* Videos Stack with Titles at the Bottom */}
        <div className="mt-7 flex w-full flex-col gap-8 sm:gap-10">
          {FAQ_VIDEOS.map((item) => (
            <div key={item.id} className="flex w-full flex-col items-center">
              {/* Video Frame */}
              <div className="relative w-full overflow-hidden rounded-2xl border-[3.5px] sm:border-[4px] border-[#ea580c] shadow-xl">
                <iframe
                  src={item.videoUrl}
                  title={item.question}
                  style={{ width: "100%", display: "block", border: "none", aspectRatio: "53/29" }}
                  allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                  allowFullScreen
                />
              </div>

              {/* Title at the Bottom */}
              <h3 className="mt-3 text-center text-[1rem] min-[390px]:text-[1.08rem] sm:text-[1.2rem] font-extrabold leading-snug tracking-tight text-neutral-900">
                {item.question}
              </h3>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}