"use client";

import React from "react";
import Image from "next/image";
import { ScrollToFormCta } from "@/components/scroll-to-form-cta";

interface TestimonialStrip {
  name: string;
  achievement: string;
  imageSrc: string;
  alt: string;
  link?: string;
}

const TESTIMONIAL_STRIPS: TestimonialStrip[] = [
  {
    name: "Klaudia Ostrowska",
    achievement:
      "Od bycia najlepszym i jedynym trenerem w studio do zespołu 4 osób i poukładanej machiny",
    imageSrc:
      "https://assets.cdn.filesafe.space/XC630scPx5PEZe31LmuL/media/0168c657-bbf7-4044-83ec-ffc180df5034.png",
    alt: "Klaudia Ostrowska case study",
  },
  {
    name: "Piotr Smulczyk",
    achievement:
      "Od trenera pracującego w środę do szefa ze studio na pół etatu i 20k zysku",
    imageSrc:
      "https://assets.cdn.filesafe.space/XC630scPx5PEZe31LmuL/media/be616acc-e195-471f-a051-c329bdc6b45a.png",
    alt: "Piotr Smulczyk case study",
  },
  {
    name: "Dawid",
    achievement:
      "Myślał, że zarabia dużo na online, teraz ma zespół trenerów w kameralnej siłowni i się zdziwił",
    imageSrc:
      "https://assets.cdn.filesafe.space/XC630scPx5PEZe31LmuL/media/ac97c037-4d40-4b3d-b4a9-1717b2a7c160.png",
    alt: "Dawid case study",
  },
  {
    name: "Alicja Wieczorek",
    achievement:
      "Od 300h pracy na recepcji i grupówkach do własnego studia i treningów personalnych",
    imageSrc:
      "https://assets.cdn.filesafe.space/XC630scPx5PEZe31LmuL/media/ba4a3bef-891e-465e-a44f-7a2752211efd.png",
    alt: "Alicja Wieczorek case study",
  },
  {
    name: "Michał Cichy",
    achievement: "Od 2 studio do 3 i podbijania okolicy swoją poukładaną siecią",
    imageSrc:
      "https://assets.cdn.filesafe.space/XC630scPx5PEZe31LmuL/media/92cc09e0-0051-438c-938e-a52b7f944eae.png",
    alt: "Michał Cichy case study",
  },
  {
    name: "Joanna Wójcik",
    achievement:
      "Od sekundy przed bankructwem do 66 tysięcy w pierwszym miesiącu współpracy",
    imageSrc:
      "https://assets.cdn.filesafe.space/XC630scPx5PEZe31LmuL/media/a6ae3e71-1df8-4d95-bcc9-49ebec4ff930.png",
    alt: "Joanna Wójcik case study",
  },
];

interface VideoCaseStudy {
  name: string;
  achievement: string;
  muxSrc: string;
  aspectClass: string;
  locationKey: string;
}

