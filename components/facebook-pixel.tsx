"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";
import { useEffect, useState } from "react";
import { sendToMetaCAPI } from "@/app/actions";

const PIXEL_ID = "965293539900334";

export function FacebookPixel() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Whenever the route changes, fire a deduplicated PageView event via Browser and CAPI
    if (isLoaded && typeof window !== "undefined" && window.fbq) {
      // 1. Generate a unique ID for this specific page view
      const eventId = `pv_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

      // 2. Fire the Browser Event WITH the deduplication ID
      window.fbq("track", "PageView", {}, { eventID: eventId });

      // 3. Fire the Server Event (CAPI) silently in the background
      sendToMetaCAPI({
        eventId: eventId,
        eventName: "PageView",
        sourceUrl: window.location.href,
      }).catch((err) => console.error("PageView CAPI Error:", err));
    }
  }, [pathname, searchParams, isLoaded]);

  return (
    <Script
      id="meta-pixel"
      strategy="afterInteractive"
      onLoad={() => setIsLoaded(true)}
      dangerouslySetInnerHTML={{
        __html: `
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${PIXEL_ID}');
          // Note: fbq('track', 'PageView') has been removed from here. 
          // It is now handled exclusively by the useEffect block above to ensure deduplication.
        `,
      }}
    />
  );
}