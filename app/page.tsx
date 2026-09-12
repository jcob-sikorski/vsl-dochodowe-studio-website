import { VslHeroSection } from "@/components/vsl-hero-section";
import { LegalFooter } from "@/components/legal-footer";
import { CaseStudiesSection } from "@/components/case-studies-section";

export default function Home() {
  return (
    <main>
      <VslHeroSection />

      <CaseStudiesSection />

      <LegalFooter />
    </main>
  );
}