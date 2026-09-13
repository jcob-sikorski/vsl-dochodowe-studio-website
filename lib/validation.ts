/* -------------------------------------------------------------------------- *
 * src/lib/validation.ts
 *
 * Zero-dependency validation for the registration payload.
 * The server NEVER trusts the client: everything is re-validated here.
 * -------------------------------------------------------------------------- */

import { normalizeAttribution, type Attribution } from "./attribution";
import { normalizePhone, type NormalizedPhone } from "./phone";

export interface FieldError {
  field: string;
  message: string;
}

export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; errors: FieldError[] };

export interface RegistrationInput {
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: NormalizedPhone;
  attribution: Attribution;
  /** Deduplication ID shared between the browser pixel and the CAPI event. */
  eventId: string;
  /** Page the form was submitted from — used as event_source_url. */
  sourceUrl?: string;
  clientCategory?: string;
  /** Honeypot hit — process nothing, but answer like a success. */
  isBot: boolean;
}

const MAX_NAME_LEN = 100;
const MAX_EMAIL_LEN = 254;
const EMAIL_RE =
  /^[A-Za-z0-9._%+'-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;

const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com",
  "guerrillamail.com",
  "10minutemail.com",
  "tempmail.com",
  "yopmail.com",
  "trashmail.com",
  "sharklasers.com",
  "getnada.com",
  "dropmail.me",
]);

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export function collapseWhitespace(value: string): string {
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim();
}

export function isValidEmail(email: string): boolean {
  if (!email || email.length > MAX_EMAIL_LEN) return false;
  if (email.includes("..")) return false;
  if (!EMAIL_RE.test(email)) return false;
  const domain = email.split("@")[1]?.toLowerCase() ?? "";
  const tld = domain.split(".").pop() ?? "";
  return tld.length >= 2 && !/^\d+$/.test(tld);
}

export function isDisposableEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  return !!domain && DISPOSABLE_DOMAINS.has(domain);
}

/** "Jan Maria Kowalski" -> { firstName: "Jan", lastName: "Maria Kowalski" } */
export function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = collapseWhitespace(fullName).split(" ").filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

function looksLikeAName(value: string): boolean {
  if (value.length < 2 || value.length > MAX_NAME_LEN) return false;
  if (!/\p{L}/u.test(value)) return false;          // must contain a letter
  if (/https?:\/\//i.test(value)) return false;      // spam
  if (/[<>{}[\]\\]/.test(value)) return false;       // markup / injection attempts
  return true;
}

/**
 * Validates and normalises the raw JSON body of POST /api/register.
 * Also evaluates the two bot traps (`company` honeypot + submit speed).
 */
export function parseRegistrationInput(raw: unknown): ValidationResult<RegistrationInput> {
  const errors: FieldError[] = [];

  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { ok: false, errors: [{ field: "body", message: "Nieprawidłowe dane formularza." }] };
  }

  const body = raw as Record<string, unknown>;

  /* ---------- honeypot / timing -------------------------------------- */
  const honeypot = collapseWhitespace(asString(body.company));
  const loadedAt = Number(body.formLoadedAt);
  const filledTooFast =
    Number.isFinite(loadedAt) && loadedAt > 0 && Date.now() - loadedAt < 1_200;
  const isBot = honeypot.length > 0 || filledTooFast;

  /* ---------- name ---------------------------------------------------- */
  let fullName = collapseWhitespace(asString(body.fullName));
  let firstName = collapseWhitespace(asString(body.firstName));
  let lastName = collapseWhitespace(asString(body.lastName));

  if (!fullName && (firstName || lastName)) {
    fullName = collapseWhitespace(`${firstName} ${lastName}`);
  }
  if (fullName && !firstName) {
    const split = splitName(fullName);
    firstName = split.firstName;
    lastName = split.lastName;
  }

  fullName = fullName.slice(0, MAX_NAME_LEN);
  firstName = firstName.slice(0, MAX_NAME_LEN);
  lastName = lastName.slice(0, MAX_NAME_LEN);

  if (!looksLikeAName(fullName) || !firstName) {
    errors.push({ field: "fullName", message: "Podaj swoje imię." });
  }

  /* ---------- email ---------------------------------------------------- */
  const email = collapseWhitespace(asString(body.email)).toLowerCase();
  if (!isValidEmail(email)) {
    errors.push({ field: "email", message: "Podaj prawidłowy adres e-mail." });
  } else if (isDisposableEmail(email)) {
    errors.push({ field: "email", message: "Użyj stałego adresu e-mail." });
  }

  /* ---------- phone ---------------------------------------------------- */
  const phone = normalizePhone(body.phone);
  if (!phone) {
    errors.push({ field: "phone", message: "Podaj prawidłowy numer telefonu." });
  }

  /* ---------- meta ----------------------------------------------------- */
  const attribution = normalizeAttribution(body.attribution);

  const rawEventId = collapseWhitespace(asString(body.eventId)).slice(0, 64);
  const eventId = /^[A-Za-z0-9_-]{8,64}$/.test(rawEventId) ? rawEventId : "";

  const sourceUrl = sanitizeUrl(asString(body.sourceUrl));
  const clientCategory =
    collapseWhitespace(asString(body.clientCategory)).slice(0, 100) || undefined;

  if (errors.length > 0) return { ok: false, errors };

  return {
    ok: true,
    value: {
      fullName,
      firstName,
      lastName,
      email,
      phone: phone as NormalizedPhone,
      attribution,
      eventId,
      sourceUrl,
      clientCategory,
      isBot,
    },
  };
}

/** Only http(s) URLs survive — blocks javascript: and data: payloads. */
export function sanitizeUrl(value: string, maxLen = 1_000): string | undefined {
  const trimmed = collapseWhitespace(value);
  if (!trimmed) return undefined;
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "http:" && url.protocol !== "https:") return undefined;
    return url.toString().slice(0, maxLen);
  } catch {
    return undefined;
  }
}
