import React, { useState } from 'react';
import { Globe, X, Check, Search } from 'lucide-react';
import { G20_LANGUAGES, LanguageCode, TRANSLATIONS } from '../../utils/i18n';

interface LanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: LanguageCode;
  onSelectLanguage: (lang: LanguageCode) => void;
}

export const LanguageModal: React.FC<LanguageModalProps> = ({
  isOpen,
  onClose,
  currentLanguage,
  onSelectLanguage
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.de;

  const filtered = G20_LANGUAGES.filter(item => {
    const q = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.nativeName.toLowerCase().includes(q) ||
      item.country.toLowerCase().includes(q) ||
      item.code.toLowerCase().includes(q)
    );
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="language-modal-title"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div className="theme-modal-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-md w-full p-6 text-slate-800 dark:text-slate-100 flex flex-col gap-4 max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 id="language-modal-title" className="text-base font-bold text-slate-900 dark:text-white">
                {t.languageSelect} / G20 Languages
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Wähle eine Sprache der G20-Staaten
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

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search language / Land suchen..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Languages Grid */}
        <div className="flex flex-col gap-1.5 overflow-y-auto max-h-80 pr-1">
          {filtered.map(item => {
            const isSelected = currentLanguage === item.code;
            return (
              <button
                key={item.code}
                type="button"
                onClick={() => {
                  onSelectLanguage(item.code);
                  onClose();
                }}
                className={`p-3 rounded-lg border text-left transition-all flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? 'border-indigo-600 dark:border-indigo-400 bg-indigo-50/70 dark:bg-indigo-950/40 font-bold'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl leading-none">{item.flag}</span>
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-900 dark:text-white font-semibold">
                      {item.nativeName}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      {item.name} · {item.country}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                    {item.code}
                  </span>
                  {isSelected && (
                    <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg cursor-pointer transition-all"
          >
            {t.done}
          </button>
        </div>
      </div>
    </div>
  );
};
