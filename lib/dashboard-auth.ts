/* -------------------------------------------------------------------------- *
 * lib/dashboard-auth.ts
 *
 * HTTP Basic Auth check for the dashboard, shared by middleware.ts (which
 * guards the page) and the dashboard's server actions (which must check again:
 * a server action can be POSTed to from any route, not only /dashboard).
 *
 * Edge-safe: no Node APIs, so middleware can import it.
 *
 * Set DASHBOARD_USER and DASHBOARD_PASSWORD. If either is missing the check
 * returns "not_configured" and callers fail closed.
 * -------------------------------------------------------------------------- */

export type DashboardAuth = "ok" | "unauthorized" | "not_configured";

export function checkDashboardAuth(authorizationHeader: string | null | undefined): DashboardAuth {
  const user = (process.env.DASHBOARD_USER || "").trim();
  const password = (process.env.DASHBOARD_PASSWORD || "").trim();
  if (!user || !password) return "not_configured";

  const match = /^Basic\s+(.+)$/i.exec((authorizationHeader ?? "").trim());
  if (!match) return "unauthorized";

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

  return userOk && passwordOk ? "ok" : "unauthorized";
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
