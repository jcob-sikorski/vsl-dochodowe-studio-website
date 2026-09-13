import { LegalFooter } from "@/components/legal-footer";

import { ThankYouVideoSection } from "@/components/thank-you-video-section";
import { FaqVideosSection } from "@/components/faq-section";
import { DueDiligenceSection } from "@/components/due-dilligence-section";
import { CaseStudiesSection } from "@/components/case-studies-section";
import { RealTransparencySection } from "@/components/real-transparency-section";
import { PlaybookSection } from "@/components/playbook-section";

export default function ConfirmationPage() {
  return (
    <main>
      <ThankYouVideoSection />

      <PlaybookSection />

      <FaqVideosSection />

      <DueDiligenceSection />

      <CaseStudiesSection showCtaButtons={false} />

      <RealTransparencySection />

      {/* 11. Stopka */}
      <LegalFooter />
    </main>
  );
}
