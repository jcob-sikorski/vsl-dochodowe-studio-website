"use client";

/* -------------------------------------------------------------------------- *
 * src/components/register-form.tsx
 *
 * Submits to /api/register, which is the only thing that writes to GoHighLevel
 * and the only thing that sends the Meta "SubmitApplication" conversion.
 *
 * The browser fires its own SubmitApplication with the SAME eventID the server
 * used, so Meta deduplicates the pair into one conversion.
 * -------------------------------------------------------------------------- */

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { META_PIXEL_ID, makeEventId } from "@/components/facebook-pixel";
import { resolveAttribution } from "@/lib/attribution";
import { normalizePhone } from "@/lib/phone";
import { isValidEmail, splitName } from "@/lib/validation";
import { CTA_LABEL, CTA_MICROCOPY } from "@/lib/narrative";
import { track } from "@/lib/track";

/* ---------- Microsoft Clarity, but never allowed to throw ----------------- */

import Clarity from "@microsoft/clarity";

function clarityEvent(name: string): void {
  try {
    Clarity?.event?.(name);
  } catch {
    /* Clarity not initialised / blocked by an extension — ignore. */
  }
}

function clarityTag(key: string, value: string): void {
  try {
    Clarity?.setTag?.(key, value);
  } catch {
    /* ignore */
  }
}

/* -------------------------------------------------------------------------- */

interface RegisterFormProps {
  className?: string;
  onSuccess?: (contactId?: string) => void;
  /** Where to send the visitor after a successful submission. */
  redirectTo?: string;
  /** Passed through to GHL tags + Meta content_category. */
  clientCategory?: string;
}

interface FieldErrors {
  fullName?: string;
  email?: string;
  phone?: string;
}

const INPUT_CLASS =
  "h-11 w-full rounded-xl border bg-neutral-50/50 px-3.5 text-[16px] text-neutral-900 " +
  "placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:ring-2 sm:text-sm " +
  "transition-colors disabled:opacity-60";

const INPUT_OK = "border-neutral-300 focus:border-[#ea580c] focus:ring-[#ea580c]/15";
const INPUT_BAD = "border-red-400 focus:border-red-500 focus:ring-red-500/15";

