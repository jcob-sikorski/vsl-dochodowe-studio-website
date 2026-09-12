import type { Metadata } from "next";

import { PrivacyPolicySection } from "@/components/privacy-policy-section";
import { LegalFooter } from "@/components/legal-footer";

export const metadata: Metadata = {
  title: "Polityka Prywatności — Sportowe Przedmieście sp. z o.o.",
  description:
    "Zasady przetwarzania i ochrony danych osobowych przez Sportowe Przedmieście sp. z o.o.",
};

export default function PrivacyPolicyPage() {
  return (
    <main>
      <PrivacyPolicySection />
      <LegalFooter />
    </main>
  );
}
