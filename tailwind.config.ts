import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "oklch(0.97 0.008 248)",
          100: "oklch(0.94 0.015 248)",
          200: "oklch(0.88 0.025 248)",
          300: "oklch(0.78 0.045 248)",
          400: "oklch(0.65 0.08 248)",
          500: "oklch(0.55 0.12 248)",
          600: "oklch(0.45 0.15 248)",
          700: "oklch(0.35 0.12 248)",
          800: "oklch(0.25 0.08 248)",
          900: "oklch(0.18 0.05 248)",
          950: "oklch(0.12 0.03 248)",
        },
        accent: {
          50: "oklch(0.96 0.02 285)",
          100: "oklch(0.92 0.04 285)",
          200: "oklch(0.85 0.08 285)",
          300: "oklch(0.75 0.12 285)",
          400: "oklch(0.65 0.18 285)",
          500: "oklch(0.58 0.22 285)",
          600: "oklch(0.48 0.25 285)",
          700: "oklch(0.38 0.20 285)",
          800: "oklch(0.28 0.15 285)",
          900: "oklch(0.20 0.10 285)",
        },
        neutral: {
          50: "oklch(0.985 0.002 248)",
          100: "oklch(0.96 0.003 248)",
          200: "oklch(0.92 0.004 248)",
          300: "oklch(0.85 0.005 248)",
          400: "oklch(0.70 0.006 248)",
          500: "oklch(0.55 0.007 248)",
          600: "oklch(0.42 0.008 248)",
          700: "oklch(0.32 0.006 248)",
          800: "oklch(0.22 0.004 248)",
          900: "oklch(0.15 0.003 248)",
          950: "oklch(0.10 0.002 248)",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;