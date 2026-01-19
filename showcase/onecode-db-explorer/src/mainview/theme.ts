import type { ThemeColorValue, ThemeJson, ThemeVariant } from "../bun/index";

export type ColorMode = "dark" | "light";
export type ColorModeSetting = ColorMode | "system";

const APPLIED_CSS_VARS = [
  "--background",
  "--foreground",
  "--card",
  "--card-foreground",
  "--popover",
  "--popover-foreground",
  "--primary",
  "--primary-foreground",
  "--secondary",
  "--secondary-foreground",
  "--muted-foreground",
  "--accent",
  "--accent-foreground",
  "--destructive",
  "--destructive-foreground",
  "--border",
  "--input",
  "--input-background",
  "--ring",
  "--selection",
  "--tl-background",
  "--surface-1",
  "--surface-2",
  "--surface-3",
  "--syntax-keyword",
  "--syntax-function",
  "--syntax-string",
  "--syntax-number",
  "--syntax-comment",
  "--syntax-operator",
  "--syntax-type",
  "--syntax-variable",
] as const;

export function clearAppliedTheme(root: HTMLElement) {
  for (const cssVar of APPLIED_CSS_VARS) {
    root.style.removeProperty(cssVar);
  }
}

export function applyTheme(root: HTMLElement, theme: ThemeJson, mode: ColorMode) {
  const vars = themeToCssVars(theme, mode);
  for (const [cssVar, value] of Object.entries(vars)) {
    root.style.setProperty(cssVar, value);
  }
}

function isVariant(value: ThemeColorValue): value is ThemeVariant {
  return Boolean(
    value &&
      typeof value === "object" &&
      "dark" in value &&
      "light" in value &&
      typeof (value as ThemeVariant).dark === "string" &&
      typeof (value as ThemeVariant).light === "string"
  );
}

const ANSI_HEX = [
  "#000000",
  "#800000",
  "#008000",
  "#808000",
  "#000080",
  "#800080",
  "#008080",
  "#c0c0c0",
  "#808080",
  "#ff0000",
  "#00ff00",
  "#ffff00",
  "#0000ff",
  "#ff00ff",
  "#00ffff",
  "#ffffff",
] as const;

function ansiToHex(code: number) {
  if (code < 16) return ANSI_HEX[code] ?? "#000000";
  if (code < 232) {
    const index = code - 16;
    const b = index % 6;
    const g = Math.floor(index / 6) % 6;
    const r = Math.floor(index / 36);

    const val = (x: number) => (x === 0 ? 0 : x * 40 + 55);
    return rgbToHex(val(r), val(g), val(b));
  }
  if (code < 256) {
    const gray = (code - 232) * 10 + 8;
    return rgbToHex(gray, gray, gray);
  }
  return "#000000";
}

function rgbToHex(r: number, g: number, b: number) {
  const clamp = (x: number) => Math.max(0, Math.min(255, Math.round(x)));
  return `#${[clamp(r), clamp(g), clamp(b)]
    .map((n) => n.toString(16).padStart(2, "0"))
    .join("")}`;
}

