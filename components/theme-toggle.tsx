"use client";

/* -------------------------------------------------------------------------- *
 * components/theme-toggle.tsx
 *
 * Light/dark switch for the dashboard.
 *
 * Writes `data-theme` on <html>, which the dashboard's scoped CSS keys off.
 * Three states matter, not two: no stored choice means "follow the OS", and an
 * explicit choice must beat the OS in BOTH directions — hence the stamp is an
 * attribute rather than a class, and the CSS guards the media query with
 * :not([data-theme="light"]).
 *
 * Every storage access is wrapped: localStorage throws outright in some private
 * modes, and a theme button is never worth breaking the page over.
 * -------------------------------------------------------------------------- */

import { useEffect, useState } from "react";

const KEY = "ds-theme";
type Theme = "light" | "dark";

function systemTheme(): Theme {
  try {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  } catch {
    return "light";
  }
}

function stored(): Theme | null {
  try {
    const v = localStorage.getItem(KEY);
    return v === "light" || v === "dark" ? v : null;
  } catch {
    return null;
  }
}

export function ThemeToggle() {
  // Starts undefined so the server and the first client render agree; the
  // effect below fills it in. Rendering a guessed icon would hydrate-mismatch.
  const [theme, setTheme] = useState<Theme | undefined>(undefined);

  useEffect(() => {
    setTheme(stored() ?? systemTheme());
  }, []);

  function toggle() {
    const next: Theme = (theme ?? systemTheme()) === "dark" ? "light" : "dark";
    setTheme(next);
    try {
      document.documentElement.setAttribute("data-theme", next);
    } catch {
      /* nothing sensible to do */
    }
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* choice just won't survive a reload */
    }
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      className="themebtn"
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Light theme" : "Dark theme"}
    >
      <span className="themebtn-icon" aria-hidden="true">
        {theme === undefined ? null : isDark ? (
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none"
               stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none"
               stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
          </svg>
        )}
      </span>
    </button>
  );
}

export default ThemeToggle;
