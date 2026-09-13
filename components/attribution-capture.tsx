"use client";

/* -------------------------------------------------------------------------- *
 * src/components/attribution-capture.tsx
 *
 * Captures UTM / click IDs into localStorage on first load and on every
 * client-side route change, so they're available wherever the form is
 * submitted — even three pages deep.
 *
 * Mount it once in app/layout.tsx:
 *     <AttributionCapture />
 *
 * The internal <Suspense> boundary is required because useSearchParams()
 * opts the tree into client-side rendering; without it `next build` fails
 * with "useSearchParams() should be wrapped in a suspense boundary".
 * -------------------------------------------------------------------------- */

import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { captureAttributionFromUrl } from "@/lib/attribution";

function AttributionCaptureInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    try {
      captureAttributionFromUrl();
    } catch (error) {
      // Never let analytics break a page render.
      console.error("[attribution] capture failed:", error);
    }
  }, [pathname, searchParams]);

  return null;
}

export function AttributionCapture() {
  return (
    <Suspense fallback={null}>
      <AttributionCaptureInner />
    </Suspense>
  );
}

export default AttributionCapture;
