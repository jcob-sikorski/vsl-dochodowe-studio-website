"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { captureAttributionFromUrl } from "@/lib/attribution";

// Captures UTM/fbclid into localStorage on first load and on every
// client-side route change, so it's available wherever the form gets submitted.
export function AttributionCapture() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    captureAttributionFromUrl();
  }, [pathname, searchParams]);

  return null;
}