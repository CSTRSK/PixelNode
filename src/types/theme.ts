export type UIDesign = 'studio' | 'cyberpunk' | 'gameboy' | 'pico8' | 'blueprint';

export interface UIDesignConfig {
  id: UIDesign;
  name: string;
  description: string;
  badge: string;
  accentColor: string;
  previewClass: string;
}

export const UI_DESIGNS: UIDesignConfig[] = [
  {
    id: 'studio',
    name: 'Modern Studio',
    description: 'Klares Indigo- und Slate-Design für modernen Workflow',
    badge: 'Standard',
    accentColor: '#6366f1',
    previewClass: 'bg-indigo-600'
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    description: 'Dunkler Synthwave-Look mit Neon-Pink und Cyan-Glow',
    badge: 'Synthwave',
    accentColor: '#ff007f',
    previewClass: 'bg-pink-600'
  },
  {
    id: 'gameboy',
    name: 'Game Boy Classic',
    description: 'Nostalgische 90er 4-Stufen-LCD-Optik in Olivgrün',
    badge: 'Retro',
    accentColor: '#8bac0f',
    previewClass: 'bg-lime-700'
  },
  {
    id: 'pico8',
    name: 'PICO-8 Fantasy',
    description: 'Fantasy-Konsole mit warmem Mitternachtsblau und Peach',
    badge: 'Pixel',
    accentColor: '#29adff',
    previewClass: 'bg-sky-600'
  },
  {
    id: 'blueprint',
    name: 'Blueprint CAD',
    description: 'Technischer Konstruktions-Plan mit Cyan-Raster',
    badge: 'Technik',
    accentColor: '#64dfdf',
    previewClass: 'bg-teal-600'
  }
];
