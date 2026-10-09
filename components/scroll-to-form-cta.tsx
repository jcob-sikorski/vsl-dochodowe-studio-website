"use client";

import Clarity from "@microsoft/clarity";
import { Button } from "@/components/ui/button";
import { CTA_LABEL } from "@/lib/narrative";

interface ScrollToFormCtaProps {
  location: string;
  label?: string;
  className?: string;
}

export function ScrollToFormCta({
  location,
  label = CTA_LABEL,
  className = "",
}: ScrollToFormCtaProps) {
  return (
    <div className={`flex w-full justify-center ${className}`}>
      <Button
        type="button"
        onClick={() => {
          Clarity.event("cta_button_clicked");
          Clarity.setTag("cta_location", location);

          const el = document.getElementById("zapis");

          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
          } else {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        }}
        className="!h-16 w-full max-w-[22rem] rounded-xl !border-none !bg-[#ea580c] !px-6 text-lg font-extrabold uppercase tracking-normal text-white shadow-[0_8px_24px_-4px_rgba(234,88,12,0.45)] transition-colors hover:!bg-[#c2410c] active:scale-[0.99] sm:!h-[4.5rem] sm:max-w-[28rem] sm:text-xl"
      >
        {label}
      </Button>
    </div>
  );
}