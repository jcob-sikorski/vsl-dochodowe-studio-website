import { LegalFooter } from "@/components/legal-footer";

import { ThankYouVideoSection } from "@/components/thank-you-video-section";
import { FaqVideosSection } from "@/components/faq-section";
import { CaseStudiesSection } from "@/components/case-studies-section";
import { PlaybookSection } from "@/components/playbook-section";
import { ClientInterviewsSection } from "@/components/client-interviews-section";

export default function ConfirmationPage() {
  return (
    <main>
      <ThankYouVideoSection />

      <PlaybookSection />

      <FaqVideosSection />

      <ClientInterviewsSection />

      <CaseStudiesSection showCtaButtons={false} />

      {/* 11. Stopka */}
      <LegalFooter />
    </main>
  );
}