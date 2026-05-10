import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#2a0d18",
          soft: "#6c4453",
        },
        blush: {
          50: "#fff5f7",
          100: "#ffe8ee",
          200: "#fcd4dd",
          300: "#f8b6c5",
          400: "#f48aa3",
          500: "#ec5e84",
          600: "#d83a6a",
          700: "#b51e51",
          800: "#8a1640",
          900: "#5e0d2c",
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Fraunces", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 6px 24px -8px rgba(228, 60, 110, 0.18)",
        glow: "0 12px 40px -10px rgba(228, 60, 110, 0.45)",
      },
    },
  },
  plugins: [],
} satisfies Config;
