export type AccentKey = "teal" | "blue" | "violet" | "rose" | "amber" | "slate";

interface AccentVariant {
  base: string;
  hover: string;
  tint: string;
  paper: string;
  card: string;
  line: string;
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
    label: "Бирюзовый",
    light: {
      base: "20 122 115", hover: "13 92 86", tint: "222 241 238",
      paper: "246 247 249", card: "255 255 255", line: "224 229 234",
    },
    dark: {
      base: "45 189 177", hover: "30 150 140", tint: "20 48 46",
      paper: "12 16 19", card: "21 27 31", line: "38 47 53",
    },
  },
  {
    key: "blue",
    label: "Синий",
    light: {
      base: "29 91 168", hover: "20 68 130", tint: "221 233 249",
      paper: "245 248 251", card: "255 255 255", line: "219 230 241",
    },
    dark: {
      base: "77 155 229", hover: "52 120 188", tint: "18 36 54",
      paper: "10 14 19", card: "18 25 32", line: "33 44 55",
    },
  },
  {
    key: "violet",
    label: "Фиолетовый",
    light: {
      base: "109 61 196", hover: "82 43 153", tint: "233 224 248",
      paper: "248 246 252", card: "255 255 255", line: "230 221 243",
    },
    dark: {
      base: "168 128 232", hover: "132 96 196", tint: "40 29 61",
      paper: "15 12 21", card: "24 19 32", line: "44 36 58",
    },
  },
  {
    key: "rose",
    label: "Розовый",
    light: {
      base: "196 47 94", hover: "154 30 72", tint: "249 222 231",
      paper: "251 245 247", card: "255 255 255", line: "241 221 228",
    },
    dark: {
      base: "232 100 139", hover: "196 70 108", tint: "56 23 35",
      paper: "16 10 13", card: "26 18 22", line: "50 32 38",
    },
  },
  {
    key: "amber",
    label: "Янтарный",
    light: {
      base: "188 125 10", hover: "148 97 6", tint: "248 234 205",
      paper: "251 247 237", card: "255 255 255", line: "241 228 198",
    },
    dark: {
      base: "227 172 69", hover: "188 136 45", tint: "53 40 16",
      paper: "16 13 8", card: "26 21 14", line: "51 41 25",
    },
  },
  {
    key: "slate",
    label: "Графитовый",
    light: {
      base: "55 71 82", hover: "37 49 58", tint: "223 229 233",
      paper: "246 247 248", card: "255 255 255", line: "222 227 231",
    },
    dark: {
      base: "158 175 185", hover: "121 138 149", tint: "35 42 47",
      paper: "11 14 16", card: "19 24 27", line: "35 42 47",
    },
  },
];

export function accentSwatch(preset: AccentPreset, resolvedDark: boolean): string {
  const v = resolvedDark ? preset.dark : preset.light;
  return `rgb(${v.base})`;
}