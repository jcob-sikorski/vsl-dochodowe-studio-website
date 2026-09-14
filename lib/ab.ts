/* -------------------------------------------------------------------------- *
 * src/lib/ab.ts
 *
 * The headline split test, in one file.
 *
 * Everything you will ever want to edit lives in HEADLINE_EXPERIMENT below:
 * the variants, their copy, and how traffic is divided between them. The rest
 * of the file is plumbing that never needs touching.
 *
 * Design rules this encodes:
 *
 *   - Assignment happens ONCE per browser, in middleware, and is stored in a
 *     cookie. The same visitor always sees the same headline — otherwise a
 *     reload could show them a different promise and the numbers would be
 *     measuring nothing.
 *   - The cookie carries the experiment id as well as the variant id. Bump
 *     `id` when you start a genuinely new test and every visitor is reshuffled
 *     automatically, with no stale assignments bleeding into fresh data.
 *   - Isomorphic and dependency-free: this module is imported by the Edge
 *     middleware, by server components and by the browser. Nothing here may
 *     touch node APIs.
 * -------------------------------------------------------------------------- */

/** Which variant this browser was assigned, as "<experimentId>:<variantId>". */
export const AB_VARIANT_COOKIE = "ds_ab";

/** Anonymous per-browser id. The denominator of the opt-in rate counts these. */
export const AB_VISITOR_COOKIE = "ds_vid";

/** `?ab=b` forces a variant — for previewing copy, not for traffic. */
export const AB_FORCE_PARAM = "ab";

/** 180 days. Long enough that a visitor who comes back weeks later is consistent. */
export const AB_COOKIE_MAX_AGE = 60 * 60 * 24 * 180;

export interface AbVariant {
  /** Stable, short, lowercase. This is what lands in Supabase. */
  id: string;
  /** Human label for the dashboard. */
  label: string;
  /** Relative share of traffic. Weights need not sum to 100. */
  weight: number;
  /**
   * The headline. Wrap the part you want underlined in [[double brackets]].
   * Exactly one pair, or none at all.
   */
  headline: string;
  /** Optional per-variant subheadline; falls back to the shared one. */
  subheadline?: string;
}

export interface AbExperiment {
  /** Bump this to start a fresh test — all assignments reset. */
  id: string;
  /** false = everyone sees the first variant and nothing is recorded. */
  enabled: boolean;
  /** Shared subheadline, used by any variant that doesn't override it. */
  subheadline: string;
  variants: AbVariant[];
}

/* ========================================================================== *
 *  EDIT BELOW THIS LINE
 * ========================================================================== */

export const HEADLINE_EXPERIMENT: AbExperiment = {
  id: "headline_2026_09",
  enabled: true,

  subheadline:
    "Dołącz do programu mentoringowego dla właścicieli studiów treningu personalnego.",

  variants: [
    {
      id: "control",
      label: "A — Gwarantowane 20–50 tys. zł",
      weight: 50,
      headline:
        "Studio treningu personalnego, które daje 20–50 tys. zł zysku miesięcznie — na 50 metrach, bez karnetów i bez Ciebie na sali",
    },
    {
      id: "b",
      label: "B — (do uzupełnienia)",
      weight: 50,
      // TODO: replace with the headline you want to test against the control.
      headline:
        "Przestań być najlepiej opłacanym pracownikiem własnego studia",
    },
  ],
};

/* ========================================================================== *
 *  EDIT ABOVE THIS LINE
 * ========================================================================== */

/** The variant everyone falls back to: a missing cookie must never blank the page. */
export function defaultVariant(experiment: AbExperiment = HEADLINE_EXPERIMENT): AbVariant {
  return experiment.variants[0];
}

export function getVariant(
  variantId: string | null | undefined,
  experiment: AbExperiment = HEADLINE_EXPERIMENT
): AbVariant {
  if (!variantId) return defaultVariant(experiment);
  return experiment.variants.find((v) => v.id === variantId) ?? defaultVariant(experiment);
}

/**
 * Weighted random pick. Math.random() is fine here: we are dividing traffic,
 * not generating secrets, and the cookie makes the result sticky per browser.
 */
export function pickVariantId(experiment: AbExperiment = HEADLINE_EXPERIMENT): string {
  if (!experiment.enabled) return defaultVariant(experiment).id;

  const variants = experiment.variants.filter((v) => v.weight > 0);
  if (variants.length === 0) return defaultVariant(experiment).id;

  const total = variants.reduce((sum, v) => sum + v.weight, 0);
  let roll = Math.random() * total;

  for (const variant of variants) {
    roll -= variant.weight;
    if (roll <= 0) return variant.id;
  }

  return variants[variants.length - 1].id;
}

/**
 * Reads "<experimentId>:<variantId>" and returns the variant id only when it
 * belongs to the CURRENT experiment and still exists. A renamed or deleted
 * variant therefore reassigns instead of silently reporting under a dead id.
 */
export function parseVariantCookie(
  value: string | null | undefined,
  experiment: AbExperiment = HEADLINE_EXPERIMENT
): string | null {
  if (!value) return null;

  const separator = value.indexOf(":");
  if (separator === -1) return null;

  const experimentId = value.slice(0, separator);
  const variantId = value.slice(separator + 1);

  if (experimentId !== experiment.id) return null;
  return experiment.variants.some((v) => v.id === variantId) ? variantId : null;
}

export function serializeVariantCookie(
  variantId: string,
  experiment: AbExperiment = HEADLINE_EXPERIMENT
): string {
  return `${experiment.id}:${variantId}`;
}

/** Visitor ids are opaque; we only ever check the shape before trusting one. */
export function isValidVisitorId(value: string | null | undefined): value is string {
  return typeof value === "string" && /^[A-Za-z0-9_-]{8,64}$/.test(value);
}

export function newVisitorId(): string {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID().replace(/-/g, "");
    }
  } catch {
    /* fall through */
  }
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 14)}`;
}

/* -------------------------------------------------------------------------- *
 * Headline rendering
 * -------------------------------------------------------------------------- */

export interface HeadlineSegment {
  text: string;
  underline: boolean;
}

/**
 * Splits "foo [[bar]] baz" into renderable segments. Unmatched brackets are
 * treated as plain text, so a typo in the config degrades to a normal headline
 * rather than printing brackets at a visitor.
 */
export function parseHeadline(headline: string): HeadlineSegment[] {
  const segments: HeadlineSegment[] = [];
  const pattern = /\[\[(.+?)\]\]/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(headline)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ text: headline.slice(lastIndex, match.index), underline: false });
    }
    segments.push({ text: match[1], underline: true });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < headline.length) {
    segments.push({ text: headline.slice(lastIndex), underline: false });
  }

  return segments.length > 0 ? segments : [{ text: headline, underline: false }];
}

/** The headline as plain text — for analytics tags and debugging. */
export function headlineText(variant: AbVariant): string {
  return variant.headline.replace(/\[\[|\]\]/g, "");
}
