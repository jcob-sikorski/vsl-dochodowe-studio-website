import { SectionHeader } from "@/components/narrative/section-header";

/** Header for the video testimonials block (interviews + case studies follow). */
export function VideosIntro() {
  return (
    <section id="polecajki" data-track-section="polecajki" className="w-full scroll-mt-14 bg-white px-4 pb-8 pt-12 sm:px-6 sm:pt-16 lg:pb-10 lg:pt-20">
      <div className="mx-auto flex w-full max-w-[26rem] flex-col items-center sm:max-w-xl">
        <SectionHeader eyebrow="8 · Polecajki · obowiązkowe" before="Posłuchaj właścicieli," underline="którzy już to wdrożyli" />
        <p className="mt-4 max-w-xl text-center text-[0.9rem] leading-[1.55] text-neutral-700 sm:text-[0.98rem]">
          Obejrzyj <strong className="font-extrabold text-neutral-900">minimum 2 filmy</strong> — najlepiej te, w których sytuacja właściciela jest najbliższa Twojej (nowe studio, naprawa istniejącego, druga placówka).
        </p>
      </div>
    </section>
  );
}
