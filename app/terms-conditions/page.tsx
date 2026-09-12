import type { Metadata } from "next";

import { TermsConditionsSection } from "@/components/terms-conditions-section";
import { LegalFooter } from "@/components/legal-footer";

export const metadata: Metadata = {
  title: "Regulamin — Sportowe Przedmieście sp. z o.o.",
  description:
    "Zasady uczestnictwa w programie oraz korzystania ze strony DochodoweStudio.com prowadzonej przez Sportowe Przedmieście sp. z o.o.",
};

export default function TermsConditionsPage() {
  return (
    <main>
      <TermsConditionsSection />
      <LegalFooter />
    </main>
  );
}