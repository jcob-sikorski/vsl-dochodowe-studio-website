"use client";

import React from "react";

interface FaqVideo {
  id: string;
  question: string;
  videoUrl: string;
}

const FAQ_VIDEOS: FaqVideo[] = [
  {
    id: "mentor-credibility",
    question: "Czy Bartłomiej faktycznie sam prowadził studio, czy tylko sprzedaje wiedzę teoretyczną?",
    videoUrl: "https://player.mux.com/L00VgJ9ZfPkVpXB9GTsX02DCIUT64JhtoBWouHFZ3Zr018",
  },
  {
    id: "guarantee",
    question: "Jak dokładnie wygląda gwarancja zwrotu i czy ktoś w ogóle ją dostał?",
    videoUrl: "https://player.mux.com/iLQZInH78coFBEblAy2AZXldrqgY0291uy4BHk5AFfL8",
  },
  {
    id: "burned-before",
    question: "Próbowałem już innych konsultantów/kursów bez efektu — czym to się różni?",
    videoUrl: "https://player.mux.com/WsxEHKzmzQgUqn01tDFEQkQy4FRPi3yhiaXG8j6j01q8U",
  },
  {
    id: "realistic-for-my-city",
    question: "Czy 20–50 tys. zł zysku jest realne dla mojego miasta?",
    videoUrl: "https://player.mux.com/aEPKkLGHnMgKOxwOS8ZaWa7qRvrzDgQRtZMujEHK3o8",
  },
  {
    id: "starting-capital",
    question: "Ile kapitału startowego realnie muszę mieć, zanim zobaczę pierwszy zysk?",
    videoUrl: "https://player.mux.com/9JZP3FHPuh4mQZCUTYPebaRj67F3IKN02t5ne6SWkMX4",
  },
  {
    id: "income-during-transition",
    question: "Co się stanie z moim obecnym dochodem w trakcie przechodzenia na model studia?",
    videoUrl: "https://player.mux.com/Nx02s3Qd98i01YZNX8z5S1PlCfvAe5ZunDW8Czgp9BjKs",
  },
];

export function FaqVideosSection() {
  return (
    <section className="relative w-full bg-white font-sans selection:bg-orange-200 flex flex-col items-center overflow-x-hidden pt-4 pb-14 px-4 sm:px-6">
      <div className="mx-auto flex w-full max-w-[28rem] sm:max-w-xl md:max-w-2xl flex-col items-center">

        {/* Eyebrow Pill */}
        <div className="inline-flex items-center justify-center rounded-full border-[1.5px] border-neutral-300 bg-neutral-50 px-3.5 py-1 shadow-2xs">
          <span className="text-[0.65rem] font-extrabold uppercase tracking-[0.16em] text-neutral-900">
            NASTĘPNY KROK
          </span>
        </div>

        {/* Section Headline */}
        <h2 className="mt-2.5 text-center text-[1.25rem] min-[390px]:text-[1.38rem] sm:text-[1.58rem] font-extrabold leading-tight tracking-tight text-neutral-900">
          Odpowiedzi na najbardziej <br />
          <span className="underline decoration-neutral-900 decoration-2 underline-offset-2">
            palące pytania
          </span>
        </h2>

        <p className="mt-2 text-center text-[0.78rem] min-[390px]:text-[0.84rem] sm:text-[0.88rem] font-light leading-[1.38] text-neutral-600">
          Sześć pytań, które słyszymy najczęściej — tym razem{" "}
          <span className="font-bold text-neutral-900">odpowiadam na nie osobiście, na kamerze</span>.
          Pełny zapis, z dokumentami i danymi, znajdziesz w sekcji „Fakty bez filtra" niżej.
        </p>

        {/* Videos Stack with Titles at the Bottom */}
        <div className="mt-7 flex w-full flex-col gap-8 sm:gap-10">
          {FAQ_VIDEOS.map((item) => (
            <div key={item.id} className="flex w-full flex-col items-center">
              {/* Video Frame — same treatment as the hero VSL: black bg, no colored border */}
              <div className="relative w-full overflow-hidden rounded-2xl bg-black shadow-2xl">
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
