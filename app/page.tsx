import { cookies } from "next/headers";

import { VslHeroSection } from "@/components/vsl-hero-section";
import { LegalFooter } from "@/components/legal-footer";
import { SectionTracker } from "@/components/section-tracker";
import { CaseStudiesSection } from "@/components/case-studies-section";
import { AbViewBeacon } from "@/components/ab-view-beacon";
import { QualificationBar } from "@/components/narrative/qualification-bar";
import { WhyNowSection } from "@/components/narrative/why-now-section";
import { CrossroadsSection } from "@/components/narrative/crossroads-section";
import { ReasonsSection } from "@/components/narrative/reasons-section";
import { SelectionSection } from "@/components/narrative/selection-section";
import { FinalDecisionSection } from "@/components/narrative/final-decision-section";
import { TextFaqSection } from "@/components/narrative/text-faq-section";
import { StructuredData } from "@/components/structured-data";
import {
  AB_VARIANT_COOKIE,
  HEADLINE_EXPERIMENT,
  getVariant,
  parseVariantCookie,
} from "@/lib/ab";

/**
 * The headline differs per visitor, so this page can't be prerendered once and
 * shared. Middleware has already pinned the variant in a cookie by the time we
 * get here; we only read it.
 *
 * Page architecture follows the funnel narrative in lib/narrative.ts:
 *   bar (program, by application) → hero + VSL + form
 *   → OKNO (why now) → ROZWIDLENIE (decide today vs. 5 more years)
 *   → reasons → SELEKCJA (who it's for, how qualification works)
 *   → proof → final fork + CTA
 *
 * Split test v5 (lib/ab.ts): the `no_copy` arm skips everything between the
 * hero and the case studies.
 */
export const dynamic = "force-dynamic";

export default async function Home() {
  const jar = await cookies();
  const variantId = parseVariantCookie(jar.get(AB_VARIANT_COOKIE)?.value);
  const variant = getVariant(variantId);
  const showNarrative = variant.showNarrative !== false;

  return (
    <main>
      <AbViewBeacon experimentId={HEADLINE_EXPERIMENT.id} variantId={variant.id} />

      <SectionTracker page="landing" />

      <QualificationBar />

      <VslHeroSection variant={variant} />

      {showNarrative && (
        <>
          <WhyNowSection />

          <CrossroadsSection />

          <ReasonsSection />

          <SelectionSection />

          <TextFaqSection eyebrow="Pytania" before="Najczęstsze pytania o" underline="własne studio" />
        </>
      )}

      <CaseStudiesSection />

      <FinalDecisionSection />

      <LegalFooter />

      <StructuredData includeFaq={showNarrative} />
    </main>
  );
}
