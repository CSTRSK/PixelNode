import { PaletteName } from '../types/nodes';

export interface PaletteDefinition {
  id: PaletteName;
  name: string;
  description: string;
  colors: string[]; // hex strings
}

export const RETRO_PALETTES: Record<PaletteName, PaletteDefinition> = {
  gameboy: {
    id: 'gameboy',
    name: 'Game Boy Classic',
    description: 'Original 4-shade greenish LCD palette',
    colors: ['#0f380f', '#306230', '#8bac0f', '#9bbc0f']
  },
  pico8: {
    id: 'pico8',
    name: 'PICO-8',
    description: 'Iconic fantasy console 16-color palette',
    colors: [
      '#000000', '#1D2B53', '#7E2553', '#008751',
      '#AB5236', '#5F574F', '#C2C3C7', '#FFF1E8',
      '#FF004D', '#FFA300', '#FFEC27', '#00E436',
      '#29ADFF', '#83769C', '#FF77A8', '#FFCCAA'
    ]
  },
  nes: {
    id: 'nes',
    name: 'NES Classic',
    description: '8-bit Nintendo Entertainment System selection',
    colors: [
      '#000000', '#1c1c1c', '#757575', '#bcbcbc',
      '#ffffff', '#002664', '#0078f8', '#3cbcfc',
      '#006800', '#00a800', '#58d854', '#a81000',
      '#e40058', '#f83800', '#fca044', '#f8b800'
    ]
  },
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    description: 'High-contrast synthetic arcade neons',
    colors: [
      '#050510', '#16082f', '#7928ca', '#ff007f',
      '#00f0ff', '#ffe600', '#ffffff'
    ]
  },
  vaporwave: {
    id: 'vaporwave',
    name: 'Vaporwave Pastel',
    description: 'Nostalgic 90s aesthetic pastels',
    colors: [
      '#2b1055', '#591a75', '#a12568', '#f15bb5',
      '#fee440', '#00f5d4', '#00bbf9', '#ffffff'
    ]
  },
  monochrome: {
    id: 'monochrome',
    name: '1-Bit Monochrome',
    description: 'Classic Macintosh / ZX Spectrum black & white',
    colors: ['#000000', '#ffffff']
  },
  solarized: {
    id: 'solarized',
    name: 'Solarized Terminal',
    description: 'Clean low-contrast retro terminal tones',
    colors: [
      '#002b36', '#073642', '#586e75', '#839496',
      '#eee8d5', '#b58900', '#cb4b16', '#dc322f',
      '#d33682', '#6c71c4', '#268bd2', '#2aa198', '#859900'
    ]
  }
};

// Convert hex string to RGB numbers
export function hexToRgb(hex: string): [number, number, number] {
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(c => c + c).join('');
  }
  const num = parseInt(cleanHex, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

// Convert RGB to hex string
export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = Math.max(0, Math.min(255, Math.round(x))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

// Cached RGB conversion for performance
const paletteRgbCache = new Map<string, [number, number, number][]>();

export function getPaletteRgbColors(colors: string[]): [number, number, number][] {
  const key = colors.join(',');
  if (paletteRgbCache.has(key)) {
    return paletteRgbCache.get(key)!;
  }
  const rgbs = colors.map(hexToRgb);
  paletteRgbCache.set(key, rgbs);
  return rgbs;
}

// Find nearest color in palette using Euclidean distance in RGB color space
export function findNearestColor(
  r: number,
  g: number,
  b: number,
  paletteRgb: [number, number, number][]
): [number, number, number] {
  let minDistance = Infinity;
  let best = paletteRgb[0] || [0, 0, 0];

  for (let i = 0; i < paletteRgb.length; i++) {
    const [pr, pg, pb] = paletteRgb[i];
    // Weighted Euclidean distance for human perception approximation
    const dr = r - pr;
    const dg = g - pg;
    const db = b - pb;
    const dist = dr * dr * 0.3 + dg * dg * 0.59 + db * db * 0.11;

    if (dist < minDistance) {
      minDistance = dist;
      best = paletteRgb[i];
      if (dist === 0) break;
    }
  }

  return best;
}
