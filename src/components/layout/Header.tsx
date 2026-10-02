import React, { useRef } from 'react';
import {
  FilePlus,
  Trash2,
  RotateCcw,
  Sparkles,
  Download,
  Upload,
  Home,
  Accessibility,
  Undo2,
  Redo2,
  Sun,
  Moon,
  Palette,
  Keyboard,
  Globe,
  Monitor
} from 'lucide-react';
import { PRESET_GRAPHS } from '../../utils/presets';
import { UIDesign } from '../../types/theme';
import { LanguageCode, G20_LANGUAGES, TRANSLATIONS } from '../../utils/i18n';
import { ThemeMode } from '../modals/ThemeModal';

interface HeaderProps {
  onOpenStartScreen: () => void;
  onNewGraph: () => void;
  onClearAll: () => void;
  onResetView: () => void;
  onLoadPreset: (presetId: string) => void;
  onOpenExportModal: () => void;
  onExportProject: () => void;
  onImportProject: (file: File) => void;
  isHighContrast?: boolean;
  onToggleHighContrast?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  isDarkMode?: boolean;
  themeMode?: ThemeMode;
  onToggleDarkMode?: () => void;
  onCycleThemeMode?: () => void;
  onOpenThemeModal?: () => void;
  onOpenShortcutsModal?: () => void;
  currentDesign?: UIDesign;
  currentLanguage?: LanguageCode;
  onOpenLanguageModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenStartScreen,
  onNewGraph,
  onClearAll,
  onResetView,
  onLoadPreset,
  onOpenExportModal,
  onExportProject,
  onImportProject,
  isHighContrast,
  onToggleHighContrast,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  isDarkMode = false,
  themeMode = 'auto',
  onToggleDarkMode,
  onCycleThemeMode,
  onOpenThemeModal,
  onOpenShortcutsModal,
  currentDesign = 'studio',
  currentLanguage = 'de',
  onOpenLanguageModal
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.de;
  const currentLangInfo = G20_LANGUAGES.find(l => l.code === currentLanguage);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportProject(file);
      e.target.value = '';
    }
  };

  return (
    <header
      role="banner"
      className="theme-header h-13 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 flex items-center justify-between shrink-0 select-none z-30 shadow-2xs text-slate-800 dark:text-slate-100 transition-colors"
    >
      {/* Left: Brand & Navigation */}
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={onOpenStartScreen}
          className="flex items-center gap-2 group p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500"
          title="Startseite / Projekt-Menü öffnen"
          aria-label="Startseite und Projekt-Menü öffnen"
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
            <div className="grid grid-cols-2 gap-0.5 w-3.5 h-3.5">
              <div className="bg-white rounded-2xs" />
              <div className="bg-emerald-400 rounded-2xs" />
              <div className="bg-amber-400 rounded-2xs" />
              <div className="bg-white rounded-2xs" />
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white font-mono">
              PixelNode
            </span>
            <span className="text-[10px] font-mono font-semibold px-1 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              Studio
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={onOpenStartScreen}
          className="hidden sm:flex items-center gap-1 px-2 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          title="Zurück zur Startseite"
        >
          <Home className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>Startseite</span>
        </button>

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-0.5 hidden sm:block" />

        {/* Undo / Redo History Stack */}
        <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-1.5 rounded-md transition-colors ${
              canUndo
                ? 'text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 cursor-pointer shadow-2xs'
                : 'text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-50'
            }`}
            title="Rückgängig (Ctrl+Z)"
            aria-label="Aktion rückgängig machen (Ctrl+Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-1.5 rounded-md transition-colors ${
              canRedo
                ? 'text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 cursor-pointer shadow-2xs'
                : 'text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-50'
            }`}
            title="Wiederholen (Ctrl+Y oder Ctrl+Shift+Z)"
            aria-label="Aktion wiederholen (Ctrl+Y)"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Center: Clean Preset Dropdown */}
      <div className="hidden md:flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1">
        <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" aria-hidden="true" />
        <label htmlFor="preset-select" className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Vorlagen:
        </label>
        <select
          id="preset-select"
          onChange={(e) => {
            if (e.target.value) onLoadPreset(e.target.value);
          }}
          defaultValue=""
          className="text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 focus:outline-none focus:border-indigo-500 cursor-pointer max-w-[200px] truncate"
        >
          <option value="" disabled>Vorlage laden...</option>
          {PRESET_GRAPHS.map(p => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Right: Appearance, Graph Tools, File I/O & Export */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Appearance & Themes */}
        <div className="flex items-center gap-1">
          {onOpenLanguageModal && (
            <button
              type="button"
              onClick={onOpenLanguageModal}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer text-xs font-semibold"
              title={`${t.languageSelect}: ${currentLangInfo?.name || currentLanguage} (G20)`}
              aria-label="Sprachauswahl öffnen"
            >
              <span className="text-sm leading-none">{currentLangInfo?.flag || '🌐'}</span>
              <span className="font-mono uppercase text-[10px] hidden sm:inline">{currentLanguage}</span>
            </button>
          )}

          {onOpenThemeModal && (
            <button
              type="button"
              onClick={onOpenThemeModal}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              title={t.designs}
              aria-label="Design-Auswahl öffnen"
            >
              <Palette className="w-3.5 h-3.5 text-pink-500" />
            </button>
          )}

          {onOpenShortcutsModal && (
            <button
              type="button"
              onClick={onOpenShortcutsModal}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              title={t.shortcuts}
              aria-label="Tastenkürzel anpassen"
            >
              <Keyboard className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
            </button>
          )}

          {onCycleThemeMode ? (
            <button
              type="button"
              onClick={onCycleThemeMode}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              title={
                themeMode === 'auto'
                  ? `${t.systemAutoDetect} (${isDarkMode ? t.themeDark : t.themeLight})`
                  : themeMode === 'dark'
                  ? t.themeDark
                  : t.themeLight
              }
              aria-label="Darstellungsmodus wechseln"
            >
              {themeMode === 'auto' ? (
                <Monitor className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
              ) : isDarkMode ? (
                <Moon className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
              ) : (
                <Sun className="w-3.5 h-3.5 text-amber-500" />
              )}
            </button>
          ) : onToggleDarkMode && (
            <button
              type="button"
              onClick={onToggleDarkMode}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              title={isDarkMode ? "Hellmodus aktivieren" : "Dunkelmodus aktivieren"}
              aria-label={isDarkMode ? "Hellmodus aktivieren" : "Dunkelmodus aktivieren"}
            >
              {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-600" />}
            </button>
          )}

          {onToggleHighContrast && (
            <button
              type="button"
              onClick={onToggleHighContrast}
              aria-pressed={isHighContrast}
              className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                isHighContrast
                  ? 'bg-amber-400 text-black border-amber-500 font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={t.highContrast}
            >
              <Accessibility className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-0.5" />

        {/* Canvas & Graph Actions */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onNewGraph}
            className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title={t.newGraph}
          >
            <FilePlus className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">{t.newGraph}</span>
          </button>

          <button
            type="button"
            onClick={onResetView}
            className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title={t.centerView}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">{t.centerView}</span>
          </button>

          <button
            type="button"
            onClick={onClearAll}
            className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
            title={t.clearAll}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">{t.clearAll}</span>
          </button>
        </div>

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-0.5" />

        {/* Project JSON Save / Load */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleFileChange}
          className="hidden"
          aria-label="Projekt-JSON hochladen"
        />

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 rounded-lg shadow-2xs transition-colors cursor-pointer"
            title="Projektdatei (JSON) laden"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Laden</span>
          </button>

          <button
            type="button"
            onClick={onExportProject}
            className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 rounded-lg shadow-2xs transition-colors cursor-pointer"
            title="Projekt als JSON herunterladen"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">JSON</span>
          </button>
        </div>

        {/* Primary Export Button */}
        <button
          type="button"
          onClick={onOpenExportModal}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs hover:shadow active:scale-95 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-400"
          aria-label="Animation exportieren (GIF oder Spritesheet)"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Exportieren</span>
        </button>
      </div>
    </header>
  );
};
