import type { Metadata } from "next";
import { LegalFooter } from "@/components/legal-footer";
import { SectionTracker } from "@/components/section-tracker";

import { ThankYouVideoSection } from "@/components/thank-you-video-section";
import { FaqVideosSection } from "@/components/faq-section";
import { CaseStudiesSection } from "@/components/case-studies-section";
import { PlaybookSection } from "@/components/playbook-section";
import { ClientInterviewsSection } from "@/components/client-interviews-section";
import { NextStepsSection } from "@/components/narrative/next-steps-section";
import { CallPrepSection } from "@/components/narrative/call-prep-section";
import { RecapSection } from "@/components/narrative/recap-section";
import { TextFaqSection } from "@/components/narrative/text-faq-section";

/**
 * Confirmation page. Job: get the applicant to pick up the phone and arrive
 * at the qualification call prepared and still convinced.
 *   video → what happens now → how to prepare (and what we check)
 *   → playbook → why this decision (okno / rozwidlenie / selekcja)
 *   → written FAQ → video FAQ → interviews → case studies
 */
// A thank-you page has nothing to rank for, and an indexed one lets people
// skip the form. noindex, but links stay followable.
export const metadata: Metadata = {
  title: "Zgłoszenie przyjęte",
  robots: { index: false, follow: true },
};

export default function ConfirmationPage() {
  return (
    <main>
      <SectionTracker page="confirm" />

      <ThankYouVideoSection />

      <NextStepsSection />

      <CallPrepSection />

      <PlaybookSection />

      <RecapSection />

      <TextFaqSection />

      <FaqVideosSection />

      <ClientInterviewsSection />

      <CaseStudiesSection showCtaButtons={false} />

      {/* 11. Stopka */}
      <LegalFooter />
    </main>
  );
}
