/* -------------------------------------------------------------------------- *
 * src/lib/phone.ts
 *
 * Isomorphic phone normalisation (safe on both client and server).
 * Default country is Poland (+48), but a caller-supplied international number
 * (+44…, 0044…, etc.) is preserved instead of being mangled into a PL number.
 * -------------------------------------------------------------------------- */

export interface NormalizedPhone {
  /** "+48500123456" — what GoHighLevel wants. */
  e164: string;
  /** "48500123456" — digits only, what Meta CAPI wants before hashing. */
  digits: string;
  /** "500123456" — subscriber number without the country code. */
  national: string;
  /** "48" */
  countryCode: string;
}

const DEFAULT_COUNTRY_CODE = "48";

/** Country codes we know the exact national length for. */
const NATIONAL_LENGTH: Record<string, number> = {
  "48": 9, // PL
};

/**
 * Accepts anything a human might type: "500 123 456", "+48 500-123-456",
 * "0048500123456", "48500123456", "(+48) 500 123 456".
 * Returns null when the input cannot be a real phone number.
 */
export function normalizePhone(
  raw: unknown,
  defaultCountryCode: string = DEFAULT_COUNTRY_CODE
): NormalizedPhone | null {
  if (typeof raw !== "string") return null;

  const trimmed = raw.trim();
  if (!trimmed) return null;

  // Keep a leading "+" (or a leading "00", which means the same thing).
  const hasPlus = trimmed.startsWith("+") || /^\s*00\d/.test(trimmed);

  let digits = trimmed.replace(/\D/g, "");
  if (!digits) return null;

  if (digits.startsWith("00")) digits = digits.slice(2);

  let countryCode: string;
  let national: string;

  if (hasPlus) {
    // Explicit international form — trust the country code the user gave us.
    if (digits.startsWith(defaultCountryCode)) {
      countryCode = defaultCountryCode;
      national = digits.slice(defaultCountryCode.length);
    } else {
      // Best-effort split for unknown countries: 1–3 digit country code.
      countryCode = digits.slice(0, guessCountryCodeLength(digits));
      national = digits.slice(countryCode.length);
    }
  } else {
    const expected = NATIONAL_LENGTH[defaultCountryCode];

    // Polish users often write a leading trunk "0" — drop it.
    if (defaultCountryCode === "48" && digits.length === 10 && digits.startsWith("0")) {
      digits = digits.slice(1);
    }

    if (expected && digits.length === expected) {
      countryCode = defaultCountryCode;
      national = digits;
    } else if (digits.startsWith(defaultCountryCode) && (!expected || digits.length === defaultCountryCode.length + expected)) {
      countryCode = defaultCountryCode;
      national = digits.slice(defaultCountryCode.length);
    } else {
      // No plus, unexpected length — assume it already carries a country code.
      countryCode = digits.slice(0, guessCountryCodeLength(digits));
      national = digits.slice(countryCode.length);
    }
  }

  if (!countryCode || !national) return null;

  const expected = NATIONAL_LENGTH[countryCode];
  if (expected) {
    if (national.length !== expected) return null;
    if (national.startsWith("0")) return null;
  } else if (national.length < 5 || national.length > 14) {
    return null;
  }

  const full = `${countryCode}${national}`;
  if (full.length < 8 || full.length > 15) return null;
  if (/^(\d)\1+$/.test(national)) return null; // 000000000, 111111111, …

  return {
    e164: `+${full}`,
    digits: full,
    national,
    countryCode,
  };
}

function guessCountryCodeLength(digits: string): number {
  // 1 = NANP/RU-ish, 7 = RU/KZ; everything else in practice is 2–3.
  if (digits.startsWith("1") || digits.startsWith("7")) return 1;
  if (/^(2[0-9]|3[0-469]|4[013-9]|5[1-8]|6[0-6]|8[1246]|9[0-58])/.test(digits)) return 2;
  return 3;
}
