import { AppNode, NodeConnection } from '../types/nodes';

export interface AutoSavePayload {
  version: string;
  timestamp: number;
  dateFormatted: string;
  fps: number;
  nodes: AppNode[];
  connections: NodeConnection[];
}

const STORAGE_KEY = 'pixelnode_autosave_v1';
const CONSENT_KEY = 'pixelnode_cookie_consent_v1';

/**
 * Check if the user allowed essential/functional localStorage storage
 */
export function hasStorageConsent(): boolean {
  try {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) return true; // Default allowed for essential site function under GDPR Art. 6(1)(f)
    const parsed = JSON.parse(consent);
    return parsed.essential !== false;
  } catch {
    return true;
  }
}

/**
 * Save project graph to localStorage
 */
export function saveToLocalStorage(
  nodes: AppNode[],
  connections: NodeConnection[],
  fps: number
): boolean {
  if (!hasStorageConsent()) return false;
  try {
    const payload: AutoSavePayload = {
      version: '2.4',
      timestamp: Date.now(),
      dateFormatted: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      fps,
      nodes,
      connections
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch (err) {
    console.warn('AutoSave: Failed to save to localStorage', err);
    return false;
  }
}

/**
 * Load auto-saved payload from localStorage
 */
export function loadFromLocalStorage(): AutoSavePayload | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const payload = JSON.parse(raw) as AutoSavePayload;
    if (payload && Array.isArray(payload.nodes) && Array.isArray(payload.connections)) {
      return payload;
    }
    return null;
  } catch (err) {
    console.warn('AutoSave: Failed to load from localStorage', err);
    return null;
  }
}

/**
 * Clear auto-saved data from localStorage
 */
export function clearLocalStorageSave(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('AutoSave: Failed to clear localStorage', err);
  }
}
