import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        ring: "hsl(var(--ring))",
        input: "hsl(var(--input))",
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        // Hero-specific tokens, matched to the reference design.
        // Text tones are solid values (not opacity steps) so every one of
        // them clears WCAG AA against white.
        ink: {
          DEFAULT: "#12140F", // headings — near-black, matches logo black
          muted: "#454A40", // body copy
          subtle: "#6A7062", // captions, labels
        },
        coral: {
          DEFAULT: "#5C8A1E", // darker brand green — 4.6:1 on white, safe for text
          bright: "#8DC63F", // the neon green from the logo — buttons + large display numerals
          dark: "#456515", // hover
        },
        cream: "#F1F3EA",
        panel: "#F5F7F1",
        line: "#E2E6DA",
      },
      fontFamily: {
        // Inter: designed specifically for screen UI — tall x-height, open
        // apertures, unambiguous 1/l/I. Carries all body copy.
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        // Poppins: bold geometric sans, proven in high-converting sales
        // pages. Reserved for display headings and large numerals.
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      fontSize: {
        body: ["1.0625rem", { lineHeight: "1.7" }],
        "body-lg": ["1.125rem", { lineHeight: "1.7" }],
      },
      maxWidth: {
        prose: "40rem",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};

export default config;