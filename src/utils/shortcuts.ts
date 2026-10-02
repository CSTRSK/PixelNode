export interface ShortcutItem {
  id: string;
  name: string;
  category: 'tools' | 'playback' | 'canvas';
  description: string;
  key: string;
  defaultKey: string;
}

export const DEFAULT_SHORTCUTS: ShortcutItem[] = [
  // 1. Drawing Tools (B, E, F, I)
  {
    id: 'tool_brush',
    name: 'Pinsel / Stift (Brush)',
    category: 'tools',
    description: 'Aktiviert das Pinsel- und Zeichenwerkzeug',
    key: 'b',
    defaultKey: 'b'
  },
  {
    id: 'tool_eraser',
    name: 'Radiergummi (Eraser)',
    category: 'tools',
    description: 'Aktiviert das Radiergummi-Werkzeug',
    key: 'e',
    defaultKey: 'e'
  },
  {
    id: 'tool_bucket',
    name: 'Fülleimer (Bucket Fill)',
    category: 'tools',
    description: 'Füllt zusammenhängende Farbbereiche',
    key: 'f',
    defaultKey: 'f'
  },
  {
    id: 'tool_picker',
    name: 'Farbpipette (Eyedropper)',
    category: 'tools',
    description: 'Nimmt eine Pixelfarbe unter dem Zeiger auf',
    key: 'i',
    defaultKey: 'i'
  },

  // 2. Playback & Scrubber (Play/Pause, Step Frames)
  {
    id: 'action_play_pause',
    name: 'Abspielen / Pause (Play/Pause)',
    category: 'playback',
    description: 'Startet oder stoppt die Wiedergabe des aktiven Streams',
    key: 'Space',
    defaultKey: 'Space'
  },
  {
    id: 'action_step_back',
    name: 'Frame zurück (Step Back)',
    category: 'playback',
    description: 'Springt genau einen Frame im Animations-Stream zurück',
    key: 'ArrowLeft',
    defaultKey: 'ArrowLeft'
  },
  {
    id: 'action_step_forward',
    name: 'Frame vor (Step Forward)',
    category: 'playback',
    description: 'Springt genau einen Frame im Animations-Stream vor',
    key: 'ArrowRight',
    defaultKey: 'ArrowRight'
  },

  // 3. Canvas & Common Operations (Spawn Node, Center, Delete)
  {
    id: 'action_spawn_node',
    name: 'Knoten erstellen (Spawn Node)',
    category: 'canvas',
    description: 'Öffnet das Menü zur Auswahl und Erstellung neuer Knoten',
    key: 'a',
    defaultKey: 'a'
  },
  {
    id: 'action_center_canvas',
    name: 'Ansicht zentrieren (Center Canvas)',
    category: 'canvas',
    description: 'Zentriert den Graph und setzt den Zoom auf 100% zurück',
    key: 'c',
    defaultKey: 'c'
  },
  {
    id: 'action_delete_node',
    name: 'Ausgewählten Knoten löschen',
    category: 'canvas',
    description: 'Löscht die aktuell markierte Node aus dem Graphen',
    key: 'Delete',
    defaultKey: 'Delete'
  }
];

const STORAGE_KEY = 'pixelnode_custom_shortcuts_v1';

/**
 * Loads customized shortcuts mapping from localStorage.
 */
export function loadShortcuts(): Record<string, string> {
  const result: Record<string, string> = {};
  // Populate with defaults
  DEFAULT_SHORTCUTS.forEach(s => {
    result[s.id] = s.defaultKey;
  });

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed === 'object' && parsed !== null) {
        Object.keys(parsed).forEach(k => {
          if (typeof parsed[k] === 'string' && parsed[k].trim()) {
            result[k] = parsed[k].trim();
          }
        });
      }
    }
  } catch (err) {
    console.warn('Failed to load shortcuts from localStorage:', err);
  }

  return result;
}

/**
 * Saves customized shortcuts mapping to localStorage.
 */
export function saveShortcuts(shortcuts: Record<string, string>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shortcuts));
  } catch (err) {
    console.warn('Failed to save shortcuts to localStorage:', err);
  }
}

/**
 * Formats a key name for human-friendly UI presentation.
 */
export function formatKeyDisplay(key: string): string {
  if (!key) return '-';
  const lower = key.toLowerCase();
  if (lower === ' ' || lower === 'space') return 'Space (Leertaste)';
  if (lower === 'arrowleft') return '← Links';
  if (lower === 'arrowright') return '→ Rechts';
  if (lower === 'arrowup') return '↑ Oben';
  if (lower === 'arrowdown') return '↓ Unten';
  if (lower === 'delete') return 'Entf / Delete';
  if (lower === 'backspace') return 'Rücktaste';
  if (lower === 'enter') return 'Enter ↵';
  if (lower === 'tab') return 'Tab ⇥';
  if (lower === 'escape') return 'Esc';
  return key.toUpperCase();
}

/**
 * Returns a short symbol or single character for compact badges (e.g. in toolbars).
 */
export function formatKeyShort(key: string): string {
  if (!key) return '';
  const lower = key.toLowerCase();
  if (lower === ' ' || lower === 'space') return 'Space';
  if (lower === 'arrowleft') return '←';
  if (lower === 'arrowright') return '→';
  if (lower === 'arrowup') return '↑';
  if (lower === 'arrowdown') return '↓';
  if (lower === 'delete') return 'Entf';
  return key.toUpperCase();
}

/**
 * Checks if a KeyboardEvent matches a configured targetKey.
 */
export function isKeyMatch(e: KeyboardEvent, targetKey: string): boolean {
  if (!targetKey) return false;

  const targetLower = targetKey.toLowerCase();
  const eventKeyLower = e.key ? e.key.toLowerCase() : '';
  const eventCodeLower = e.code ? e.code.toLowerCase() : '';

  // Space check
  if (targetLower === 'space' || targetLower === ' ') {
    return eventCodeLower === 'space' || eventKeyLower === ' ';
  }

  // Arrow keys
  if (targetLower === 'arrowleft') {
    return eventKeyLower === 'arrowleft' || eventCodeLower === 'arrowleft';
  }
  if (targetLower === 'arrowright') {
    return eventKeyLower === 'arrowright' || eventCodeLower === 'arrowright';
  }
  if (targetLower === 'arrowup') {
    return eventKeyLower === 'arrowup' || eventCodeLower === 'arrowup';
  }
  if (targetLower === 'arrowdown') {
    return eventKeyLower === 'arrowdown' || eventCodeLower === 'arrowdown';
  }

  // Delete & Backspace
  if (targetLower === 'delete' || targetLower === 'entf') {
    return (
      eventKeyLower === 'delete' ||
      eventKeyLower === 'backspace' ||
      eventCodeLower === 'delete' ||
      eventCodeLower === 'backspace'
    );
  }

  // Exact letter / character match
  return eventKeyLower === targetLower || eventCodeLower === `key${targetLower}`;
}
