"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { track } from "@/lib/track";

/**
 * /materialy is also the page after the application form (it replaced
 * /see-you). The form redirects here with ?zgloszenie=1, so those visitors
 * first see that the application went through and what happens next.
 * Visitors from the setter's link don't see this strip.
 */
export function SubmittedBanner() {
  const fromForm = useSearchParams()?.get("zgloszenie") === "1";

  useEffect(() => {
    if (fromForm) track("cta_materialy_arrived_form", { once: true });
  }, [fromForm]);

  if (!fromForm) return null;

  return (
    <div role="status" className="w-full bg-emerald-700 px-4 py-3 text-white sm:px-6">
      <div className="mx-auto flex max-w-5xl items-start gap-3 sm:items-center">
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-[0.8rem] font-black text-emerald-700 sm:mt-0">
          ✓
        </span>
        <p className="text-[0.84rem] leading-[1.45] sm:text-[0.9rem]">
          <strong className="font-extrabold">Zgłoszenie przyjęte.</strong> Wkrótce zadzwonimy, żeby umówić rozmowę decyzyjną — miej telefon pod ręką. Zanim to zrobimy, zapoznaj się z materiałami poniżej.
        </p>
      </div>
    </div>
  );
}
