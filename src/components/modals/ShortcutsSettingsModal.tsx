import React, { useState, useEffect } from 'react';
import {
  Keyboard,
  X,
  RotateCcw,
  Sparkles,
  Paintbrush,
  Play,
  Layers,
  AlertCircle,
  Check
} from 'lucide-react';
import {
  DEFAULT_SHORTCUTS,
  ShortcutItem,
  formatKeyDisplay,
  saveShortcuts
} from '../../utils/shortcuts';
import { LanguageCode, TRANSLATIONS } from '../../utils/i18n';

interface ShortcutsSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  shortcuts: Record<string, string>;
  onUpdateShortcuts: (updated: Record<string, string>) => void;
  currentLanguage?: LanguageCode;
}

export const ShortcutsSettingsModal: React.FC<ShortcutsSettingsModalProps> = ({
  isOpen,
  onClose,
  shortcuts,
  onUpdateShortcuts,
  currentLanguage = 'de'
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'tools' | 'playback' | 'canvas'>('all');
  const [listeningForId, setListeningForId] = useState<string | null>(null);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.de;

  // Keyboard capture when listening for a new shortcut
  useEffect(() => {
    if (!listeningForId) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Escape cancels the rebinding
      if (e.key === 'Escape') {
        setListeningForId(null);
        return;
      }

      // Disallow pure modifier keys
      if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) {
        return;
      }

      let capturedKey = e.key;
      if (e.code === 'Space' || e.key === ' ') {
        capturedKey = 'Space';
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        capturedKey = e.key;
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        capturedKey = 'Delete';
      } else if (e.key.length === 1) {
        capturedKey = e.key.toLowerCase();
      }

      // Check for conflicts
      const existingConflict = Object.entries(shortcuts).find(
        ([id, key]) => id !== listeningForId && key.toLowerCase() === capturedKey.toLowerCase()
      );

      if (existingConflict) {
        const conflictingItem = DEFAULT_SHORTCUTS.find(s => s.id === existingConflict[0]);
        setConflictWarning(
          `Hinweis: Taste "${formatKeyDisplay(capturedKey)}" wird bereits für "${conflictingItem?.name || existingConflict[0]}" verwendet.`
        );
      } else {
        setConflictWarning(null);
      }

      const updated = {
        ...shortcuts,
        [listeningForId]: capturedKey
      };

      onUpdateShortcuts(updated);
      saveShortcuts(updated);
      setListeningForId(null);
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [listeningForId, shortcuts, onUpdateShortcuts]);

  if (!isOpen) return null;

  const handleResetSingle = (id: string) => {
    const def = DEFAULT_SHORTCUTS.find(s => s.id === id);
    if (!def) return;
    const updated = {
      ...shortcuts,
      [id]: def.defaultKey
    };
    onUpdateShortcuts(updated);
    saveShortcuts(updated);
    setConflictWarning(null);
  };

  const handleResetAll = () => {
    const defaults: Record<string, string> = {};
    DEFAULT_SHORTCUTS.forEach(s => {
      defaults[s.id] = s.defaultKey;
    });
    onUpdateShortcuts(defaults);
    saveShortcuts(defaults);
    setConflictWarning(null);
  };

  const filteredItems = DEFAULT_SHORTCUTS.filter(item => {
    if (activeTab === 'all') return true;
    return item.category === activeTab;
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-settings-title"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div className="theme-modal-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-xl w-full p-6 text-slate-800 dark:text-slate-100 flex flex-col gap-5 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h2 id="shortcuts-settings-title" className="text-base font-bold text-slate-900 dark:text-white">
                {t.shortcutsModalTitle}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t.shortcutsModalDesc}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Schließen"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'all'
                ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <span>{t.allShortcuts}</span>
            <span className="text-[10px] opacity-75 font-mono">({DEFAULT_SHORTCUTS.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tools')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'tools'
                ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Paintbrush className="w-3.5 h-3.5" />
            <span>{t.toolsCat} (B, E, F...)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('playback')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'playback'
                ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>{t.playbackCat}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('canvas')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'canvas'
                ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{t.canvasCat}</span>
          </button>
        </div>

        {/* Conflict Warning Notification */}
        {conflictWarning && (
          <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700 flex items-center gap-2 text-xs text-amber-800 dark:text-amber-200 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>{conflictWarning}</span>
          </div>
        )}

        {/* Shortcuts List */}
        <div className="flex flex-col gap-2 overflow-y-auto pr-1 max-h-80">
          {filteredItems.map(item => {
            const currentKey = shortcuts[item.id] || item.defaultKey;
            const isListening = listeningForId === item.id;
            const isModified = currentKey.toLowerCase() !== item.defaultKey.toLowerCase();

            return (
              <div
                key={item.id}
                className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                  isListening
                    ? 'border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/60 ring-2 ring-indigo-400/50'
                    : 'border-slate-200 dark:border-slate-700/80 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/70'
                }`}
              >
                {/* Left: Info */}
                <div className="flex flex-col gap-0.5 min-w-0 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {item.name}
                    </span>
                    {isModified && (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-semibold">
                        Angepasst
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                    {item.description}
                  </span>
                </div>

                {/* Right: Key Badge & Action */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setConflictWarning(null);
                      setListeningForId(isListening ? null : item.id);
                    }}
                    className={`min-w-24 px-3 py-1.5 rounded-lg border font-mono text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs ${
                      isListening
                        ? 'bg-amber-500 text-white border-amber-600 animate-pulse scale-105'
                        : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-800 dark:text-white hover:border-indigo-500 dark:hover:border-indigo-400'
                    }`}
                    title="Klicke, um eine neue Taste zuzuweisen"
                  >
                    {isListening ? (
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 animate-spin" />
                        <span>Taste drücken...</span>
                      </span>
                    ) : (
                      <span className="tracking-wide">{formatKeyDisplay(currentKey)}</span>
                    )}
                  </button>

                  {isModified && (
                    <button
                      type="button"
                      onClick={() => handleResetSingle(item.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                      title={`Auf Standard (${formatKeyDisplay(item.defaultKey)}) zurücksetzen`}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
          <button
            type="button"
            onClick={handleResetAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer font-medium"
            title="Alle Tastenkürzel auf die Originale zurücksetzen"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Standard wiederherstellen</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Fertig</span>
          </button>
        </div>
      </div>
    </div>
  );
};
