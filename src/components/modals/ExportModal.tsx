import React, { useState, useRef, useEffect } from 'react';
import { PixelFrame, AppNode, NodeConnection } from '../../types/nodes';
import {
  exportSpriteSheetPNG,
  exportAnimatedGIF,
  exportProjectJSON,
  generateSpriteSheet
} from '../../utils/exporter';
import {
  X,
  FileImage,
  Film,
  FileCode,
  Download,
  Check,
  Loader2,
  Tv
} from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  frames: PixelFrame[];
  nodes: AppNode[];
  connections: NodeConnection[];
  nodeOutputs: Map<string, PixelFrame[]>;
  fps: number;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  frames,
  nodes,
  connections,
  nodeOutputs,
  fps
}) => {
  const [activeTab, setActiveTab] = useState<'spritesheet' | 'gif' | 'json'>('spritesheet');

  // Animation stream selection for export
  const [selectedStreamNodeId, setSelectedStreamNodeId] = useState<string>('current');

  // Active frames to export based on stream selection
  const exportFrames = (selectedStreamNodeId !== 'current' && nodeOutputs.has(selectedStreamNodeId))
    ? nodeOutputs.get(selectedStreamNodeId)!
    : frames;

  // Sprite Sheet Options
  const [sheetScale, setSheetScale] = useState(2);
  const [sheetColumns, setSheetColumns] = useState(0); // 0 = 1 row
  const [sheetPadding, setSheetPadding] = useState(0);
  const sheetCanvasRef = useRef<HTMLCanvasElement>(null);

  // GIF Options
  const [gifScale, setGifScale] = useState(4);
  const [gifFps, setGifFps] = useState(fps);
  const [gifTransparent, setGifTransparent] = useState(true);
  const [isExportingGif, setIsExportingGif] = useState(false);

  // JSON Options
  const [copied, setCopied] = useState(false);

  // Render Sprite Sheet Preview
  useEffect(() => {
    if (!isOpen || activeTab !== 'spritesheet' || !sheetCanvasRef.current) return;
    const canvas = sheetCanvasRef.current;
    const sheet = generateSpriteSheet(exportFrames, sheetScale, sheetColumns, sheetPadding);
    canvas.width = sheet.width;
    canvas.height = sheet.height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(sheet, 0, 0);
    }
  }, [isOpen, activeTab, exportFrames, sheetScale, sheetColumns, sheetPadding]);

  if (!isOpen) return null;

  const handleExportSheet = () => {
    exportSpriteSheetPNG(exportFrames, 'pixelnode_spritesheet.png', sheetScale, sheetColumns);
  };

  const handleExportGif = async () => {
    setIsExportingGif(true);
    try {
      await exportAnimatedGIF(exportFrames, gifFps, gifScale, 'pixelnode_animation.gif', gifTransparent);
    } catch (err) {
      console.error('Error exporting GIF:', err);
    } finally {
      setIsExportingGif(false);
    }
  };

  const handleCopyJson = () => {
    const jsonStr = JSON.stringify(
      {
        version: '1.0',
        name: 'pixelnode_project',
        fps,
        canvasResolution: exportFrames[0]?.width || 16,
        nodes,
        connections
      },
      null,
      2
    );
    navigator.clipboard.writeText(jsonStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 select-none animate-in fade-in duration-150">
      <div className="theme-modal-card bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl overflow-hidden flex flex-col text-slate-800 dark:text-slate-100">
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-800 font-mono">
              Export Animation & Assets
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-md cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stream Selector (Choose which animation to export) */}
        <div className="px-5 py-2.5 bg-indigo-50/50 border-b border-indigo-100 flex items-center gap-2">
          <Tv className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
          <span className="text-xs font-semibold text-indigo-950 shrink-0">Export Animation:</span>
          <select
            value={selectedStreamNodeId}
            onChange={(e) => setSelectedStreamNodeId(e.target.value)}
            className="w-full text-xs font-medium bg-white border border-indigo-200 rounded px-2 py-1 text-slate-800 shadow-2xs focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="current">Current Active Viewport Stream ({frames.length} frames)</option>
            {nodes.filter(n => n.type === 'OUTPUT' || n.type === 'SEQUENCER').map(n => {
              const stream = nodeOutputs.get(n.id) || [];
              return (
                <option key={n.id} value={n.id}>
                  {n.title} ({stream.length} frames)
                </option>
              );
            })}
          </select>
        </div>

        {/* Format Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50/50 text-xs font-semibold px-4 pt-2 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('spritesheet')}
            className={`pb-2.5 px-3 flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'spritesheet'
                ? 'border-indigo-600 text-indigo-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileImage className="w-4 h-4" />
            <span>Sprite Sheet (PNG)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('gif')}
            className={`pb-2.5 px-3 flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'gif'
                ? 'border-indigo-600 text-indigo-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>Animated GIF</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('json')}
            className={`pb-2.5 px-3 flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'json'
                ? 'border-indigo-600 text-indigo-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>Project (JSON)</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 flex-1 text-xs">
          {activeTab === 'spritesheet' && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="flex flex-col gap-1">
                  <label className="font-medium text-slate-700">Export Scale:</label>
                  <select
                    value={sheetScale}
                    onChange={(e) => setSheetScale(parseInt(e.target.value, 10))}
                    className="bg-white border border-slate-200 rounded px-2 py-1 text-slate-800 font-mono"
                  >
                    <option value={1}>1x (Original 1:1 Pixel Size)</option>
                    <option value={2}>2x (Crisp Upscale)</option>
                    <option value={4}>4x (Standard HD)</option>
                    <option value={8}>8x (High Res)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-medium text-slate-700">Layout Format:</label>
                  <select
                    value={sheetColumns}
                    onChange={(e) => setSheetColumns(parseInt(e.target.value, 10))}
                    className="bg-white border border-slate-200 rounded px-2 py-1 text-slate-800 font-mono"
                  >
                    <option value={0}>Horizontal Strip (1 Row)</option>
                    <option value={2}>2 Columns Grid</option>
                    <option value={4}>4 Columns Grid</option>
                    <option value={8}>8 Columns Grid</option>
                  </select>
                </div>
              </div>

              {/* Live Sprite Sheet Canvas Preview */}
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-mono text-slate-500">Sprite Sheet Preview ({exportFrames.length} frames):</span>
                <div className="max-h-48 overflow-auto p-3 bg-pixel-checker rounded-lg border border-slate-200 flex items-center justify-center">
                  <canvas ref={sheetCanvasRef} className="pixelated block shadow-xs" />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleExportSheet}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Sprite Sheet PNG</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'gif' && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="flex flex-col gap-1">
                  <label className="font-medium text-slate-700">Upscale Factor:</label>
                  <select
                    value={gifScale}
                    onChange={(e) => setGifScale(parseInt(e.target.value, 10))}
                    className="bg-white border border-slate-200 rounded px-2 py-1 text-slate-800 font-mono"
                  >
                    <option value={2}>2x</option>
                    <option value={4}>4x (Recommended)</option>
                    <option value={8}>8x (Large Social Display)</option>
                    <option value={12}>12x (Super Large)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-medium text-slate-700">FPS Rate:</label>
                  <select
                    value={gifFps}
                    onChange={(e) => setGifFps(parseInt(e.target.value, 10))}
                    className="bg-white border border-slate-200 rounded px-2 py-1 text-slate-800 font-mono"
                  >
                    <option value={6}>6 FPS</option>
                    <option value={8}>8 FPS</option>
                    <option value={10}>10 FPS</option>
                    <option value={12}>12 FPS (Default)</option>
                    <option value={15}>15 FPS</option>
                    <option value={24}>24 FPS</option>
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
                <input
                  type="checkbox"
                  checked={gifTransparent}
                  onChange={(e) => setGifTransparent(e.target.checked)}
                  className="accent-indigo-600 rounded"
                />
                <span>Preserve transparent background in GIF</span>
              </label>

              <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-lg text-indigo-900 text-[11px] leading-relaxed">
                Uses quantize-indexed GIF encoding preserving exact crisp pixel borders without anti-aliasing blur. Loops infinitely.
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  disabled={isExportingGif}
                  onClick={handleExportGif}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {isExportingGif ? <Loader2 className="w-4 h-4 animate-spin" /> : <Film className="w-4 h-4" />}
                  <span>{isExportingGif ? 'Encoding GIF...' : 'Generate & Download GIF'}</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'json' && (
            <div className="flex flex-col gap-3">
              <p className="text-slate-600 leading-relaxed">
                Save your full node graph, drawn pixel frames, sequencer timings, and connections into a portable JSON file.
              </p>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleCopyJson}
                  className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium rounded-lg flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <FileCode className="w-4 h-4" />}
                  <span>{copied ? 'Copied to Clipboard!' : 'Copy Project JSON'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => exportProjectJSON(nodes, connections, fps, exportFrames[0]?.width || 16)}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download .json file</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