function normalizeHex(input: string) {
  const hex = input.trim();
  if (!hex.startsWith("#")) return null;
  if (hex.length === 4) {
    const r = hex[1] ?? "0";
    const g = hex[2] ?? "0";
    const b = hex[3] ?? "0";
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  if (hex.length === 7) return hex.toLowerCase();
  if (hex.length === 9) return hex.slice(0, 7).toLowerCase();
  return null;
}

function resolveThemeColors(theme: ThemeJson, mode: ColorMode) {
  const defs = theme.defs ?? {};
  const values = theme.theme ?? {};

  const resolveColor = (value: ThemeColorValue, resolving: Set<string>): string | null => {
    if (typeof value === "number") return ansiToHex(value);
    if (isVariant(value)) return resolveColor(value[mode], resolving);
    if (typeof value !== "string") return null;

    const trimmed = value.trim();
    if (trimmed === "transparent" || trimmed === "none") return null;

    const directHex = normalizeHex(trimmed);
    if (directHex) return directHex;

    if (resolving.has(trimmed)) return null;
    resolving.add(trimmed);

    const def = defs[trimmed];
    if (def != null) return resolveColor(def, resolving);

    const nested = values[trimmed];
    if (nested != null) return resolveColor(nested, resolving);

    return null;
  };

  const resolved: Record<string, string> = {};
  for (const [key, value] of Object.entries(values)) {
    const c = resolveColor(value, new Set([key]));
    if (c) resolved[key] = c;
  }
  return resolved;
}

function hexToRgb(hex: string) {
  const normalized = normalizeHex(hex);
  if (!normalized) return null;
  const r = Number.parseInt(normalized.slice(1, 3), 16);
  const g = Number.parseInt(normalized.slice(3, 5), 16);
  const b = Number.parseInt(normalized.slice(5, 7), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return null;
  return { r, g, b };
}

function rgbToHsl(r: number, g: number, b: number) {
  const rr = r / 255;
  const gg = g / 255;
  const bb = b / 255;

  const max = Math.max(rr, gg, bb);
  const min = Math.min(rr, gg, bb);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === rr) h = ((gg - bb) / delta) % 6;
    else if (max === gg) h = (bb - rr) / delta + 2;
    else h = (rr - gg) / delta + 4;
    h *= 60;
    if (h < 0) h += 360;
  }

  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function hexToHslTriplet(hex: string) {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  const { h, s, l } = rgbToHsl(rgb.r, rgb.g, rgb.b);
  return `${h} ${s}% ${l}%`;
}

function pickReadableTextColor(hexBg: string) {
  const rgb = hexToRgb(hexBg);
  if (!rgb) return "#ffffff";
  const luminance = 0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b;
  return luminance > 160 ? "#000000" : "#ffffff";
}

function themeToCssVars(theme: ThemeJson, mode: ColorMode) {
  const colors = resolveThemeColors(theme, mode);
  const get = (key: string) => colors[key];
  const vars: Record<string, string> = {};

  const setTriplet = (cssVar: string, hex: string | undefined | null) => {
    if (!hex) return;
    const triplet = hexToHslTriplet(hex);
    if (!triplet) return;
    vars[cssVar] = triplet;
  };

  const setTripletWithFallback = (cssVar: string, primary: string | undefined, fallback: string | undefined) => {
    setTriplet(cssVar, primary ?? fallback ?? null);
  };

  const background = get("background");
  const foreground = get("text");
  const backgroundPanel = get("backgroundPanel");
  const backgroundElement = get("backgroundElement");
  const primary = get("primary");
  const secondary = get("secondary");
  const accent = get("accent");
  const border = get("border");
  const borderActive = get("borderActive") ?? primary;
  const error = get("error");

  setTriplet("--background", background);
  setTriplet("--foreground", foreground);
  setTriplet("--muted-foreground", get("textMuted"));

  setTripletWithFallback("--card", backgroundPanel, background);
  setTripletWithFallback("--popover", backgroundPanel, background);
  setTripletWithFallback("--surface-1", background, backgroundPanel);
  setTripletWithFallback("--surface-2", backgroundPanel, background);
  setTripletWithFallback("--surface-3", backgroundElement, backgroundPanel);
  setTripletWithFallback("--tl-background", backgroundPanel, background);

  setTriplet("--card-foreground", foreground);
  setTriplet("--popover-foreground", foreground);

  setTriplet("--primary", primary);
  setTriplet("--secondary", secondary);
  setTriplet("--accent", accent);
  setTriplet("--destructive", error);
  setTriplet("--border", border);
  setTriplet("--input", border);
  setTripletWithFallback("--input-background", backgroundElement, backgroundPanel);
  setTriplet("--ring", borderActive);

  if (primary) {
    const triplet = hexToHslTriplet(primary);
    if (triplet) {
      vars["--selection"] = `${triplet} / ${mode === "dark" ? "0.3" : "0.22"}`;
      const primaryFg = pickReadableTextColor(primary);
      setTriplet("--primary-foreground", primaryFg);
    }
  }

  if (secondary) {
    const secondaryFg = pickReadableTextColor(secondary);
    setTriplet("--secondary-foreground", secondaryFg);
  }
  if (accent) {
    const accentFg = pickReadableTextColor(accent);
    setTriplet("--accent-foreground", accentFg);
  }
  if (error) {
    const destructiveFg = pickReadableTextColor(error);
    setTriplet("--destructive-foreground", destructiveFg);
  }

  setTriplet("--syntax-keyword", get("syntaxKeyword"));
  setTriplet("--syntax-function", get("syntaxFunction"));
  setTriplet("--syntax-string", get("syntaxString"));
  setTriplet("--syntax-number", get("syntaxNumber"));
  setTriplet("--syntax-comment", get("syntaxComment"));
  setTriplet("--syntax-operator", get("syntaxOperator"));
  setTriplet("--syntax-type", get("syntaxType"));
  setTriplet("--syntax-variable", get("syntaxVariable"));

  return vars;
}

