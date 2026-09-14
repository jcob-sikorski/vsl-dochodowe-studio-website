/* -------------------------------------------------------------------------- *
 * src/middleware.ts
 *
 * HTTP Basic Auth on /dashboard. The page shows lead-level PII and spend, so
 * it must never be publicly readable — and a URL with no auth WILL eventually
 * end up pasted into a chat or indexed.
 *
 * Set DASHBOARD_USER and DASHBOARD_PASSWORD. If either is missing the
 * dashboard returns 503 rather than falling open.
 * -------------------------------------------------------------------------- */

import { NextResponse, type NextRequest } from "next/server";

export const config = {
  matcher: ["/dashboard/:path*"],
};

export function middleware(request: NextRequest) {
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
