import React, { type ReactNode, Suspense } from "react";
import type { Metadata, Viewport } from "next";
import { Poppins, Inter } from "next/font/google";
import "./globals.css";
import { FacebookPixel } from "@/components/facebook-pixel";
import { AttributionCapture } from "@/components/attribution-capture";
import { ClarityInit } from "@/components/clarity-init";
import { Analytics } from "@vercel/analytics/next";
import {
  LOGO_URL,
  ORGANIZATION,
  PERSON,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
} from "@/lib/site";

const body = Inter({
  subsets: ["latin", "latin-ext"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-body",
});

const display = Poppins({
  subsets: ["latin", "latin-ext"],
  weight: ["600", "700", "800"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-display",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // No maximumScale: pinch-zoom stays available (accessibility, and Lighthouse
  // flags blocked zoom). Inputs are 16px, so iOS doesn't auto-zoom on focus.
  interactiveWidget: "resizes-content",
  themeColor: "#ffffff",
};

const verification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  applicationName: SITE_NAME,
  authors: [{ name: PERSON.name }],
  creator: ORGANIZATION.legalName,
  publisher: ORGANIZATION.legalName,
  category: "business",
  alternates: { canonical: "/" },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: LOGO_URL,
    shortcut: LOGO_URL,
    apple: LOGO_URL,
  },
  // og:image and twitter fallbacks come from app/opengraph-image.tsx.
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: "/",
    siteName: SITE_NAME,
    locale: "pl_PL",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  ...(verification ? { verification: { google: verification } } : {}),
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="pl" className={`${body.variable} ${display.variable} overflow-x-hidden`}>
      <body className="font-sans text-body overflow-x-hidden">
        
        {/* WRAP THIS IN SUSPENSE TO PREVENT DE-OPTIMIZING THE WHOLE SITE TO SSR */}
        <Suspense fallback={null}>
          <AttributionCapture />
        </Suspense>
        
        <Suspense fallback={null}>
          <FacebookPixel />
        </Suspense>

        {/* No useSearchParams here, so no Suspense boundary needed —
            unlike the two above, this won't opt the route into dynamic rendering. */}
        <ClarityInit />
        
        {children}

        {/* VERCEL ANALYTICS */}
        <Analytics />
      </body>
    </html>
  );
}