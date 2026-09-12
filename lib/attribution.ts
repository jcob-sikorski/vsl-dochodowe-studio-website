const STORAGE_KEY = "ds_attribution";
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;

export interface Attribution {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  fbclid?: string;
  landing_url?: string;
  captured_at?: string;
}

// Reads UTMs/fbclid straight off the current URL — no cookies involved.
// Called on every page mount and again right before form submission, so a
// live ad click always wins even if localStorage got cleared mid-session.
export function captureAttributionFromUrl(): Attribution | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);

  const incoming: Attribution = {};
  let hasAny = false;

  for (const key of UTM_KEYS) {
    const val = params.get(key);
    if (val) {
      incoming[key] = val;
      hasAny = true;
    }
  }

  const fbclid = params.get("fbclid");
  if (fbclid) {
    incoming.fbclid = fbclid;
    hasAny = true;
  }

  if (!hasAny) return null;

  incoming.landing_url = window.location.pathname + window.location.search;
  incoming.captured_at = new Date().toISOString();

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(incoming));
  } catch {
    // Storage blocked (private mode, extension) — still return the value for
    // THIS submission, it just won't survive a reload or later visit.
  }

  return incoming;
}

export function getStoredAttribution(): Attribution {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

// Prefer whatever's live in the current URL; fall back to earlier-in-visit storage.
export function resolveAttribution(): Attribution {
  return captureAttributionFromUrl() ?? getStoredAttribution();
}

// Meta's documented format for constructing fbc yourself when you have
// fbclid but not the _fbc cookie: fb.<subdomain_index>.<creation_time_ms>.<fbclid>
// subdomain_index is 1 for a standard apex/www domain.
export function buildFbcFromClickId(fbclid: string, capturedAtIso?: string): string {
  const timestamp = capturedAtIso ? new Date(capturedAtIso).getTime() : Date.now();
  return `fb.1.${timestamp}.${fbclid}`;
}