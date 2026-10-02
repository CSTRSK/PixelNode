import React from 'react';
import { Layers, Activity, GitBranch, Terminal, ShieldCheck, ExternalLink, Save } from 'lucide-react';

interface FooterProps {
  nodeCount: number;
  connectionCount: number;
  frameCount: number;
  fps: number;
  resolution: number;
  onOpenCookieSettings?: () => void;
  lastAutoSaveTime?: string | null;
  onManualSave?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  nodeCount,
  connectionCount,
  frameCount,
  fps,
  resolution,
  onOpenCookieSettings,
  lastAutoSaveTime,
  onManualSave
}) => {
  return (
    <footer
      role="contentinfo"
      className="theme-footer min-h-9 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-1 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-slate-500 dark:text-slate-400 shrink-0 select-none z-30 transition-colors"
    >
      {/* Required Copyright notice, AGPL-3.0 License & Official Legal Links */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-slate-700 dark:text-slate-300 font-medium">
          Copyright by cstrsk 2008 - 2026. All rights reserved.
        </span>
        <span className="text-slate-300 dark:text-slate-700">·</span>
        <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-[10px] border border-slate-200 dark:border-slate-700">
          AGPL-3.0
        </span>
        <span className="text-slate-300 dark:text-slate-700">·</span>
        <a
          href="https://cstrsk.de/Impressum.html"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-0.5 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 underline underline-offset-2 transition-colors focus-visible:ring-1 focus-visible:ring-indigo-500 rounded"
          title="Offizielles Impressum öffnen (cstrsk.de)"
        >
          <span>Impressum</span>
          <ExternalLink className="w-2.5 h-2.5 opacity-60" />
        </a>
        <span className="text-slate-300 dark:text-slate-700">·</span>
        <a
          href="https://cstrsk.de/dsvgo.html"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-0.5 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 underline underline-offset-2 transition-colors focus-visible:ring-1 focus-visible:ring-indigo-500 rounded"
          title="Offizielle Datenschutzerklärung öffnen (cstrsk.de)"
        >
          <span>Datenschutz (DSGVO)</span>
          <ExternalLink className="w-2.5 h-2.5 opacity-60" />
        </a>
        {onOpenCookieSettings && (
          <>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <button
              type="button"
              onClick={onOpenCookieSettings}
              className="flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 underline underline-offset-2 cursor-pointer focus-visible:ring-1 focus-visible:ring-indigo-500 rounded"
              title="Datenschutz- & Speicher-Einstellungen öffnen"
            >
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              <span>Cookies / Speicher</span>
            </button>
          </>
        )}
      </div>

      {/* Center: Auto-Save Status & Manual Save ("Sicherung usw. nach unten") */}
      <div
        role="status"
        aria-live="polite"
        className="flex items-center gap-2 px-2.5 py-1 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-full text-[11px] font-mono text-slate-600 dark:text-slate-300 shadow-2xs"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <span>
          Auto-Save: {lastAutoSaveTime ? `Gesichert ${lastAutoSaveTime}` : 'Aktiv (alle 30s)'}
        </span>
        {onManualSave && (
          <button
            type="button"
            onClick={onManualSave}
            className="flex items-center gap-1 text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline font-bold cursor-pointer ml-1 pl-1.5 border-l border-slate-200 dark:border-slate-700"
            title="Projektstand sofort im lokalen Browser-Speicher (localStorage) sichern"
          >
            <Save className="w-3 h-3" />
            <span>Jetzt sichern</span>
          </button>
        )}
      </div>

      {/* Right: Graph & Stream Stats */}
      <div className="hidden lg:flex items-center gap-3.5 text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1">
          <Layers className="w-3 h-3 text-slate-400" />
          <span>{nodeCount} Nodes</span>
        </div>

        <span>·</span>

        <div className="flex items-center gap-1">
          <GitBranch className="w-3 h-3 text-slate-400" />
          <span>{connectionCount} Wires</span>
        </div>

        <span>·</span>

        <div className="flex items-center gap-1">
          <Activity className="w-3 h-3 text-emerald-500" />
          <span>{frameCount} Frames @ {fps} FPS</span>
        </div>

        <span>·</span>

        <div className="flex items-center gap-1">
          <Terminal className="w-3 h-3 text-indigo-500" />
          <span>{resolution}x{resolution}</span>
        </div>
      </div>
    </footer>
  );
};
