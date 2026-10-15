import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/** Only pages meant to be found. /przygotowanie (noindex) and /dashboard are left out. */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/privacy-policy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/terms-conditions`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];
}