export function RegisterForm({
  className = "",
  onSuccess,
  redirectTo = "/materialy?zgloszenie=1",
  clientCategory = "Consultation Applicant",
}: RegisterFormProps) {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState(""); // honeypot — real users never see it
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formLoadedAt = useRef<number>(Date.now());
  const isMounted = useRef(true);
  const inFlight = useRef(false);

  useEffect(() => {
    formLoadedAt.current = Date.now();
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  /* ---------------- client-side validation --------------------------- */

  function validate(): FieldErrors {
    const next: FieldErrors = {};

    const name = fullName.trim();
    if (name.length < 2 || !/\p{L}/u.test(name)) {
      next.fullName = "Podaj swoje imię.";
    }

    if (!isValidEmail(email.trim().toLowerCase())) {
      next.email = "Podaj prawidłowy adres e-mail.";
    }

    if (!normalizePhone(phone)) {
      next.phone = "Podaj prawidłowy numer telefonu.";
    }

    return next;
  }

  /* ---------------- Meta browser event -------------------------------- */

  function fireBrowserSubmitApplication(args: {
    eventId: string;
    email: string;
    phoneDigits: string;
    firstName: string;
    lastName: string;
    countryCode?: string;
  }): void {
    if (typeof window === "undefined" || !window.fbq || !META_PIXEL_ID) return;

    // No traffic gate here. The server reports every conversion and this event
    // carries the same eventID, so Meta deduplicates the pair — suppressing the
    // browser half would only cost match quality on organic leads.
    try {
      // Re-init with Advanced Matching so the browser event carries the same
      // identifiers the server event does. Meta hashes these in the browser.
      window.fbq("init", META_PIXEL_ID, {
        em: args.email,
        ph: args.phoneDigits,
        fn: args.firstName.toLowerCase(),
        ln: args.lastName.toLowerCase(),
        // Only claim PL when the phone actually says so — the server applies
        // the same test, and a mismatched country hash weakens the match.
        ...(args.countryCode === "48" ? { country: "pl" } : {}),
        external_id: args.email,
      });

      window.fbq(
        "track",
        "SubmitApplication",
        { content_name: process.env.NEXT_PUBLIC_OFFER_NAME || "Konsultacja" },
        { eventID: args.eventId }
      );
    } catch (error) {
      console.error("[pixel] SubmitApplication failed:", error);
    }
  }

  /* ---------------- submit -------------------------------------------- */

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (isSubmitting || inFlight.current) return;

    setFormError(null);

    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      clarityEvent("register_validation_failed");
      return;
    }

    inFlight.current = true;
    setIsSubmitting(true);
    clarityEvent("register_button_clicked");

    const trimmedName = fullName.trim().replace(/\s+/g, " ");
    const { firstName, lastName } = splitName(trimmedName);
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = normalizePhone(phone);

    let attribution;
    try {
      attribution = resolveAttribution();
    } catch {
      attribution = {};
    }

    clarityTag("utm_source", attribution?.utm_source ?? "direct");
    if (attribution?.utm_campaign) clarityTag("utm_campaign", attribution.utm_campaign);

    const eventId = makeEventId("sa");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20_000);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          fullName: trimmedName,
          firstName,
          lastName,
          email: normalizedEmail,
          phone: normalizedPhone?.e164 ?? phone,
          attribution,
          eventId,
          sourceUrl: window.location.href,
          clientCategory,
          company, // honeypot
          formLoadedAt: formLoadedAt.current,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        throw new Error(data?.message || "Nie udało się wysłać zgłoszenia.");
      }

      // Mirror the server's conversion in the browser, sharing its eventID.
      fireBrowserSubmitApplication({
        eventId: data.eventId || eventId,
        email: normalizedEmail,
        phoneDigits: normalizedPhone?.digits ?? "",
        firstName,
        lastName,
        countryCode: normalizedPhone?.countryCode,
      });

      clarityEvent("registration_succeeded");
      track("form_submitted", { once: true });

      onSuccess?.(data.contactId);
      router.push(data.redirectTo || redirectTo);
    } catch (error) {
      const aborted = error instanceof DOMException && error.name === "AbortError";
      const message = aborted
        ? "Przekroczono czas oczekiwania. Spróbuj ponownie."
        : error instanceof Error
          ? error.message
          : "Wystąpił problem z zapisem. Spróbuj ponownie.";

      console.error("[register] submission failed:", error);
      clarityEvent("registration_failed");
      clarityTag("registration_failure_reason", aborted ? "timeout" : message.slice(0, 120));

      if (isMounted.current) setFormError(message);
    } finally {
      clearTimeout(timeout);
      inFlight.current = false;
      if (isMounted.current) setIsSubmitting(false);
    }
  }

  /* ---------------- render --------------------------------------------- */

  return (
    <div
      className={`w-full max-w-[22rem] sm:max-w-[24rem] rounded-2xl border-2 border-[#ea580c] ring-4 ring-[#ea580c]/10 bg-white p-4 sm:p-5 shadow-[0_12px_36px_-6px_rgba(234,88,12,0.22),0_4px_16px_rgba(0,0,0,0.04)] ${className}`}
    >
      <form
        onSubmit={handleSubmit}
        onFocusCapture={() => track("form_started", { once: true })}
        noValidate
        className="flex flex-col gap-3"
      >
        {/* Honeypot: hidden from humans, irresistible to bots. */}
        <div aria-hidden="true" className="absolute h-0 w-0 overflow-hidden opacity-0">
          <label htmlFor="company">Nazwa firmy</label>
          <input
            id="company"
            name="company"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <div>
            <input
              required
              type="text"
              name="fullName"
              autoComplete="name"
              placeholder="Imię"
              aria-invalid={Boolean(errors.fullName)}
              aria-describedby={errors.fullName ? "err-fullName" : undefined}
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: undefined }));
              }}
              disabled={isSubmitting}
              className={`${INPUT_CLASS} ${errors.fullName ? INPUT_BAD : INPUT_OK}`}
            />
            {errors.fullName && (
              <p id="err-fullName" className="mt-1 text-[11px] font-medium text-red-600">
                {errors.fullName}
              </p>
            )}
          </div>

          <div>
            <input
              required
              type="email"
              name="email"
              inputMode="email"
              autoComplete="email"
              placeholder="Adres e-mail"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "err-email" : undefined}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              disabled={isSubmitting}
              className={`${INPUT_CLASS} ${errors.email ? INPUT_BAD : INPUT_OK}`}
            />
            {errors.email && (
              <p id="err-email" className="mt-1 text-[11px] font-medium text-red-600">
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <input
              required
              type="tel"
              name="phone"
              inputMode="tel"
              autoComplete="tel"
              placeholder="Numer telefonu"
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={errors.phone ? "err-phone" : undefined}
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
              }}
              disabled={isSubmitting}
              className={`${INPUT_CLASS} ${errors.phone ? INPUT_BAD : INPUT_OK}`}
            />
            {errors.phone && (
              <p id="err-phone" className="mt-1 text-[11px] font-medium text-red-600">
                {errors.phone}
              </p>
            )}
          </div>
        </div>

        {formError && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-[12px] font-medium text-red-700">
            {formError}
          </p>
        )}

        <div className="pt-1">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="!h-16 w-full rounded-xl !border-none !bg-[#ea580c] !px-4 text-lg font-extrabold uppercase tracking-normal text-white shadow-[0_8px_24px_-4px_rgba(234,88,12,0.45)] transition-colors hover:!bg-[#c2410c] active:scale-[0.99] disabled:opacity-70 sm:!h-[4.5rem] sm:text-xl"
          >
            {isSubmitting ? "WYSYŁAM..." : CTA_LABEL}
          </Button>

          <div className="mt-2.5 flex items-center justify-center gap-1.5 text-center text-[11px] font-medium text-neutral-400">
            {CTA_MICROCOPY}
          </div>
        </div>
      </form>
    </div>
  );
}

export default RegisterForm;
