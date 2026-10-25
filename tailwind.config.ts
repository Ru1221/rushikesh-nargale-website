import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: { 950: "#050b18", 900: "#081226", 800: "#0c1b3a", 700: "#12295a", 600: "#1a3a78" },
        brand: { DEFAULT: "#2f80ff", dark: "#1d62d6" },
        cyan: { accent: "#22d3ee" },
      },
      fontFamily: { sans: ["var(--font-sans)", "system-ui", "sans-serif"], display: ["var(--font-display)", "var(--font-sans)", "system-ui", "sans-serif"] },
      boxShadow: { glow: "0 10px 40px -10px rgba(47,128,255,.45)" },
    },
  },
  plugins: [],
};
export default config;
