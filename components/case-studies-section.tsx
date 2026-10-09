"use client";

import React from "react";
import { ScrollToFormCta } from "@/components/scroll-to-form-cta";

/**
 * Case studies section.
 *
 * Data model: `media` is an ARRAY per case study. Most people have one photo
 * or one video; a few have both (video first, then photo), rendered as one
 * heading followed by both pieces of media stacked together.
 *
 * Heading format: the heading is the person's NAME ONLY. The studio name
 * (when there is one) now leads the achievement line instead, e.g.
 * "Studio Name — outcome", so the visual heading never mixes name and
 * studio in inconsistent parenthetical / dash styles.
 *
 * Standardized in this pass:
 *  - All headings reduced to "name only" (studio moved into achievement).
 *  - "2 studio" → "2 studia" everywhere (numeral agreement).
 *  - Karolina Owczarzak's achievement had two conflicting profit figures
 *    ("12 tys. 40 tys. zł zysku mies."); kept 40 tys. zł per confirmation.
 *  - Money figures standardized to "X tys. zł" (was a mix of "25k",
 *    "40–50k", "20.000 zł", "30.000 zł").
 *  - Garbled/missing punctuation in a few achievement lines cleaned up
 *    (Igor Czobot, Eryk Witecki, Adam Stołowski, Dawid) without changing
 *    the underlying facts.
 *  - case_study_2 is still a placeholder ("...") — left as-is on request;
 *    fill in name/achievement/media when ready.
 *
 * Consolidated entries (previously duplicated, now one CaseStudy each):
 *  - Joanna Wójcik (Silna Studio)
 *  - Karolina Owczarzak (Trener.Ka)
 *  - Igor Czobot (Kobiecy Portal) — video entry's wording was kept as the
 *    source of truth for the achievement.
 *  - Patryk i Paula Grzemscy (PG Power) — video entry's wording was kept
 *    as the source of truth for the achievement.
 */

interface CaseStudiesSectionProps {
  /** Show the "scroll to form" CTA buttons after each case study. Defaults to true. */
  showCtaButtons?: boolean;
}

type CaseStudyMedia =
  | { type: "video"; muxSrc: string; aspectClass: string }
  | { type: "image"; src: string; alt: string };

interface CaseStudy {
  name: string;
  achievement: string;
  locationKey: string;
  /** One or more media items, rendered in order, stacked under the shared heading. */
  media: CaseStudyMedia[];
}

