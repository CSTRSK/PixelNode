import React, { useState, useEffect } from 'react';
import { ShieldCheck, ChevronDown, ChevronUp, Lock, Check } from 'lucide-react';

export interface CookieConsent {
  essential: boolean;
  preferences: boolean;
  timestamp: number;
}

interface CookieBannerProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveConsent: (consent: CookieConsent) => void;
}

const STORAGE_KEY = 'pixelnode_cookie_consent_v1';

export function getStoredConsent(): CookieConsent | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return null;
}

export function saveStoredConsent(consent: CookieConsent): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
  } catch {
    // ignore
  }
}

export const CookieBanner: React.FC<CookieBannerProps> = ({
  isOpen,
  onClose,
  onSaveConsent
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [allowPreferences, setAllowPreferences] = useState(true);

  if (!isOpen) return null;

  const handleAcceptEssential = () => {
    const consent: CookieConsent = {
      essential: true,
      preferences: false,
      timestamp: Date.now()
    };
    saveStoredConsent(consent);
    onSaveConsent(consent);
    onClose();
  };

  const handleAcceptAll = () => {
    const consent: CookieConsent = {
      essential: true,
      preferences: true,
      timestamp: Date.now()
    };
    saveStoredConsent(consent);
    onSaveConsent(consent);
    onClose();
  };

  const handleSaveCustom = () => {
    const consent: CookieConsent = {
      essential: true,
      preferences: allowPreferences,
      timestamp: Date.now()
    };
    saveStoredConsent(consent);
    onSaveConsent(consent);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-banner-title"
      aria-describedby="cookie-banner-desc"
      className="fixed inset-x-0 bottom-0 z-50 p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md flex items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-200"
    >
      <div className="theme-modal-card max-w-3xl w-full bg-white dark:bg-slate-900 border-2 border-indigo-600 rounded-xl shadow-2xl p-5 sm:p-6 text-slate-800 dark:text-slate-100 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shrink-0">
            <ShieldCheck className="w-6 h-6" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <h2 id="cookie-banner-title" className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              Datenschutz- & Speichereinstellungen (DSGVO / GDPR)
            </h2>
            <p id="cookie-banner-desc" className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
              Wir respektieren Ihre Privatsphäre. Diese Anwendung verwendet <strong>keine Tracking-Cookies</strong> und
              keine Werbe-Tracker. Wir nutzen ausschließlich den lokalen Browserspeicher (<code>localStorage</code>), um
              Ihre Sprite-Animationen automatisch alle 30 Sekunden zu sichern (Auto-Save) und Datenverlust zu verhindern
              (gemäß DSGVO Art. 6 Abs. 1 lit. f &amp; TDDDG § 25 Abs. 2 Nr. 2).
            </p>
            <div className="flex items-center gap-3 mt-2 text-xs">
              <a
                href="https://cstrsk.de/Impressum.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
              >
                Impressum ansehen &rarr;
              </a>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <a
                href="https://cstrsk.de/dsvgo.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
              >
                Datenschutzerklärung (DSGVO) &rarr;
              </a>
            </div>
          </div>
        </div>

        {/* Expandable Technical Details / Categories Accordion */}
        {showDetails && (
          <div className="flex flex-col gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2">
                <Lock className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" aria-hidden="true" />
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>1. Technisch notwendige Daten (Immer aktiv)</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-1.5 py-0.2 rounded font-mono">
                      Erforderlich
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 mt-0.5">
                    Lokale Speicherung des aktuellen Node-Graphen (Auto-Save alle 30 Sekunden) und Cookie-Einwilligung. Verbleibt ausschließlich auf Ihrem Gerät.
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-mono text-emerald-600 font-bold shrink-0">Aktiv</span>
            </div>

            <div className="flex items-start justify-between gap-3 pt-2.5 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" aria-hidden="true" />
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">
                    2. Benutzeroberflächen- &amp; Barrierefreiheits-Einstellungen
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 mt-0.5">
                    Speichert Ihre bevorzugten Ansichtseinstellungen (z.B. Hoher Kontrast für Barrierefreiheit, Standard-Raster).
                  </p>
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={allowPreferences}
                  onChange={(e) => setAllowPreferences(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  aria-label="Einstellungen für Benutzeroberfläche und Barrierefreiheit speichern"
                />
              </label>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white py-2 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer"
            aria-expanded={showDetails}
          >
            <span>{showDetails ? 'Details ausblenden' : 'Details & Speicherkategorien anzeigen'}</span>
            {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <button
              type="button"
              onClick={handleAcceptEssential}
              className="py-2.5 px-4 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors border border-slate-300 dark:border-slate-600 focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer"
            >
              Nur essenzielle akzeptieren
            </button>

            {showDetails ? (
              <button
                type="button"
                onClick={handleSaveCustom}
                className="py-2.5 px-4 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer"
              >
                Auswahl speichern
              </button>
            ) : (
              <button
                type="button"
                onClick={handleAcceptAll}
                className="py-2.5 px-4 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer"
              >
                Alle akzeptieren
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
