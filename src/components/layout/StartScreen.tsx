import React, { useRef } from 'react';
import {
  Play,
  RotateCcw,
  Sparkles,
  FilePlus,
  Upload,
  Eye,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
  Accessibility,
  Palette,
  Sun,
  Moon,
  Keyboard,
  Globe,
  Monitor
} from 'lucide-react';
import { PRESET_GRAPHS } from '../../utils/presets';
import { AutoSavePayload } from '../../utils/autoSave';
import { LanguageCode, G20_LANGUAGES, TRANSLATIONS } from '../../utils/i18n';
import { ThemeMode } from '../modals/ThemeModal';

interface StartScreenProps {
  autoSavedProject: AutoSavePayload | null;
  isHighContrast: boolean;
  onToggleHighContrast: () => void;
  onStartBlank: () => void;
  onResumeAutoSave: () => void;
  onSelectPreset: (presetId: string) => void;
  onImportFile: (file: File) => void;
  onOpenEditor: () => void;
  onOpenCookieSettings: () => void;
  onOpenThemeModal?: () => void;
  onOpenShortcutsModal?: () => void;
  onOpenLanguageModal?: () => void;
  currentLanguage?: LanguageCode;
  isDarkMode?: boolean;
  themeMode?: ThemeMode;
  onToggleDarkMode?: () => void;
  onCycleThemeMode?: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  autoSavedProject,
  isHighContrast,
  onToggleHighContrast,
  onStartBlank,
  onResumeAutoSave,
  onSelectPreset,
  onImportFile,
  onOpenEditor,
  onOpenCookieSettings,
  onOpenThemeModal,
  onOpenShortcutsModal,
  onOpenLanguageModal,
  currentLanguage = 'de',
  isDarkMode = false,
  themeMode = 'auto',
  onToggleDarkMode,
  onCycleThemeMode
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.de;
  const currentLangInfo = G20_LANGUAGES.find(l => l.code === currentLanguage);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportFile(file);
    }
  };

  return (
    <div
      role="region"
      aria-label="Startseite und Projekt-Auswahl"
      className="fixed inset-0 z-40 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-md overflow-y-auto flex flex-col justify-between text-slate-800 dark:text-slate-100 p-4 sm:p-8 animate-in fade-in duration-200 transition-colors"
    >
      {/* Hidden file input for project import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Projektdatei hochladen"
      />

      {/* Top Bar with Accessibility, Theme & Privacy Controls */}
      <header className="max-w-5xl w-full mx-auto flex items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-md">
            <div className="grid grid-cols-2 gap-1 w-5 h-5">
              <div className="bg-white rounded-xs" />
              <div className="bg-emerald-400 rounded-xs" />
              <div className="bg-amber-400 rounded-xs" />
              <div className="bg-white rounded-xs" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white font-mono">
                PixelNode Studio
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700 font-bold">
                v2.4 · AGPL-3.0
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Barrierefreier, node-basierter Sprite- und Pixel-Art-Animations-Editor
            </p>
          </div>
        </div>

        {/* Accessibility, Themes & Privacy Toggles */}
        <div className="flex items-center gap-2">
          {onOpenLanguageModal && (
            <button
              type="button"
              onClick={onOpenLanguageModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer shadow-2xs focus-visible:ring-2 focus-visible:ring-indigo-500"
              title={`${t.languageSelect}: ${currentLangInfo?.name || currentLanguage} (G20)`}
            >
              <Globe className="w-4 h-4 text-sky-500" />
              <span className="text-xs">{currentLangInfo?.flag}</span>
              <span className="font-mono uppercase text-[10px] hidden sm:inline">{currentLanguage}</span>
            </button>
          )}

          {onOpenThemeModal && (
            <button
              type="button"
              onClick={onOpenThemeModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer shadow-2xs focus-visible:ring-2 focus-visible:ring-indigo-500"
              title={t.designs}
            >
              <Palette className="w-4 h-4 text-pink-500" />
              <span className="hidden sm:inline">{t.designs}</span>
            </button>
          )}

          {onOpenShortcutsModal && (
            <button
              type="button"
              onClick={onOpenShortcutsModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer shadow-2xs focus-visible:ring-2 focus-visible:ring-indigo-500"
              title={t.shortcuts}
            >
              <Keyboard className="w-4 h-4 text-indigo-500" />
              <span className="hidden sm:inline">{t.shortcuts}</span>
            </button>
          )}

          {onCycleThemeMode ? (
            <button
              type="button"
              onClick={onCycleThemeMode}
              className="p-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer shadow-2xs focus-visible:ring-2 focus-visible:ring-indigo-500"
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
                <Monitor className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
              ) : isDarkMode ? (
                <Moon className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              ) : (
                <Sun className="w-4 h-4 text-amber-500" />
              )}
            </button>
          ) : onToggleDarkMode && (
            <button
              type="button"
              onClick={onToggleDarkMode}
              className="p-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer shadow-2xs focus-visible:ring-2 focus-visible:ring-indigo-500"
              title={isDarkMode ? "Hellmodus aktivieren" : "Dunkelmodus aktivieren"}
              aria-label={isDarkMode ? "Hellmodus aktivieren" : "Dunkelmodus aktivieren"}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
          )}

          <button
            type="button"
            onClick={onToggleHighContrast}
            aria-pressed={isHighContrast}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer shadow-2xs focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              isHighContrast
                ? 'bg-amber-400 text-black border-amber-300 font-bold'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
            title="Hohen Kontrast für barrierefreie Nutzung umschalten (WCAG 2.1 AA)"
          >
            <Accessibility className="w-4 h-4" />
            <span>{isHighContrast ? t.highContrastOn : t.highContrast}</span>
          </button>

          <button
            type="button"
            onClick={onOpenCookieSettings}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer shadow-2xs focus-visible:ring-2 focus-visible:ring-indigo-500"
            title="Datenschutz- & Speichereinstellungen öffnen (DSGVO)"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="hidden sm:inline">{t.privacy}</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl w-full mx-auto my-auto py-8 flex flex-col gap-8">
        {/* Hero Section */}
        <div className="text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              Erstelle lebendige 16x16 Pixel-Animationen mit visueller Knoten-Architektur.
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
              Verbinde Frames mit Sequencern, Live-Paletten, Transform-Effekten und Blending.
              Automatisches lokales Speichern alle 30 Sekunden schützt deine Entwürfe vor Datenverlust.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenEditor}
            className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg hover:shadow-indigo-500/25 active:scale-95 transition-all flex items-center gap-2 cursor-pointer focus-visible:ring-4 focus-visible:ring-indigo-400 shrink-0"
            aria-label="Editor direkt öffnen"
          >
            <span>{t.directToEditor}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Auto-Save Alert Card (if auto-save exists) */}
        {autoSavedProject && (
          <div className="bg-emerald-50/90 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-slate-900 dark:to-indigo-950/70 border-2 border-emerald-500/80 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md transition-colors">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    {t.autoSaveDetected}
                  </span>
                  <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.2 rounded font-mono font-bold">
                    Auto-Save
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  {t.autoSaveTime}: {autoSavedProject.dateFormatted} ({autoSavedProject.nodes.length} Nodes, {autoSavedProject.connections.length} Verbindungen)
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  {t.autoSaveInfo}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onResumeAutoSave}
              className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-400 shrink-0"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{t.autoSaveResume}</span>
            </button>
          </div>
        )}

        {/* Primary Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Blank Starter */}
          <div
            onClick={onStartBlank}
            className="group p-5 rounded-xl bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all cursor-pointer flex flex-col justify-between gap-4 shadow-sm hover:shadow-md focus-within:ring-2 focus-within:ring-indigo-500"
            tabIndex={0}
            role="button"
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onStartBlank(); } }}
            aria-label={t.blankProject}
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <FilePlus className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                {t.blankProject}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                {t.blankProjectDesc}
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              <span>{t.startNow}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Preset Templates */}
          <div className="p-5 rounded-xl bg-white dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700 flex flex-col justify-between gap-4 shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-bold">
                  {PRESET_GRAPHS.length} Vorlagen
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t.fromPreset}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                {t.fromPresetDesc}
              </p>

              <div className="flex flex-col gap-1.5 mt-3 max-h-56 overflow-y-auto pr-1">
                {PRESET_GRAPHS.map(preset => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => onSelectPreset(preset.id)}
                    className="flex items-center justify-between text-left p-2 rounded-lg bg-slate-50 dark:bg-slate-900/70 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 text-xs font-medium text-slate-800 dark:text-slate-200 hover:text-indigo-900 dark:hover:text-white transition-colors cursor-pointer group"
                  >
                    <div className="flex flex-col min-w-0 pr-1">
                      <span className="font-semibold truncate">{preset.name}</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{preset.category}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 shrink-0 group-hover:text-indigo-600 dark:group-hover:text-indigo-300">
                      {preset.fps} FPS
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Card 3: Import JSON */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="group p-5 rounded-xl bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all cursor-pointer flex flex-col justify-between gap-4 shadow-sm hover:shadow-md focus-within:ring-2 focus-within:ring-emerald-500"
            tabIndex={0}
            role="button"
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current?.click(); } }}
            aria-label={t.loadJson}
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Upload className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">
                {t.loadJson}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                {t.loadJsonDesc}
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <span>{t.selectFile}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* Feature & EU Accessibility Compliance Badges */}
        <div className="p-4 bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/80 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600 dark:text-slate-400 font-mono shadow-2xs transition-colors">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Automatisches Speichern alle 30 Sekunden</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>EU-Barrierefreiheitskonform (WCAG 2.1 AA / EN 301 549)</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>DSGVO / GDPR 100% ohne Tracking</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Tastatur-Navigation (<kbd className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white font-bold">B</kbd>, <kbd className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white font-bold">E</kbd>, <kbd className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white font-bold">F</kbd>)</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl w-full mx-auto pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 font-mono transition-colors">
        <div>
          <span>Copyright by cstrsk 2008 - 2026 · Lizenz: AGPL-3.0</span>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <a
            href="https://cstrsk.de/Impressum.html"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-indigo-600 dark:hover:text-slate-300 underline underline-offset-2 transition-colors"
          >
            Impressum
          </a>
          <span>·</span>
          <a
            href="https://cstrsk.de/dsvgo.html"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-indigo-600 dark:hover:text-slate-300 underline underline-offset-2 transition-colors"
          >
            Datenschutz (DSGVO)
          </a>
          <span>·</span>
          <button
            type="button"
            onClick={onOpenCookieSettings}
            className="hover:text-indigo-600 dark:hover:text-slate-300 underline underline-offset-2 cursor-pointer"
          >
            Datenschutz &amp; Speicher-Einstellungen
          </button>
        </div>
      </footer>
    </div>
  );
};