const CASE_STUDIES: CaseStudy[] = [
  {
    name: "Ela Ziółkowska",
    achievement: "20 tys. zł zysku mies.",
    locationKey: "case_study_1",
    media: [
      {
        type: "video",
        muxSrc: "https://player.mux.com/ZBeqrGS00CasLkKCYd3DDOutmmfZYpFHGyPXaZ8t2f4g",
        aspectClass: "aspect-[9/16]",
      },
    ],
  },
  {
    name: "Joanna Wójcik",
    achievement: "Silna Studio — od wizji bankructwa do 54 tys. zł zysku mies.",
    locationKey: "case_study_3",
    media: [
      {
        type: "video",
        muxSrc: "https://player.mux.com/ykvVNrkqdlEvoT4jyAO4rIJa7DD4cASnvhmpC01PHrN4",
        aspectClass: "aspect-[270/481]",
      },
      {
        type: "image",
        src: "https://assets.cdn.filesafe.space/XC630scPx5PEZe31LmuL/media/6aa032fa641597c752b045d3.png",
        alt: "Joanna Wójcik Kraków",
      },
    ],
  },
  {
    name: "Igor Czobot",
    achievement: "Kobiecy Portal — studio dla kobiet, plany kolejnej placówki",
    locationKey: "case_study_4",
    media: [
      {
        type: "image",
        src: "https://assets.cdn.filesafe.space/XC630scPx5PEZe31LmuL/media/02059f6c-c119-4ed3-a480-01bac9d1d210.png",
        alt: "Igor Czobot wywiad z otwarcia Kobiecy Portal",
      },
    ],
  },
  {
    name: "Karolina Owczarzak",
    achievement: "Trener.Ka — studio treningu siłowego 100 m² w gminie, 40 tys. zł zysku mies.",
    locationKey: "case_study_5",
    media: [
      {
        type: "image",
        src: "https://assets.cdn.filesafe.space/XC630scPx5PEZe31LmuL/media/15316c21-f546-4d32-8b2e-408a797c0f10.png",
        alt: "Karolina Owczarzak Trenerka K",
      },
    ],
  },
  {
    name: "Patryk i Paula Grzemscy",
    achievement: "PG Power — 2 studia, wolny czas i spełnianie się w zajawce",
    locationKey: "case_study_6",
    media: [
      {
        type: "image",
        src: "https://assets.cdn.filesafe.space/XC630scPx5PEZe31LmuL/media/43d3825b-1a86-400c-943d-7e52e840e2cf.png",
        alt: "Patryk Grzemski PG Power Case Study",
      },
    ],
  },
  {
    name: "Eryk Witecki",
    achievement:
      "Gym Clinic Józefów — z 25 tys. zł na sali do 4 trenerów, czasu dla rodziny i 40 tys. zł zysku mies.",
    locationKey: "case_study_7",
    media: [
      {
        type: "image",
        src: "https://assets.cdn.filesafe.space/XC630scPx5PEZe31LmuL/media/6aa034478de363112b5458c8.jpeg",
        alt: "Eryk Witecki Gym Clinic",
      },
    ],
  },
  {
    name: "Klaudia Ostrowska",
    achievement: "Fitko Toruń — 40–50 tys. zł na rękę, 3 trenerki w zespole i zarządzanie z podróży",
    locationKey: "case_study_8",
    media: [
      {
        type: "image",
        src: "https://assets.cdn.filesafe.space/XC630scPx5PEZe31LmuL/media/0168c657-bbf7-4044-83ec-ffc180df5034.png",
        alt: "Klaudia Ostrowska Fitko Toruń",
      },
    ],
  },
  {
    name: "Krzysztof Mariańczyk",
    achievement: "Champion Katowice — od zera do 7 trenerów, studio zarabia, gdy właściciel jest na wakacjach",
    locationKey: "case_study_9",
    media: [
      {
        type: "image",
        src: "https://assets.cdn.filesafe.space/XC630scPx5PEZe31LmuL/media/cdcc5416-c085-474b-aae1-5225c2e61570.png",
        alt: "Krzysztof Mariańczyk Champion Katowice",
      },
    ],
  },
  {
    name: "Michał Mekitow Humeńczyk",
    achievement: "Od 2 studia do 3, menadżera i poukładanych procesów",
    locationKey: "case_study_10",
    media: [
      {
        type: "image",
        src: "https://assets.cdn.filesafe.space/XC630scPx5PEZe31LmuL/media/38d5b4a7-f0ff-4eb1-8f58-c934062e6e93.png",
        alt: "Michał Mekitow Humeńczyk",
      },
    ],
  },
  {
    name: "Piotr Smulczyk",
    achievement:
      "20 tys. zł zysku z 40 m² – 2 trenerów w zespole, zysk z małego lokalu i plan na kolejne studio",
    locationKey: "case_study_11",
    media: [
      {
        type: "image",
        src: "https://assets.cdn.filesafe.space/XC630scPx5PEZe31LmuL/media/be616acc-e195-471f-a051-c329bdc6b45a.png",
        alt: "Piotr Smulczyk wywiad po 6 miesiącach",
      },
    ],
  },
  {
    name: "Adam Stołowski",
    achievement:
      "STO POWER Łódź — architektura marży od startu: ułożony proces sprzedaży i wysoka marża jeszcze przed otwarciem",
    locationKey: "case_study_12",
    media: [
      {
        type: "image",
        src: "https://assets.cdn.filesafe.space/XC630scPx5PEZe31LmuL/media/6aa03671a08d19d927525e54.png",
        alt: "Adam Stołowski STO POWER",
      },
    ],
  },
  {
    name: "Adrian i Konrad",
    achievement:
      "Stillmotion Tychy — 30 tys. zł zysku miesięcznie: w pełni oddelegowane studio, 7 trenerów i oddana sprzedaż",
    locationKey: "case_study_13",
    media: [
      {
        type: "video",
        muxSrc: "https://player.mux.com/gC00vzqUsxjFtErmI00hh1O01yMmzLuTQ2NIcFaEPw7iyc",
        aspectClass: "aspect-[9/16]",
      },
      {
        type: "image",
        src: "https://assets.cdn.filesafe.space/XC630scPx5PEZe31LmuL/media/6aa037d3641597c752b0cb8a.jpeg",
        alt: "Stillmotion Tychy Adrian i Konrad Case Study",
      },
      {
        type: "video",
        muxSrc: "https://player.mux.com/ZZSZQncTadSyzUXBLUChNNhG7QDTzahfu9w01wRmwIZ00",
        aspectClass: "aspect-[9/16]",
      },
    ],
  },
  {
    name: "Dawid",
    achievement:
      "Myślał, że dużo zarabia na online — dziś ma zespół trenerów w kameralnej siłowni i sam jest zaskoczony efektem",
    locationKey: "case_study_14",
    media: [
      {
        type: "image",
        src: "https://assets.cdn.filesafe.space/XC630scPx5PEZe31LmuL/media/ac97c037-4d40-4b3d-b4a9-1717b2a7c160.png",
        alt: "Dawid case study",
      },
    ],
  },
  {
    name: "Alicja Wieczorek",
    achievement:
      "Od 300h pracy na recepcji i grupówkach do własnego studia i treningów personalnych",
    locationKey: "case_study_15",
    media: [
      {
        type: "image",
        src: "https://assets.cdn.filesafe.space/XC630scPx5PEZe31LmuL/media/ba4a3bef-891e-465e-a44f-7a2752211efd.png",
        alt: "Alicja Wieczorek case study",
      },
    ],
  },
  {
    name: "Michał Cichy",
    achievement: "Od 2 studia do 3 i podbijania okolicy swoją poukładaną siecią",
    locationKey: "case_study_16",
    media: [
      {
        type: "image",
        src: "https://assets.cdn.filesafe.space/XC630scPx5PEZe31LmuL/media/92cc09e0-0051-438c-938e-a52b7f944eae.png",
        alt: "Michał Cichy case study",
      },
      {
        type: "video",
        muxSrc: "https://player.mux.com/vFbzJuq5BcXXb4U202dN2AhVWmkCfhPE7WxCqLoQbu5k",
        aspectClass: "aspect-[108/193]",
      },
    ],
  },
];

