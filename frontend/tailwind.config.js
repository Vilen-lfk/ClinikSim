/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "rgb(var(--color-paper) / <alpha-value>)",
        card: "rgb(var(--color-card) / <alpha-value>)",
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        line: "rgb(var(--color-line) / <alpha-value>)",
        teal: {
          DEFAULT: "rgb(var(--color-teal) / <alpha-value>)",
          dark: "rgb(var(--color-teal-dark) / <alpha-value>)",
          light: "rgb(var(--color-teal-light) / <alpha-value>)",
        },
        clay: {
          DEFAULT: "rgb(var(--color-clay) / <alpha-value>)",
          dark: "rgb(var(--color-clay-dark) / <alpha-value>)",
          light: "rgb(var(--color-clay-light) / <alpha-value>)",
        },
        gold: "rgb(var(--color-gold) / <alpha-value>)",
      },
      fontFamily: {
        serif: ['"Lora"', "Georgia", "serif"],
        sans: ['"Inter"', "system-ui", "sans-serif"],
        mono: ['"IBM Plex Mono"', "monospace"],
      },
      keyframes: {
        draw: { "0%": { strokeDashoffset: 900 }, "100%": { strokeDashoffset: 0 } },
        "draw-loop": { "0%": { strokeDashoffset: 120 }, "100%": { strokeDashoffset: 0 } },
      },
      animation: {
        draw: "draw 1.6s ease-out forwards",
        "draw-loop": "draw-loop 1.1s linear infinite",
      },
    },
  },
  plugins: [],
};