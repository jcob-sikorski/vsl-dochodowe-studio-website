import { Suspense } from "react";
import type { Metadata } from "next";
import { LegalFooter } from "@/components/legal-footer";
import { SectionTracker } from "@/components/section-tracker";

import { MaterialsHeroSection } from "@/components/materials/materials-hero-section";
import { AboutSection } from "@/components/materials/about-section";
import { NumbersSection } from "@/components/materials/numbers-section";
import { JourneySection } from "@/components/materials/journey-section";
import { ProgramSection } from "@/components/materials/program-section";
import { VideosIntro } from "@/components/materials/videos-intro";
import { VerifySection } from "@/components/materials/verify-section";
import { DecisionCallSection } from "@/components/materials/decision-call-section";
import { MaterialsNav } from "@/components/materials/materials-nav";
import { SubmittedBanner } from "@/components/materials/submitted-banner";
import { PlaybookSection } from "@/components/playbook-section";
import { ClientInterviewsSection } from "@/components/client-interviews-section";
import { CaseStudiesSection } from "@/components/case-studies-section";
import { FaqVideosSection } from "@/components/faq-section";

/**
 * /materialy — MANDATORY pre-call materials. Two ways in:
 *   - the application form redirects here (?zgloszenie=1) — it replaced /see-you
 *   - the setter sends this link before every decision call (replaces the
 *     pre-consultation emails)
 *
 *   rule + checklist (+ opt-out)
 *   → 1 kim jesteśmy → 2 dla kogo → 3 liczby → 4 ścieżka klienta i dlaczego
 *   → 5 playbook (obowiązkowy) → 6 co dostajesz → 7 wsparcie + rezultat
 *   → 8 polecajki (wywiady, case studies, FAQ wideo)
 *   → 9 sprawdź nas + ryzyko → 10 rozmowa decyzyjna (self-check)
 */
// Reached only through the setter's link: keep it out of search.
export const metadata: Metadata = {
  title: "Materiały przed rozmową",
  robots: { index: false, follow: false },
};

export default function MaterialsPage() {
  return (
    <main>
      <SectionTracker page="materials" />

      {/* useSearchParams needs a Suspense boundary to keep the page static. */}
      <Suspense fallback={null}>
        <SubmittedBanner />
      </Suspense>

      <MaterialsHeroSection />

      <MaterialsNav />

      <AboutSection />

      <NumbersSection />

      <JourneySection />

      <PlaybookSection
        eyebrow="5 · Playbook · obowiązkowy"
        intro="Cały model od podszewki: jak wygląda i dlaczego wygląda właśnie tak. Przekartkuj go przed rozmową — to podstawa, od której zaczniemy, a nie coś, co będziemy tłumaczyć na rozmowie:"
        required
        layout="split"
      />

      <ProgramSection />

      <VideosIntro />

      <ClientInterviewsSection layout="grid" />

      <CaseStudiesSection showCtaButtons={false} layout="grid" />

      <FaqVideosSection layout="grid" />

      <VerifySection />

      <DecisionCallSection />

      <LegalFooter />
    </main>
  );
}
