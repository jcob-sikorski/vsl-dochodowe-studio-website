/* -------------------------------------------------------------------------- *
 * src/middleware.ts
 *
 * Two unrelated jobs, one file, because Next allows exactly one middleware:
 *
 *   /            → assigns the headline A/B variant (see lib/ab.ts)
 *   /dashboard/* → HTTP Basic Auth
 *
 * Why the split test runs HERE and not in the page: the variant has to be
 * decided before a single byte of HTML is streamed. Deciding it in the browser
 * would flash the control headline and then swap it — which both looks broken
 * and contaminates the measurement, since some visitors would read A and be
 * counted as B.
 * -------------------------------------------------------------------------- */

import { NextResponse, type NextRequest } from "next/server";

import {
  AB_COOKIE_MAX_AGE,
  AB_FORCE_PARAM,
  AB_VARIANT_COOKIE,
  AB_VISITOR_COOKIE,
  HEADLINE_EXPERIMENT,
  isValidVisitorId,
  newVisitorId,
  parseVariantCookie,
  pickVariantId,
  serializeVariantCookie,
} from "@/lib/ab";

export const config = {
  matcher: ["/", "/dashboard/:path*"],
};

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    return dashboardAuth(request);
  }

  return assignExperiment(request);
}

/* -------------------------------------------------------------------------- *
 * A/B assignment
 * -------------------------------------------------------------------------- */

function assignExperiment(request: NextRequest) {
  const experiment = HEADLINE_EXPERIMENT;

  const existingVariant = parseVariantCookie(
    request.cookies.get(AB_VARIANT_COOKIE)?.value,
    experiment
  );

  // ?ab=b previews a variant and re-pins the cookie to it. Useful for checking
  // copy; keep it out of ad URLs or you will bias the split.
  const forced = request.nextUrl.searchParams.get(AB_FORCE_PARAM);
  const forcedVariant = experiment.variants.some((v) => v.id === forced) ? forced : null;

  const variantId = forcedVariant ?? existingVariant ?? pickVariantId(experiment);

  const existingVisitor = request.cookies.get(AB_VISITOR_COOKIE)?.value;
  const visitorId = isValidVisitorId(existingVisitor) ? existingVisitor : newVisitorId();

  const variantCookie = serializeVariantCookie(variantId, experiment);

  // The page is a server component: it reads these cookies off the REQUEST, so
  // on a visitor's very first hit they must be injected into the request too,
  // not only set on the response. Without this the first pageview always
  // renders the control while the cookie says otherwise.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(
    "cookie",
    withCookies(requestHeaders.get("cookie") ?? "", {
      [AB_VARIANT_COOKIE]: variantCookie,
      [AB_VISITOR_COOKIE]: visitorId,
    })
  );

  const response = NextResponse.next({ request: { headers: requestHeaders } });

  const options = {
    path: "/",
    maxAge: AB_COOKIE_MAX_AGE,
    sameSite: "lax" as const,
    // Readable by the browser on purpose: the beacon de-duplicates on the
    // visitor id, and Clarity/GTM can segment sessions by variant. Neither
    // cookie carries anything private — the variant is literally on screen.
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
  };

  response.cookies.set(AB_VARIANT_COOKIE, variantCookie, options);
  response.cookies.set(AB_VISITOR_COOKIE, visitorId, options);

  // Different HTML per cookie value — say so, or a shared cache could serve
  // one visitor's variant to everyone.
  response.headers.set("Vary", "Cookie");

  return response;
}

/** Rewrites a Cookie header with the given names replaced or appended. */
function withCookies(header: string, values: Record<string, string>): string {
  const kept = header
    .split(";")
    .map((part) => part.trim())
    .filter((part) => {
      if (!part) return false;
      const name = part.slice(0, part.indexOf("=")).trim();
      return !(name in values);
    });

  for (const [name, value] of Object.entries(values)) {
    kept.push(`${name}=${value}`);
  }

  return kept.join("; ");
}

/* -------------------------------------------------------------------------- *
 * Dashboard Basic Auth
 *
 * The page shows lead-level PII and spend, so it must never be publicly
 * readable — and a URL with no auth WILL eventually end up pasted into a chat
 * or indexed.
 *
 * Set DASHBOARD_USER and DASHBOARD_PASSWORD. If either is missing the
 * dashboard returns 503 rather than falling open.
 * -------------------------------------------------------------------------- */

function dashboardAuth(request: NextRequest) {
  const user = (process.env.DASHBOARD_USER || "").trim();
  const password = (process.env.DASHBOARD_PASSWORD || "").trim();

  if (!user || !password) {
    return new NextResponse("Dashboard not configured.", {
      status: 503,
      headers: { "Content-Type": "text/plain" },
    });
  }

  const header = request.headers.get("authorization") ?? "";
  const match = /^Basic\s+(.+)$/i.exec(header.trim());

  if (match) {
    let decoded = "";
    try {
      decoded = atob(match[1]);
    } catch {
      decoded = "";
    }

    const separator = decoded.indexOf(":");
    const givenUser = separator === -1 ? "" : decoded.slice(0, separator);
    const givenPassword = separator === -1 ? "" : decoded.slice(separator + 1);

    // Constant-time-ish: compare both halves regardless of the first result, so
    // a wrong username and a wrong password take the same path.
    const userOk = safeEqual(givenUser, user);
    const passwordOk = safeEqual(givenPassword, password);

    if (userOk && passwordOk) return NextResponse.next();
  }

  return new NextResponse("Authentication required.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Dochodowe Studio funnel", charset="UTF-8"',
      "Content-Type": "text/plain",
    },
  });
}

/** Length-independent comparison. Edge runtime has no crypto.timingSafeEqual. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    // Still walk a fixed number of characters so length isn't a timing oracle.
    let sink = 0;
    for (let i = 0; i < b.length; i++) sink |= b.charCodeAt(i);
    return sink === -1;
  }

  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
