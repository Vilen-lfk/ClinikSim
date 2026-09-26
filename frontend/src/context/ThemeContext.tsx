import { createContext, ReactNode, useContext, useLayoutEffect, useState } from "react";
import { ACCENT_PRESETS, DEFAULT_ACCENT, type AccentKey } from "../constants/accents";

type Theme = "light" | "dark" | "system";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
  accent: AccentKey;
  setAccent: (a: AccentKey) => void;
  resolvedDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);
const THEME_KEY = "theme";
const ACCENT_KEY = "accent";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem(THEME_KEY) as Theme) || "system");
  const [accent, setAccent] = useState<AccentKey>(
    () => (localStorage.getItem(ACCENT_KEY) as AccentKey) || DEFAULT_ACCENT,
  );
  const [resolvedDark, setResolvedDark] = useState(false);

  // Тема: определяем итоговый light/dark (в т.ч. при выборе "системная")
  useLayoutEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
    const root = document.documentElement;
    const apply = (isDark: boolean) => {
      root.setAttribute("data-theme", isDark ? "dark" : "light");
      setResolvedDark(isDark);
    };
    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      apply(mq.matches);
      const listener = (e: MediaQueryListEvent) => apply(e.matches);
      mq.addEventListener("change", listener);
      return () => mq.removeEventListener("change", listener);
    }
    apply(theme === "dark");
  }, [theme]);

  // Акцент: подставляем CSS-переменные под выбранный пресет и текущую тему.
  // Фон страницы, фон карточек/боковой панели и границы получают лёгкий оттенок акцента,
  // а не сплошную заливку — так текст остаётся читаемым в любой палитре.
  useLayoutEffect(() => {
    localStorage.setItem(ACCENT_KEY, accent);
    const preset = ACCENT_PRESETS.find((p) => p.key === accent) ?? ACCENT_PRESETS[0];
    const v = resolvedDark ? preset.dark : preset.light;
    const style = document.documentElement.style;
    style.setProperty("--color-teal", v.base);
    style.setProperty("--color-teal-dark", v.hover);
    style.setProperty("--color-teal-light", v.tint);
    style.setProperty("--color-paper", v.paper);
    style.setProperty("--color-card", v.card);
    style.setProperty("--color-line", v.line);
  }, [accent, resolvedDark]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, accent, setAccent, resolvedDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme должен использоваться внутри ThemeProvider");
  return ctx;
}