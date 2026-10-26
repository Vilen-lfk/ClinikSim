export type AccentKey =
  | "teal" | "emerald" | "olive" | "blue" | "indigo" | "violet"
  | "rose" | "cherry" | "coral" | "amber" | "slate";

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
    key: "emerald",
    label: "Изумрудный",
    light: {
      base: "21 128 61", hover: "15 98 46", tint: "220 242 228",
      paper: "245 249 246", card: "255 255 255", line: "220 234 225",
    },
    dark: {
      base: "74 196 120", hover: "52 160 95", tint: "18 46 30",
      paper: "10 16 12", card: "18 26 21", line: "33 50 40",
    },
  },
  {
    key: "olive",
    label: "Оливковый",
    light: {
      base: "102 120 30", hover: "78 92 20", tint: "235 240 212",
      paper: "248 249 241", card: "255 255 255", line: "230 234 210",
    },
    dark: {
      base: "172 194 82", hover: "138 158 60", tint: "40 46 18",
      paper: "13 15 9", card: "22 25 16", line: "42 47 30",
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
    key: "indigo",
    label: "Индиго",
    light: {
      base: "63 72 184", hover: "45 52 145", tint: "226 228 249",
      paper: "246 246 252", card: "255 255 255", line: "223 225 243",
    },
    dark: {
      base: "124 135 240", hover: "96 106 204", tint: "29 32 64",
      paper: "11 12 21", card: "19 20 33", line: "37 39 60",
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
    key: "cherry",
    label: "Вишнёвый",
    light: {
      base: "185 38 50", hover: "145 25 36", tint: "248 220 222",
      paper: "251 245 245", card: "255 255 255", line: "241 220 221",
    },
    dark: {
      base: "234 92 100", hover: "198 64 74", tint: "58 20 24",
      paper: "17 10 10", card: "28 17 18", line: "54 32 34",
    },
  },
  {
    key: "coral",
    label: "Коралловый",
    light: {
      base: "201 84 42", hover: "160 62 28", tint: "250 227 216",
      paper: "251 246 243", card: "255 255 255", line: "242 225 216",
    },
    dark: {
      base: "240 128 88", hover: "204 98 62", tint: "58 30 20",
      paper: "17 11 9", card: "28 19 16", line: "54 37 31",
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