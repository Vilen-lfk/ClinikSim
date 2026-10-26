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
        // Ключ "serif" сохранён по всему проекту ради className="font-serif" на заголовках,
        // но теперь указывает на геометрический гротеск без засечек — не на классическую антикву.
        serif: ['"Manrope"', '"Inter"', "system-ui", "sans-serif"],
        sans: ['"Inter"', "system-ui", "sans-serif"],
        mono: ['"IBM Plex Mono"', "monospace"],
      },
      boxShadow: {
        glow: "0 8px 28px -6px rgb(var(--color-teal) / 0.5)",
        "glow-lg": "0 16px 40px -8px rgb(var(--color-teal) / 0.55)",
        btn: "inset 0 1px 0 rgb(255 255 255 / 0.25), 0 1px 2px rgb(0 0 0 / 0.2), 0 6px 18px -8px rgb(var(--color-teal) / 0.7)",
        "btn-hover": "inset 0 1px 0 rgb(255 255 255 / 0.3), 0 1px 2px rgb(0 0 0 / 0.2), 0 10px 26px -8px rgb(var(--color-teal) / 0.8)",
        "glow-ring": "0 0 0 1px rgb(var(--color-teal) / 0.25), 0 8px 24px -8px rgb(var(--color-teal) / 0.4)",
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