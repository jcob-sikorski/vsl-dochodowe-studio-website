import { TEXT_FAQ } from "@/lib/narrative";
import {
  LOGO_URL,
  ORGANIZATION,
  PERSON,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
} from "@/lib/site";

/**
 * JSON-LD for the landing page: who runs the site, what the page is, who the
 * expert is, what the program is, and the FAQ that is visible on the page.
 * Everything here must match what a visitor can read on the page — Google
 * ignores (or penalises) markup for content that isn't shown.
 *
 * Left out on purpose: VideoObject (needs the VSL's real upload date) and
 * offers/prices (not shown on this page).
 */
/** `includeFaq: false` when the page variant doesn't show the FAQ (split test). */
export function StructuredData({ includeFaq = true }: { includeFaq?: boolean } = {}) {
  const org = `${SITE_URL}/#organization`;
  const site = `${SITE_URL}/#website`;
  const page = `${SITE_URL}/#webpage`;
  const person = `${SITE_URL}/#bartlomiej-sikorski`;

  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": org,
        name: ORGANIZATION.name,
        legalName: ORGANIZATION.legalName,
        url: SITE_URL,
        logo: { "@type": "ImageObject", url: LOGO_URL },
      },
      {
        "@type": "WebSite",
        "@id": site,
        url: SITE_URL,
        name: SITE_NAME,
        inLanguage: "pl-PL",
        publisher: { "@id": org },
      },
      {
        "@type": "Person",
        "@id": person,
        name: PERSON.name,
        jobTitle: PERSON.jobTitle,
        description: PERSON.description,
        affiliation: { "@id": org },
      },
      {
        "@type": "WebPage",
        "@id": page,
        url: `${SITE_URL}/`,
        name: SITE_TITLE,
        description: SITE_DESCRIPTION,
        inLanguage: "pl-PL",
        isPartOf: { "@id": site },
        about: { "@id": `${SITE_URL}/#program` },
        author: { "@id": person },
        primaryImageOfPage: { "@type": "ImageObject", url: `${SITE_URL}/opengraph-image` },
      },
      {
        "@type": "Service",
        "@id": `${SITE_URL}/#program`,
        name: "Program wdrożeniowy Dochodowe Studio",
        serviceType: "Mentoring biznesowy dla właścicieli studiów treningu personalnego",
        description:
          "Wdrożenie modelu kameralnego studia treningowego: klient premium, oferta 90-dniowej transformacji, płatna diagnoza, zespół trenerów i retencja klientów.",
        provider: { "@id": org },
        areaServed: { "@type": "Country", name: "Polska" },
        audience: { "@type": "BusinessAudience", name: "Właściciele studiów treningowych i trenerzy personalni" },
      },
      ...(includeFaq
        ? [
            {
              "@type": "FAQPage",
              "@id": `${SITE_URL}/#faq`,
              isPartOf: { "@id": page },
              mainEntity: TEXT_FAQ.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            },
          ]
        : []),
    ],
  };

  return (
    <script
      type="application/ld+json"
      // "<" escaped so the JSON can never close the script tag early.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph).replace(/</g, "\\u003c") }}
    />
  );
}
