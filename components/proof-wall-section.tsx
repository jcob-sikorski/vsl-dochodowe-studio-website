"use client";

import { useState } from "react";
import { ScrollToFormCta } from "@/components/scroll-to-form-cta";
import { PROOF_WALL_IMAGES, PROOF_WALL_TITLE } from "@/lib/proof-wall";
import { track } from "@/lib/track";

/** How many screenshots are visible before "Pokaż więcej" (keeps mobile light). */
const INITIAL = 12;
const STEP = 24;
/** An apply button is shown after every this many screenshots. */
const CTA_EVERY = 6;

/**
 * Proof wall — a masonry of real message screenshots from participants.
 * Starts with 12 so the page stays light on mobile; "Pokaż więcej" adds 24.
 */
export function ProofWallSection({ showCta = true }: { showCta?: boolean } = {}) {
  const [visible, setVisible] = useState(INITIAL);
  const images = PROOF_WALL_IMAGES.slice(0, visible);
  const rest = PROOF_WALL_IMAGES.length - visible;
  const chunks: string[][] = [];
  for (let k = 0; k < images.length; k += CTA_EVERY) chunks.push(images.slice(k, k + CTA_EVERY));

  return (
    <section data-track-section="proof_wall" className="w-full bg-white px-4 pb-12 pt-2 sm:px-6">
      <div className="mx-auto flex w-full max-w-[22.5rem] flex-col items-center sm:max-w-xl md:max-w-3xl">
        <div className="inline-block bg-[#faea75] px-5 py-1 text-center min-[390px]:px-6">
          <h2 className="text-[1.2rem] font-bold leading-tight tracking-tight text-black min-[390px]:text-[1.35rem] sm:text-[1.5rem]">
            {PROOF_WALL_TITLE.name}:{" "}
            <span className="underline decoration-black decoration-[2px] underline-offset-[2px]">{PROOF_WALL_TITLE.achievement}</span>
          </h2>
        </div>

        <p className="mt-3 max-w-[22rem] text-center text-[0.86rem] leading-[1.5] text-neutral-700">{PROOF_WALL_TITLE.intro}</p>

        {chunks.map((chunk, c) => (
          <div key={c} className="w-full">
            <div className={`${c === 0 ? "mt-6" : "mt-3"} w-full columns-1 gap-3 sm:columns-2 md:columns-3`}>
              {chunk.map((src, i) => (
                <div key={src} className="mb-3 break-inside-avoid overflow-hidden rounded-[0.9rem] border border-neutral-200/80 shadow-xs">
                  <img
                    src={src}
                    alt={`Wiadomość od uczestnika ${c * CTA_EVERY + i + 1}`}
                    loading="lazy"
                    decoding="async"
                    className="block h-auto w-full"
                  />
                </div>
              ))}
            </div>
            {/* Apply button after every full chunk, except after the last visible one (the closing CTA covers it). */}
            {c < chunks.length - 1 && (
              <div className="mb-4 mt-2 w-full">
                <ScrollToFormCta location={`proof_wall_${c + 1}`} />
              </div>
            )}
          </div>
        ))}

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
          <div className="mt-7 w-full">
            <ScrollToFormCta location="proof_wall" />
          </div>
        )}
      </div>
    </section>
  );
}
