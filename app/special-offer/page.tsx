import { SpecialOfferHero } from "@/components/special-offer-hero";
import { SpecialOfferBonuses } from "@/components/special-offer-bonuses";
import { SpecialOfferTestimonials } from "@/components/special-offer-testimonials";
import { SpecialOfferGuarantee } from "@/components/special-offer-guarantee";

export default function SpecialOfferPage() {
  return (
    <main className="min-h-screen bg-white font-sans selection:bg-blue-200">
      <SpecialOfferHero />
      <SpecialOfferTestimonials />
      <SpecialOfferBonuses />
      <SpecialOfferGuarantee />
    </main>
  );
}