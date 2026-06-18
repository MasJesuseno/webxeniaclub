/**
 * Color palette generator for SMA Annajah CMS.
 * Takes a single hex color and generates 11 shades (50–950)
 * using HSL manipulation, where the input color maps to shade 600.
 */

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  let r = 0, g = 0, b = 0;
  const clean = hex.replace("#", "");
  if (clean.length === 3) {
    r = parseInt(clean[0] + clean[0], 16);
    g = parseInt(clean[1] + clean[1], 16);
    b = parseInt(clean[2] + clean[2], 16);
  } else if (clean.length === 6) {
    r = parseInt(clean.substring(0, 2), 16);
    g = parseInt(clean.substring(2, 4), 16);
    b = parseInt(clean.substring(4, 6), 16);
  }

  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * Math.min(Math.max(color, 0), 1))
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

// Lightness targets for each shade (0-100 scale)
// The input color maps to shade-600
const shadeLightness: Record<string, number> = {
  "50": 97,
  "100": 93,
  "200": 85,
  "300": 75,
  "400": 63,
  "500": 50,
  "600": 38, // input color maps here
  "700": 30,
  "800": 22,
  "900": 16,
  "950": 10,
};

export function generatePalette(hex: string): Record<string, string> {
  const { h, s, l } = hexToHsl(hex);
  
  // The input color lightness determines the "600" shade
  // We shift all shades so the input color stays at its perceived lightness
  const inputLightness = l;
  const targetLightness600 = shadeLightness["600"];
  const shift = inputLightness - targetLightness600;

  const palette: Record<string, string> = {};
  for (const [shade, lightness] of Object.entries(shadeLightness)) {
    const adjustedL = Math.min(100, Math.max(0, lightness + shift));
    // More saturation for mid-tones, less for very light/dark
    const adjustedS = parseInt(shade) >= 50 && parseInt(shade) <= 300
      ? Math.max(20, s - 15)
      : s;
    palette[shade] = hslToHex(h, adjustedS, Math.round(adjustedL));
  }
  return palette;
}

export function hslToCssVariable(h: number, s: number, l: number): string {
  return `${h} ${s}% ${l}%`;
}

export function hexToCssHsl(hex: string): string {
  const { h, s, l } = hexToHsl(hex);
  return `${h} ${s}% ${l}%`;
}

// CSS variable names for each shade
export const shadeKeys = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"];

export function generateCssVariables(hex: string): Record<string, string> {
  const palette = generatePalette(hex);
  const vars: Record<string, string> = {};
  for (const key of shadeKeys) {
    const { h, s, l } = hexToHsl(palette[key]);
    vars[`--primary-${key}`] = `${h} ${s}% ${l}%`;
  }
  return vars;
}

// Preset color themes
export const colorPresets = [
  {
    name: "Biru",
    color: "#1e40af",
    description: "Default - Biru klasik sekolah",
  },
  {
    name: "Hijau",
    color: "#15803d",
    description: "Hijau segar & alami",
  },
  {
    name: "Ungu",
    color: "#7c3aed",
    description: "Ungu elegan & modern",
  },
  {
    name: "Merah",
    color: "#b91c1c",
    description: "Merah berani & semangat",
  },
  {
    name: "Oranye",
    color: "#c2410c",
    description: "Oranye hangat & kreatif",
  },
  {
    name: "Tosca",
    color: "#0d9488",
    description: "Tosca segar & modern",
  },
  {
    name: "Emas",
    color: "#a16207",
    description: "Emas mewah & berkelas",
  },
  {
    name: "Abu-abu",
    color: "#4b5563",
    description: "Abu-abu profesional & minimalis",
  },
] as const;
