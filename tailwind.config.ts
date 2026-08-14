import type { Config } from "tailwindcss";

// Design tokens - the "ledger" system.
// A business's trust in this product rests on billing/usage being legible at a glance,
// so the palette and type scale are built around that, not a generic dashboard look.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#14213D", // primary text, dark surfaces
        "ink-muted": "#5B6478", // secondary text
        paper: "#FBF9F4", // warm off-white background
        line: "#E4DFD3", // hairline borders on paper
        gold: "#C98A2B", // commerce accent - CTAs, active states, money
        "gold-dim": "#F1E2C6",
        teal: "#1B6E67", // calm accent - success, AI-handled states
        "teal-dim": "#DCEAE8",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "16px",
      },
    },
  },
  plugins: [],
};

export default config;
