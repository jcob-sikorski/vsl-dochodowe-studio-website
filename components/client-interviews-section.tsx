"use client";

import React from "react";

/**
 * "Wywiady z klientami" — YouTube client interview section.
 *
 * Format matches CaseStudiesSection: same media container size
 * (max-w-[22.5rem] sm:max-w-[25.5rem], rounded-[1.1rem], border,
 * shadow-xs), one column, stacked. Each entry shows the video's real
 * YouTube title above a clickable thumbnail (opens the video in a new
 * tab) instead of an embedded player, since these are meant as a quick
 * browsable list rather than inline playback.
 */

interface InterviewVideo {
  id: string;
  title: string;
}

const INTERVIEW_VIDEOS: InterviewVideo[] = [
  {
    id: "djhzLOPwEfI",
    title:
      "Miał wydać 4× więcej. Dziś ma studio z systemem, który zarabia | Case study Włodo",
  },
  {
    id: "Faf0TBg_DpQ",
    title: "Miała piękne studio i prawie je zamknęła. Co uratowało jej biznes?",
  },
  {
    id: "PuLUm907meI",
    title:
      "Jak studio zarabia, gdy właściciel jest w Tajlandii? System, zespół i realia biznesu",
  },
  {
    id: "DfHVKnmTn3c",
    title: "Otworzył własne studio i przeszło za nim prawie 100% klientów",
  },
  {
    id: "WNcbyFyhPyQ",
    title:
      "Otworzył własne studio dla kobiet. „Na sieciówce nie da się dać tej jakości”",
  },
  {
    id: "bHBhj0a1S0U",
    title: "Nie miała czasu na życie. W miesiąc otworzyła własne studio treningowe",
  },
  {
    id: "c9JNecprL68",
    title: "Rok temu nie wierzył. Dziś ma własne studio i sprzedaje pakiety za 6900 zł",
  },
  {
    id: "u7rk1lC03cM",
    title: "Otworzył studio i zbudował team. Jak mentoring pomógł poukładać biznes?",
  },
  {
    id: "_qTuIWqnVIY",
    title:
      "Z 3 etatów do własnego studia. Jak trenerka odzyskała czas i zbudowała system?",
  },
  {
    id: "eLsnc0_OZFY",
    title: "Z etatu na kopalni do własnego studia. Jak trener otworzył drugą lokalizację?",
  },
  {
    id: "JmSl_mpfoQA",
    title: "Brał 50 zł za trening. Dziś ma klub z 7 trenerami",
  },
  {
    id: "7BLTrJAjYh8",
    title: "Od zawodnika MMA do właściciela studia z zespołem. Historia Patryka",
  },
];

function PlayIcon() {
  return (
    <svg
      className="h-6 w-6 sm:h-7 sm:w-7 text-white translate-x-[1px]"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M8 5.14v13.72c0 .78.85 1.27 1.53.87l11.4-6.86a1 1 0 0 0 0-1.72L9.53 4.27A1 1 0 0 0 8 5.14z" />
    </svg>
  );
}

function InterviewThumbnail({ id, title }: { id: string; title: string }) {
  const [src, setSrc] = React.useState(`https://i.ytimg.com/vi/${id}/maxresdefault.jpg`);

  return (
    <a
      href={`https://youtu.be/${id}`}
      target="_blank"
      rel="noreferrer"
      aria-label={title}
      className="group relative mt-2 block w-full overflow-hidden rounded-[1.1rem] border border-neutral-200/80 bg-black shadow-xs"
    >
      <img
        src={src}
        alt={title}
        loading="lazy"
        onError={() => setSrc(`https://i.ytimg.com/vi/${id}/hqdefault.jpg`)}
        className="block aspect-video h-auto w-full object-cover"
      />
      {/* Play button overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/10 transition-colors duration-200 group-hover:bg-black/25">
        <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-black/60 shadow-md transition-transform duration-200 group-hover:scale-105">
          <PlayIcon />
        </div>
      </div>
    </a>
  );
}

export function ClientInterviewsSection() {
  return (
    <section className="w-full bg-white pt-1 pb-12 px-4 sm:px-6">
      <div className="mx-auto flex w-full max-w-[22.5rem] sm:max-w-[25.5rem] flex-col items-center">
        {/* Top Highlighter Header — same treatment as CaseStudiesSection */}
        <div className="inline-block bg-[#faea75] px-5 min-[390px]:px-6 py-1 text-center">
          <h2 className="text-[1.2rem] min-[390px]:text-[1.35rem] sm:text-[1.5rem] font-bold leading-tight tracking-tight text-black">
            Wywiady{" "}
            <span className="underline decoration-black decoration-[2px] underline-offset-[2px]">
              z klientami
            </span>
          </h2>
        </div>

        {/* ================= INTERVIEW VIDEOS ================= */}
        {INTERVIEW_VIDEOS.map((video, index) => (
          <div
            key={video.id}
            className={`flex w-full flex-col items-center ${index === 0 ? "mt-6" : "mt-7"}`}
          >
            <h3 className="text-center text-[1.05rem] min-[390px]:text-[1.14rem] sm:text-[1.24rem] font-bold leading-[1.25] tracking-tight text-neutral-900">
              {video.title}
            </h3>

            <InterviewThumbnail id={video.id} title={video.title} />
          </div>
        ))}
      </div>
    </section>
  );
}