export function CaseStudiesSection({ showCtaButtons = true }: CaseStudiesSectionProps) {
  return (
    <section data-track-section="historie" className="w-full bg-white pt-1 pb-12 px-4 sm:px-6">
      <div className="mx-auto flex w-full max-w-[22.5rem] sm:max-w-[25.5rem] flex-col items-center">
        {/* Top Highlighter Header */}
        <div className="inline-block bg-[#faea75] px-5 min-[390px]:px-6 py-1 text-center">
          <h2 className="text-[1.2rem] min-[390px]:text-[1.35rem] sm:text-[1.5rem] font-bold leading-tight tracking-tight text-black">
            Historie{" "}
            <span className="underline decoration-black decoration-[2px] underline-offset-[2px]">
              uczestników
            </span>
          </h2>
        </div>

        <p className="mt-3 max-w-[21rem] text-center text-[0.86rem] leading-[1.5] text-neutral-700">
          Ponad 50 właścicieli przeszło kwalifikację. Każdy z nich stał kiedyś tam, gdzie Ty teraz, i mógł poczekać kolejny rok.
        </p>

        {/* ================= CASE STUDIES (one shared structure, media can repeat) ================= */}
        {CASE_STUDIES.map((cs, index) => (
          <React.Fragment key={cs.locationKey}>
            <div className={`flex w-full flex-col items-center ${index === 0 ? "mt-6" : "mt-7"}`}>
              <h3 className="text-center text-[1.12rem] min-[390px]:text-[1.24rem] sm:text-[1.38rem] font-bold leading-[1.18] tracking-tight text-neutral-900">
                {cs.name}:<br />{cs.achievement}
              </h3>

              {cs.media.map((m, mediaIndex) =>
                m.type === "video" ? (
                  <div
                    key={mediaIndex}
                    className={`relative ${mediaIndex === 0 ? "mt-2" : "mt-3"} w-full overflow-hidden rounded-[1.1rem] border border-neutral-200/80 bg-black shadow-xs ${m.aspectClass}`}
                  >
                    <iframe
                      src={m.muxSrc}
                      className="absolute inset-0 h-full w-full border-0"
                      allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                      allowFullScreen
                      title={`${cs.name} — case study`}
                    />
                  </div>
                ) : (
                  <div
                    key={mediaIndex}
                    className={`relative ${mediaIndex === 0 ? "mt-2" : "mt-3"} w-full overflow-hidden rounded-[1.1rem] border border-neutral-200/80 shadow-xs`}
                  >
                    <img src={m.src} alt={m.alt} className="h-auto w-full block" />
                  </div>
                )
              )}
            </div>

            {showCtaButtons && (
              <div className="mt-5 w-full">
                <ScrollToFormCta location={cs.locationKey} />
              </div>
            )}
          </React.Fragment>
        ))}

        {/* Bottom Highlighter Banner */}
        <div className="mt-8 sm:mt-10 flex w-full justify-center">
          <div className="w-[90%] sm:w-[85%] bg-[#faea75] py-1 sm:py-1.5 text-center">
            <h3 className="text-[1.18rem] min-[390px]:text-[1.32rem] sm:text-[1.48rem] font-bold leading-tight tracking-tight text-neutral-950">
              I{" "}
              <span className="underline decoration-neutral-950 decoration-[1.8px] sm:decoration-[2px] underline-offset-[3px] [text-decoration-skip-ink:none]">
                50+ innych właścicieli...
              </span>
            </h3>
          </div>
        </div>

        {/* Social Proof Context Subtext */}
        <p className="mt-2 text-center text-[0.78rem] sm:text-[0.84rem] text-neutral-500 max-w-[21rem]">
          M.in. Joanna Wójcik (Silna Studio: zajechanie na sali zamienione w 3 trenerów i drugie
          studio), Klaudia Ostrowska (Fitko Toruń: 40–50 tys. zł na rękę, zarządzanie z podróży) czy
          Adrian i Konrad (Stillmotion Tychy: 7 trenerów, 30 tys. zł zysku i oddelegowana sprzedaż).
        </p>
      </div>
    </section>
  );
}