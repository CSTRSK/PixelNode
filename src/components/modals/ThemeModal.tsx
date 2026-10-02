import React from 'react';
import { Palette, Sun, Moon, Check, X, Sparkles, Monitor } from 'lucide-react';
import { UIDesign, UI_DESIGNS } from '../../types/theme';
import { LanguageCode, TRANSLATIONS } from '../../utils/i18n';

export type ThemeMode = 'auto' | 'light' | 'dark';

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  themeMode?: ThemeMode;
  onSetThemeMode?: (mode: ThemeMode) => void;
  onToggleDarkMode?: () => void;
  currentDesign: UIDesign;
  onSelectDesign: (design: UIDesign) => void;
  currentLanguage?: LanguageCode;
}

export const ThemeModal: React.FC<ThemeModalProps> = ({
  isOpen,
  onClose,
  isDarkMode,
  themeMode = 'auto',
  onSetThemeMode,
  onToggleDarkMode,
  currentDesign,
  onSelectDesign,
  currentLanguage = 'de'
}) => {
  if (!isOpen) return null;
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.de;

  const handleModeClick = (mode: ThemeMode) => {
    if (onSetThemeMode) {
      onSetThemeMode(mode);
    } else if (onToggleDarkMode) {
      if ((mode === 'dark' && !isDarkMode) || (mode === 'light' && isDarkMode)) {
        onToggleDarkMode();
      }
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="theme-modal-title"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div className="theme-modal-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-lg w-full p-6 text-slate-800 dark:text-slate-100 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 id="theme-modal-title" className="text-base font-bold text-slate-900 dark:text-white">
                {t.themeModalTitle}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t.designs} &amp; {t.systemAutoDetect}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Schließen"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dark / Light / Auto Mode Switch */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            {themeMode === 'auto' ? (
              <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400">
                <Monitor className="w-4 h-4" />
              </div>
            ) : isDarkMode ? (
              <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-400">
                <Moon className="w-4 h-4" />
              </div>
            ) : (
              <div className="p-2 rounded-lg bg-amber-100 text-amber-500">
                <Sun className="w-4 h-4" />
              </div>
            )}
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{t.systemAutoDetect}</span>
                {themeMode === 'auto' && (
                  <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                    Auto ({isDarkMode ? t.themeDark : t.themeLight})
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                {themeMode === 'auto'
                  ? 'Auto-Detect OS / System Theme (Light / Dark)'
                  : `${t.themeLight} / ${t.themeDark}`}
              </div>
            </div>
          </div>

          {/* 3-way toggle */}
          <div className="flex items-center bg-slate-200/80 dark:bg-slate-900 p-1 rounded-lg gap-1 self-start sm:self-center shrink-0">
            <button
              type="button"
              onClick={() => handleModeClick('auto')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1 cursor-pointer ${
                themeMode === 'auto'
                  ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title={t.systemAutoDetect}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>{t.themeAuto}</span>
            </button>
            <button
              type="button"
              onClick={() => handleModeClick('light')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1 cursor-pointer ${
                themeMode === 'light'
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title={t.themeLight}
            >
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>{t.themeLight}</span>
            </button>
            <button
              type="button"
              onClick={() => handleModeClick('dark')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1 cursor-pointer ${
                themeMode === 'dark'
                  ? 'bg-indigo-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title={t.themeDark}
            >
              <Moon className="w-3.5 h-3.5 text-indigo-300" />
              <span>{t.themeDark}</span>
            </button>
          </div>
        </div>

        {/* Visual Design Presets */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono">
            Visuelle Themes (5 Designs)
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {UI_DESIGNS.map(design => {
              const isSelected = currentDesign === design.id;
              return (
                <button
                  key={design.id}
                  type="button"
                  onClick={() => onSelectDesign(design.id)}
                  className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between gap-2 cursor-pointer ${
                    isSelected
                      ? 'border-indigo-600 dark:border-indigo-400 bg-indigo-50/70 dark:bg-indigo-950/40 ring-1 ring-indigo-500'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs"
                        style={{ backgroundColor: design.accentColor }}
                      />
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {design.name}
                      </span>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    )}
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                    {design.description}
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold">
                      {design.badge}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            Fertig
          </button>
        </div>
      </div>
    </div>
  );
};
