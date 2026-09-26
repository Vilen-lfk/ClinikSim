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

function systemPrefersDark(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

/** Атрибут data-theme и CSS-переменные акцента выставляются вместе, синхронно,
 *  чтобы текст (ink/muted, задан в CSS через [data-theme]) и фон/кнопки
 *  (paper/card/teal, задаются тут через JS) никогда не оказывались из разных тем. */
function applyTheme(isDark: boolean, accent: AccentKey) {
  const root = document.documentElement;
  root.setAttribute("data-theme", isDark ? "dark" : "light");

  const preset = ACCENT_PRESETS.find((p) => p.key === accent) ?? ACCENT_PRESETS[0];
  const v = isDark ? preset.dark : preset.light;
  const style = root.style;
  style.setProperty("--color-teal", v.base);
  style.setProperty("--color-teal-dark", v.hover);
  style.setProperty("--color-teal-light", v.tint);
  style.setProperty("--color-paper", v.paper);
  style.setProperty("--color-card", v.card);
  style.setProperty("--color-line", v.line);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem(THEME_KEY) as Theme) || "system");
  const [accent, setAccent] = useState<AccentKey>(
    () => (localStorage.getItem(ACCENT_KEY) as AccentKey) || DEFAULT_ACCENT,
  );
  const [resolvedDark, setResolvedDark] = useState(() => (theme === "system" ? systemPrefersDark() : theme === "dark"));

  useLayoutEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
    localStorage.setItem(ACCENT_KEY, accent);

    const isDark = theme === "system" ? systemPrefersDark() : theme === "dark";
    setResolvedDark(isDark);
    applyTheme(isDark, accent);

    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = (e: MediaQueryListEvent) => {
      setResolvedDark(e.matches);
      applyTheme(e.matches, accent);
    };
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, [theme, accent]);

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