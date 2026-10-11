import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * /see-you stays crawlable on purpose: it carries a noindex tag, and Google
 * can only honour that tag on a page it is allowed to fetch.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/api/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