const VIDEO_CASE_STUDIES: VideoCaseStudy[] = [
  {
    name: "Michał Mekitow Humeńczyk",
    achievement: "Od 2 studio do 3, menadżera i poukładanych procesów",
    muxSrc: "https://player.mux.com/ZBeqrGS00CasLkKCYd3DDOutmmfZYpFHGyPXaZ8t2f4g",
    aspectClass: "aspect-[9/16]",
    locationKey: "case_study_1",
  },
  {
    name: "Adam Stołowski",
    achievement: "Od trenera z sieciówki do właściciela studia i zespołu",
    muxSrc: "https://player.mux.com/ZZSZQncTadSyzUXBLUChNNhG7QDTzahfu9w01wRmwIZ00",
    aspectClass: "aspect-[9/16]",
    locationKey: "case_study_2",
  },
  {
    name: "Krzysztof Mariańczyk",
    achievement:
      "Od studia, w którym był sterem i okrętem, do 7 trenerów i ciągłych wyjazdów za granicę, gdy studio działa i zarabia!",
    muxSrc: "https://player.mux.com/ykvVNrkqdlEvoT4jyAO4rIJa7DD4cASnvhmpC01PHrN4",
    aspectClass: "aspect-[270/481]",
    locationKey: "case_study_3",
  },
  {
    name: "Igor Czobot",
    achievement: "Studio Kobiet 115m²",
    muxSrc: "https://player.mux.com/gC00vzqUsxjFtErmI00hh1O01yMmzLuTQ2NIcFaEPw7iyc",
    aspectClass: "aspect-[9/16]",
    locationKey: "case_study_4",
  },
  {
    name: "Karolina Owczarzak",
    achievement: "Studio treningu siłowego 100m², gmina, 12 tys.",
    muxSrc: "https://player.mux.com/w8Bfb9flUXXLoV9O17XNKcJRL8GVh71XOwsaEhQe1pg",
    aspectClass: "aspect-[135/292]",
    locationKey: "case_study_5",
  },
  {
    name: "Patryk i Paula Grzemscy",
    achievement: "Od etatów do 2 studio, wolnego czasu i spełniania się w zajawce",
    muxSrc: "https://player.mux.com/vFbzJuq5BcXXb4U202dN2AhVWmkCfhPE7WxCqLoQbu5k",
    aspectClass: "aspect-[108/193]",
    locationKey: "case_study_6",
  },
];

export function CaseStudiesSection() {
  return (
    <section className="w-full bg-white pt-1 pb-12 px-4 sm:px-6">
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

        {/* ================= VIDEO CASE STUDIES ================= */}
        {VIDEO_CASE_STUDIES.map((cs, index) => (
          <React.Fragment key={cs.locationKey}>
            <div className={`flex w-full flex-col items-center ${index === 0 ? "mt-6" : "mt-7"}`}>
              <h3 className="text-center text-[1.12rem] min-[390px]:text-[1.24rem] sm:text-[1.38rem] font-bold leading-[1.18] tracking-tight text-neutral-900">
                {cs.name}:<br />{cs.achievement}
              </h3>

              <div
                className={`relative mt-2 w-full max-w-[16rem] overflow-hidden rounded-[1.1rem] border border-neutral-200/80 bg-black shadow-xs ${cs.aspectClass} sm:max-w-[18rem]`}
              >
                <iframe
                  src={cs.muxSrc}
                  className="absolute inset-0 h-full w-full border-0"
                  allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                  allowFullScreen
                  title={`${cs.name} — case study`}
                />
              </div>
            </div>

            <div className="mt-5 w-full">
              <ScrollToFormCta location={cs.locationKey} />
            </div>
          </React.Fragment>
        ))}

        {/* ================= TESTIMONIAL STRIPS ================= */}
        <div className="mt-9 flex w-full flex-col gap-6">
          {TESTIMONIAL_STRIPS.map((strip) => (
            <a
              key={strip.name}
              href={strip.link || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex w-full flex-col items-center transition-opacity hover:opacity-95"
            >
              <h4 className="text-center text-[1.15rem] min-[390px]:text-[1.25rem] leading-tight tracking-tight text-neutral-900">
                <span className="font-extrabold text-neutral-900 group-hover:underline">
                  {strip.name}
                </span>{" "}
                <span className="block text-[0.82rem] font-normal text-neutral-600 mt-0.5">
                  {strip.achievement}
                </span>
              </h4>

              <div className="relative mt-2 w-full overflow-hidden rounded-[0.85rem] border border-neutral-200/80 shadow-xs">
                <Image
                  src={strip.imageSrc}
                  alt={strip.alt}
                  width={800}
                  height={450}
                  className="h-auto w-full block transition-transform duration-300 group-hover:scale-[1.02]"
                />
              </div>
            </a>
          ))}
        </div>

        <div className="mt-6 w-full">
          <ScrollToFormCta location="testimonial_strips" />
        </div>

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
          M.in. Joanna Wójcik (od sekundy przed bankructwem do 66 tys. zł w pierwszym miesiącu) czy Piotr Smulczyk (studio na pół etatu i 20k zysku).
        </p>
      </div>
    </section>
  );
}