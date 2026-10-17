"use client";

import { useState } from "react";
import { ScrollToFormCta } from "@/components/scroll-to-form-cta";
import { PROOF_WALL_IMAGES, PROOF_WALL_TITLE } from "@/lib/proof-wall";
import { track } from "@/lib/track";

/** How many screenshots are visible before "Pokaż więcej". */
const INITIAL = 12;
const STEP = 24;
/** Mobile only: an apply button after every this many screenshots. */
const CTA_EVERY = 6;

function Shot({ src, n }: { src: string; n: number }) {
  return (
    <div className="mb-3 break-inside-avoid overflow-hidden rounded-[0.9rem] border border-neutral-200/80 shadow-xs">
      <img src={src} alt={`Wiadomość od uczestnika ${n}`} loading="lazy" decoding="async" className="block h-auto w-full" />
    </div>
  );
}

/**
 * Proof wall — real message screenshots from participants.
 *  - mobile (< md): one column, an apply button every CTA_EVERY screenshots;
 *  - desktop (md+): one continuous 3-column masonry, no buttons in between
 *    (buttons inside a masonry break it into uneven blocks).
 */
export function ProofWallSection({ showCta = true }: { showCta?: boolean } = {}) {
  const [visible, setVisible] = useState(INITIAL);
  const images = PROOF_WALL_IMAGES.slice(0, visible);
  const rest = PROOF_WALL_IMAGES.length - visible;

  const chunks: string[][] = [];
  for (let k = 0; k < images.length; k += CTA_EVERY) chunks.push(images.slice(k, k + CTA_EVERY));

  return (
    <section data-track-section="proof_wall" className="w-full bg-white px-4 pb-12 pt-2 sm:px-6">
      <div className="mx-auto flex w-full max-w-[24rem] flex-col items-center md:max-w-4xl">
        <div className="inline-block bg-[#faea75] px-5 py-1 text-center min-[390px]:px-6">
          <h2 className="text-[1.2rem] font-bold leading-tight tracking-tight text-black min-[390px]:text-[1.35rem] sm:text-[1.5rem]">
            {PROOF_WALL_TITLE.name}:{" "}
            <span className="underline decoration-black decoration-[2px] underline-offset-[2px]">{PROOF_WALL_TITLE.achievement}</span>
          </h2>
        </div>

        <p className="mt-3 max-w-[22rem] text-center text-[0.86rem] leading-[1.5] text-neutral-700 md:max-w-md">{PROOF_WALL_TITLE.intro}</p>

        {/* Mobile: one column with apply buttons in between */}
        <div className="mt-6 w-full md:hidden">
          {chunks.map((chunk, c) => (
            <div key={c} className="w-full">
              {chunk.map((src, i) => (
                <Shot key={src} src={src} n={c * CTA_EVERY + i + 1} />
              ))}
              {c < chunks.length - 1 && (
                <div className="mb-5 mt-2 w-full">
                  <ScrollToFormCta location={`proof_wall_${c + 1}`} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Desktop: one continuous masonry */}
        <div className="mt-8 hidden w-full columns-3 gap-4 md:block">
          {images.map((src, i) => (
            <Shot key={src} src={src} n={i + 1} />
          ))}
        </div>

        {rest > 0 && (
          <button
            type="button"
            onClick={() => {
              setVisible((v) => v + STEP);
              track("proof_wall_more");
            }}
            className="mt-3 rounded-full border border-neutral-300 px-5 py-2.5 text-[0.86rem] font-bold text-neutral-900 transition hover:bg-neutral-50"
          >
            Pokaż więcej ({rest})
          </button>
        )}

        {showCta && (
          <div className="mt-7 w-full max-w-[24rem]">
            <ScrollToFormCta location="proof_wall" />
          </div>
        )}
      </div>
    </section>
  );
}
