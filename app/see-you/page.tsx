import { LegalFooter } from "@/components/legal-footer";

import { ThankYouVideoSection } from "@/components/thank-you-video-section";
import { AddToCalendarSection } from "@/components/add-to-calendar-section";
import { FaqVideosSection } from "@/components/faq-section";
import { DueDiligenceSection } from "@/components/due-dilligence-section";
import { CaseStudiesSectionConfirmation } from "@/components/case-studies-section-confirmation";
import { RealTransparencySection } from "@/components/real-transparency-section";

export default function ConfirmationPage() {
  return (
    <main>
      <ThankYouVideoSection />

      <AddToCalendarSection />

      <FaqVideosSection />

      <DueDiligenceSection />

      <CaseStudiesSectionConfirmation />

      <RealTransparencySection />

      {/* 11. Stopka */}
      <LegalFooter />
    </main>
  );
}