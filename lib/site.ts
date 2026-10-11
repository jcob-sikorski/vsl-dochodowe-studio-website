/* -------------------------------------------------------------------------- *
 * lib/site.ts
 *
 * One source for everything search engines and link previews read: the
 * canonical domain, the title and description, and the organisation and
 * person behind the site. Used by app/layout.tsx (metadata), robots.ts,
 * sitemap.ts and components/structured-data.tsx.
 *
 * Set NEXT_PUBLIC_SITE_URL in Vercel if the production domain ever changes.
 * Every canonical URL, the sitemap and the JSON-LD follow it.
 * -------------------------------------------------------------------------- */

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://vsl.dochodowestudio.com").replace(/\/+$/, "");

export const SITE_NAME = "Dochodowe Studio";

/** ≤ 60 characters, so Google doesn't cut it off. Main keyword first. */
export const SITE_TITLE = "Dołącz i zbuduj rentowne studio treningowe | Dochodowe Studio";

/** ≤ 160 characters. Says who it's for, what they get and what to do. */
export const SITE_DESCRIPTION =
  "Kameralne studio treningu personalnego z zyskiem 20–50 tys. zł miesięcznie: oferta 90 dni, sprzedaż i zespół. Obejrzyj wideo i złóż zgłoszenie do programu.";

export const SITE_KEYWORDS = [
  "jak otworzyć studio treningowe",
  "studio treningu personalnego",
  "ile kosztuje otwarcie studia treningowego",
  "biznes fitness",
  "własne studio treningowe",
  "rentowne studio fitness",
  "mentoring dla trenerów personalnych",
  "Dochodowe Studio",
  "Bartłomiej Sikorski",
];

export const LOGO_URL =
  "https://assets.cdn.filesafe.space/XC630scPx5PEZe31LmuL/media/6a3689380a683b64fe2824bd.png";

export const ORGANIZATION = {
  name: SITE_NAME,
  legalName: "Sportowe Przedmieście sp. z o.o.",
};

export const PERSON = {
  name: "Bartłomiej Sikorski",
  jobTitle: "Mentor właścicieli studiów treningowych",
  description:
    "Właściciel czterech studiów Sportowe Przedmieście. Pracował z ponad 100 osobami z branży fitness i z ok. 50 studiami treningowymi.",
};
