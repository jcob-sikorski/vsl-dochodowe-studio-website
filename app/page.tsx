import { cookies } from "next/headers";

import { VslHeroSection } from "@/components/vsl-hero-section";
import { LegalFooter } from "@/components/legal-footer";
import { CaseStudiesSection } from "@/components/case-studies-section";
import { AbViewBeacon } from "@/components/ab-view-beacon";
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
 */
export const dynamic = "force-dynamic";

export default async function Home() {
  const jar = await cookies();
  const variantId = parseVariantCookie(jar.get(AB_VARIANT_COOKIE)?.value);
  const variant = getVariant(variantId);

  return (
    <main>
      <AbViewBeacon experimentId={HEADLINE_EXPERIMENT.id} variantId={variant.id} />

      <VslHeroSection variant={variant} />

      <CaseStudiesSection />

      <LegalFooter />
    </main>
  );
}
