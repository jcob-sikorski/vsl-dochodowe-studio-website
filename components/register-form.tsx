"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { sendToMetaCAPI } from "@/app/actions";
import { resolveAttribution } from "@/lib/attribution";
import Clarity from "@microsoft/clarity";

declare global {
  interface Window {
    fbq: any;
  }
}

interface RegisterFormProps {
  className?: string;
  onSuccess?: () => void;
}

export function RegisterForm({ className = "", onSuccess }: RegisterFormProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function cleanPolishPhone(rawPhone: string) {
    let digits = rawPhone.replace(/\D/g, "");
    if (digits.startsWith("0048")) digits = digits.slice(4);
    if (digits.length === 11 && digits.startsWith("48")) digits = digits.slice(2);
    return digits;
  }

  // Fires pixel + CAPI. Only ever called AFTER /api/register has confirmed
  // success, so a failed submission never reaches Meta as a "Lead".
  async function reportLeadToMeta({
    firstName,
    lastName,
    email,
    e164Digits,
    eventId,
    attribution,
  }: {
    firstName: string;
    lastName: string;
    email: string;
    e164Digits: string;
    eventId: string;
    attribution: ReturnType<typeof resolveAttribution>;
  }) {
    if (typeof window !== "undefined" && window.fbq) {
      window.fbq("init", "965293539900334", {
        em: email.toLowerCase().trim(),
        ph: e164Digits,
        fn: firstName.toLowerCase().trim(),
        ln: lastName.toLowerCase().trim(),
        country: "pl",
        external_id: email.toLowerCase().trim(),
      });
      window.fbq(
        "track",
        "Lead",
        { content_name: "Warsztat: Poukladane Studio" },
        { eventID: eventId }
      );
    }

    try {
      await sendToMetaCAPI({
        eventName: "Lead",
        email,
        phone: e164Digits,
        firstName,
        lastName,
        clientCategory: "Webinar Registrant",
        sourceUrl: window.location.href,
        eventId,
        attribution,
      });
    } catch (capiErr) {
      // Non-blocking: a failed CAPI call shouldn't stop the user from
      // proceeding to /see-you, but we do want it in the logs.
      console.error("Non-blocking CAPI Error:", capiErr);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;

    // Fires the moment the user hits submit, before we know the outcome —
    // this is your "intent to register" signal, mirrored as a Clarity
    // Smart Event so you can filter session recordings by it directly.
    Clarity.event("register_button_clicked");

    setIsSubmitting(true);
    const nameParts = fullName.trim().split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";
    const nationalPhone = cleanPolishPhone(phone);
    const e164Digits = `48${nationalPhone}`;
    const attribution = resolveAttribution();
    const eventId = `lead_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    // Tag the session as soon as attribution resolves, so you can filter
    // recordings in the Clarity dashboard by traffic source (e.g. just
    // Instagram vs. just Facebook sessions).
    Clarity.setTag("utm_source", attribution.utm_source ?? "direct");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          firstName,
          lastName,
          email,
          phone: nationalPhone,
          attribution,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        throw new Error(data?.message || "API Route Failed");
      }

      // Only reachable once WebinarJam registration + fan-out have actually
      // succeeded server-side. This is the real "Lead" moment.
      await reportLeadToMeta({ firstName, lastName, email, e164Digits, eventId, attribution });

      Clarity.event("registration_succeeded");

      if (onSuccess) onSuccess();
      router.push("/see-you");
    } catch (error) {
      console.error("Registration Error:", error);

      Clarity.event("registration_failed");
      Clarity.setTag(
        "registration_failure_reason",
        error instanceof Error ? error.message : "Unknown Error"
      );

      alert("Wystąpił problem z zapisem. Spróbuj ponownie.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className={`w-full max-w-[22rem] sm:max-w-[24rem] rounded-2xl border-2 border-[#ea580c] ring-4 ring-[#ea580c]/10 bg-white p-4 sm:p-5 shadow-[0_12px_36px_-6px_rgba(234,88,12,0.22),0_4px_16px_rgba(0,0,0,0.04)] ${className}`}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <input
            required
            type="text"
            autoComplete="name"
            placeholder="Imię"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={isSubmitting}
            className="h-11 w-full rounded-xl border border-neutral-300 bg-neutral-50/50 px-3.5 text-[16px] text-neutral-900 placeholder:text-neutral-400 focus:border-[#ea580c] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ea580c]/15 sm:text-sm"
          />
          <input
            required
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="Adres e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
            className="h-11 w-full rounded-xl border border-neutral-300 bg-neutral-50/50 px-3.5 text-[16px] text-neutral-900 placeholder:text-neutral-400 focus:border-[#ea580c] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ea580c]/15 sm:text-sm"
          />
          <input
            required
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="Numer telefonu"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={isSubmitting}
            className="h-11 w-full rounded-xl border border-neutral-300 bg-neutral-50/50 px-3.5 text-[16px] text-neutral-900 placeholder:text-neutral-400 focus:border-[#ea580c] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ea580c]/15 sm:text-sm"
          />
        </div>

        <div className="pt-1">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="!h-16 w-full rounded-xl !border-none !bg-[#ea580c] !px-4 text-lg font-extrabold uppercase tracking-normal text-white shadow-[0_8px_24px_-4px_rgba(234,88,12,0.45)] transition-colors hover:!bg-[#c2410c] active:scale-[0.99] disabled:opacity-70 sm:!h-[4.5rem] sm:text-xl"
          >
            {isSubmitting ? "REZERWUJĘ..." : "UMÓW KONSULTACJĘ"}
          </Button>

          <div className="mt-2.5 flex items-center justify-center gap-1.5 text-[11px] font-medium text-neutral-400">
            Umów spotkanie z ekspertem. Rozmowa odbędzie się przez Google Meet.
          </div>
        </div>
      </form>
    </div>
  );
}