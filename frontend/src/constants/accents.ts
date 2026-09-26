export type AccentKey = "teal" | "blue" | "violet" | "rose" | "amber" | "slate";

interface AccentVariant {
  base: string;  // "R G B" — основной цвет кнопок и акцентов
  hover: string; // более тёмный оттенок для hover/active
  tint: string;  // светлая подсветка выбранных карточек
  paper: string; // фон страницы, едва тонированный акцентом
  card: string;  // фон карточек/боковой панели ("колонок")
  line: string;  // цвет границ, тонированный акцентом
}

interface AccentPreset {
  key: AccentKey;
  label: string;
  light: AccentVariant;
  dark: AccentVariant;
}

export const DEFAULT_ACCENT: AccentKey = "teal";

export const ACCENT_PRESETS: AccentPreset[] = [
  {
    key: "teal",
    label: "Зелёный",
    light: {
      base: "47 111 94", hover: "31 77 64", tint: "228 239 234",
      paper: "244 246 244", card: "255 255 255", line: "220 227 220",
    },
    dark: {
      base: "72 160 133", hover: "53 124 103", tint: "29 59 50",
      paper: "18 24 21", card: "27 35 32", line: "43 53 50",
    },
  },
  {
    key: "blue",
    label: "Синий",
    light: {
      base: "43 98 153", hover: "28 70 112", tint: "224 234 244",
      paper: "241 245 250", card: "255 255 255", line: "216 227 236",
    },
    dark: {
      base: "92 156 214", hover: "63 118 172", tint: "24 42 58",
      paper: "15 20 26", card: "22 30 38", line: "38 49 60",
    },
  },
  {
    key: "violet",
    label: "Фиолетовый",
    light: {
      base: "108 74 158", hover: "79 52 122", tint: "236 230 245",
      paper: "246 243 250", card: "255 255 255", line: "228 220 237",
    },
    dark: {
      base: "158 128 204", hover: "124 96 168", tint: "45 36 58",
      paper: "22 18 28", card: "32 27 40", line: "52 45 64",
    },
  },
  {
    key: "rose",
    label: "Розовый",
    light: {
      base: "165 60 92", hover: "128 42 70", tint: "245 227 233",
      paper: "250 243 245", card: "255 255 255", line: "237 220 226",
    },
    dark: {
      base: "210 110 140", hover: "176 82 112", tint: "58 30 40",
      paper: "26 17 20", card: "38 26 30", line: "60 42 48",
    },
  },
  {
    key: "amber",
    label: "Янтарный",
    light: {
      base: "173 122 38", hover: "138 94 26", tint: "244 235 218",
      paper: "250 246 236", card: "255 255 255", line: "237 227 205",
    },
    dark: {
      base: "214 168 92", hover: "176 132 62", tint: "56 44 26",
      paper: "24 20 14", card: "36 30 20", line: "58 48 32",
    },
  },
  {
    key: "slate",
    label: "Графитовый",
    light: {
      base: "71 85 92", hover: "50 61 67", tint: "228 232 234",
      paper: "244 245 246", card: "255 255 255", line: "220 224 227",
    },
    dark: {
      base: "148 163 170", hover: "112 126 133", tint: "40 46 49",
      paper: "19 21 23", card: "28 31 34", line: "46 50 54",
    },
  },
];

/** Цвет для превью-кружка в настройках, с учётом текущей темы. */
export function accentSwatch(preset: AccentPreset, resolvedDark: boolean): string {
  const v = resolvedDark ? preset.dark : preset.light;
  return `rgb(${v.base})`;
}