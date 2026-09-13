"use client";

/* -------------------------------------------------------------------------- *
 * src/components/facebook-pixel.tsx
 *
 * Loads the Meta pixel and fires a deduplicated PageView (browser + CAPI) on
 * every route change.
 *
 * The ONLY other event this app ever sends is "SubmitApplication", and that is
 * fired from <RegisterForm /> after /api/register confirms the submission.
 *
 * Mount once in app/layout.tsx:
 *     <FacebookPixel />
 * -------------------------------------------------------------------------- */

import { Suspense, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";

import { trackPageView } from "@/app/actions";
import { resolveAttribution } from "@/lib/attribution";

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "965293539900334";

declare global {
  interface Window {
    fbq?: any;
    _fbq?: any;
  }
}

/** Crypto-strong where available, with a safe fallback for old browsers. */
export function makeEventId(prefix: string): string {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return `${prefix}_${crypto.randomUUID().replace(/-/g, "")}`;
    }
  } catch {
    /* fall through */
  }
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;
}

function FacebookPixelInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoaded, setIsLoaded] = useState(false);

  // React 18 StrictMode mounts effects twice in dev; this makes sure a single
  // navigation never produces two PageViews.
  const lastTrackedKey = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoaded || typeof window === "undefined" || !window.fbq) return;

    const key = `${pathname}?${searchParams?.toString() ?? ""}`;
    if (lastTrackedKey.current === key) return;
    lastTrackedKey.current = key;

    const eventId = makeEventId("pv");

    // 1. Browser event, carrying the dedup ID.
    try {
      window.fbq("track", "PageView", {}, { eventID: eventId });
    } catch (error) {
      console.error("[pixel] browser PageView failed:", error);
    }

    // 2. Server event with the SAME ID — Meta keeps whichever arrives first.
    let attribution;
    try {
      attribution = resolveAttribution();
    } catch {
      attribution = undefined;
    }

    trackPageView({
      eventId,
      sourceUrl: window.location.href,
      attribution,
    }).catch((error) => console.error("[pixel] CAPI PageView failed:", error));
  }, [pathname, searchParams, isLoaded]);

  if (!META_PIXEL_ID) return null;

  return (
    <Script
      id="meta-pixel"
      strategy="afterInteractive"
      onLoad={() => setIsLoaded(true)}
      onError={(error) => console.error("[pixel] script failed to load:", error)}
      dangerouslySetInnerHTML={{
        __html: `
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window,document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', ${JSON.stringify(META_PIXEL_ID)});
// PageView is intentionally NOT fired here — the effect above owns it so the
// browser and server events share one eventID and get deduplicated.
        `.trim(),
      }}
    />
  );
}

export function FacebookPixel() {
  return (
    <Suspense fallback={null}>
      <FacebookPixelInner />
    </Suspense>
  );
}

export default FacebookPixel;
