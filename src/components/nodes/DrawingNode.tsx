import React, { useRef, useEffect, useState, useCallback } from 'react';
import { AppNode, DrawingNodeData, PixelFrame } from '../../types/nodes';
import { Pencil, Eraser, PaintBucket, Pipette, Trash2, FlipHorizontal, RotateCw, Copy } from 'lucide-react';
import { hexToRgb, rgbToHex } from '../../utils/palettes';
import { floodFill, drawLine, setPixel } from '../../utils/pixelEngine';
import { formatKeyShort, isKeyMatch } from '../../utils/shortcuts';

interface DrawingNodeProps {
  node: AppNode;
  isSelected: boolean;
  onUpdateData: (data: Partial<DrawingNodeData>) => void;
  onSelect: () => void;
  onDuplicateNode?: (node: AppNode) => void;
  shortcuts?: Record<string, string>;
  onOpenShortcutsModal?: () => void;
}

const QUICK_COLORS = [
  '#000000', '#ffffff', '#ef4444', '#f97316',
  '#eab308', '#22c55e', '#06b6d4', '#3b82f6',
  '#8b5cf6', '#ec4899', '#78350f', '#64748b'
];

export const DrawingNode: React.FC<DrawingNodeProps> = ({
  node,
  isSelected,
  onUpdateData,
  onSelect,
  onDuplicateNode,
  shortcuts,
  onOpenShortcutsModal
}) => {
  const data = node.data as DrawingNodeData;
  const size = data.canvasSize || 16;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const lastPixelRef = useRef<[number, number] | null>(null);

  const currentColor = data.currentColor || '#22c55e';
  const currentTool = data.currentTool || 'pencil';

  // Configured shortcut keys (defaulting to B, E, F, I)
  const brushKey = shortcuts?.['tool_brush'] || 'b';
  const eraserKey = shortcuts?.['tool_eraser'] || 'e';
  const bucketKey = shortcuts?.['tool_bucket'] || 'f';
  const pickerKey = shortcuts?.['tool_picker'] || 'i';

  // Helper to create a temp PixelFrame from current pixels
  const createTempFrame = useCallback((): PixelFrame => {
    const raw = data.pixels && data.pixels.length === size * size * 4
      ? data.pixels
      : new Array(size * size * 4).fill(0);
    return {
      id: 'temp',
      width: size,
      height: size,
      data: new Uint8ClampedArray(raw)
    };
  }, [data.pixels, size]);

  // Redraw mini canvas whenever data.pixels changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const pixelWidth = canvas.width / size;
    const pixelHeight = canvas.height / size;

    const pixels = data.pixels || [];
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const a = pixels[idx + 3] ?? 0;
        if (a > 0) {
          const r = pixels[idx] ?? 0;
          const g = pixels[idx + 1] ?? 0;
          const b = pixels[idx + 2] ?? 0;
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a / 255})`;
          ctx.fillRect(x * pixelWidth, y * pixelHeight, pixelWidth, pixelHeight);
        }
      }
    }
  }, [data.pixels, size]);

  // Convert canvas mouse coordinate to pixel coordinate (0 to size - 1)
  const getPixelCoords = (e: React.MouseEvent<HTMLCanvasElement>): [number, number] => {
    const canvas = canvasRef.current;
    if (!canvas) return [0, 0];
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(((e.clientX - rect.left) / rect.width) * size);
    const y = Math.floor(((e.clientY - rect.top) / rect.height) * size);
    return [
      Math.max(0, Math.min(size - 1, x)),
      Math.max(0, Math.min(size - 1, y))
    ];
  };

  // Canvas interactions
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.stopPropagation();
    onSelect();
    const [x, y] = getPixelCoords(e);
    lastPixelRef.current = [x, y];
    setIsDrawing(true);

    const frame = createTempFrame();
    const [r, g, b] = hexToRgb(currentColor);

    if (currentTool === 'picker') {
      const idx = (y * size + x) * 4;
      const a = frame.data[idx + 3];
      if (a > 0) {
        const hex = rgbToHex(frame.data[idx], frame.data[idx + 1], frame.data[idx + 2]);
        onUpdateData({ currentColor: hex, currentTool: 'pencil' });
      }
      setIsDrawing(false);
      return;
    }

    if (currentTool === 'bucket') {
      floodFill(frame, x, y, [r, g, b, 255]);
      onUpdateData({ pixels: Array.from(frame.data) });
      setIsDrawing(false);
      return;
    }

    // Pencil / Eraser
    if (currentTool === 'eraser') {
      setPixel(frame, x, y, 0, 0, 0, 0);
    } else {
      setPixel(frame, x, y, r, g, b, 255);
    }
    onUpdateData({ pixels: Array.from(frame.data) });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const [x, y] = getPixelCoords(e);
    if (!lastPixelRef.current) return;

    const [lastX, lastY] = lastPixelRef.current;
    if (x === lastX && y === lastY) return;

    const frame = createTempFrame();
    const [r, g, b] = hexToRgb(currentColor);
    const isErase = currentTool === 'eraser';
    const rgba: [number, number, number, number] = isErase ? [0, 0, 0, 0] : [r, g, b, 255];

    drawLine(frame, lastX, lastY, x, y, rgba);
    lastPixelRef.current = [x, y];
    onUpdateData({ pixels: Array.from(frame.data) });
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    lastPixelRef.current = null;
  };

  // Clear Canvas
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateData({ pixels: new Array(size * size * 4).fill(0) });
  };

  // Flip Horizontal
  const handleFlipH = useCallback(() => {
    const raw = data.pixels || new Array(size * size * 4).fill(0);
    const flipped = new Array(size * size * 4).fill(0);

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const srcIdx = (y * size + x) * 4;
        const dstIdx = (y * size + (size - 1 - x)) * 4;
        flipped[dstIdx] = raw[srcIdx];
        flipped[dstIdx + 1] = raw[srcIdx + 1];
        flipped[dstIdx + 2] = raw[srcIdx + 2];
        flipped[dstIdx + 3] = raw[srcIdx + 3];
      }
    }
    onUpdateData({ pixels: flipped });
  }, [data.pixels, size, onUpdateData]);

  // Rotate 90 deg clockwise
  const handleRotate = useCallback(() => {
    const raw = data.pixels || new Array(size * size * 4).fill(0);
    const rotated = new Array(size * size * 4).fill(0);

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const srcIdx = (y * size + x) * 4;
        const dstIdx = (x * size + (size - 1 - y)) * 4;
        rotated[dstIdx] = raw[srcIdx];
        rotated[dstIdx + 1] = raw[srcIdx + 1];
        rotated[dstIdx + 2] = raw[srcIdx + 2];
        rotated[dstIdx + 3] = raw[srcIdx + 3];
      }
    }
    onUpdateData({ pixels: rotated });
  }, [data.pixels, size, onUpdateData]);

  // Keyboard Shortcuts: 'B' for Brush/Pencil, 'E' for Eraser, 'F' for Fill Bucket, 'I' for Eyedropper
  useEffect(() => {
    if (!isSelected && !isHovered) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not trigger if typing in text inputs or textareas
      const target = e.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
        return;
      }

      // Ignore if modifier keys are pressed (e.g. Ctrl/Cmd for browser shortcuts)
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      if (isKeyMatch(e, brushKey) || e.key.toLowerCase() === 'p') {
        e.preventDefault();
        onUpdateData({ currentTool: 'pencil' });
      } else if (isKeyMatch(e, eraserKey)) {
        e.preventDefault();
        onUpdateData({ currentTool: 'eraser' });
      } else if (isKeyMatch(e, bucketKey) || e.key.toLowerCase() === 'g') {
        e.preventDefault();
        onUpdateData({ currentTool: 'bucket' });
      } else if (isKeyMatch(e, pickerKey)) {
        e.preventDefault();
        onUpdateData({ currentTool: 'picker' });
      } else if (e.key.toLowerCase() === 'h') {
        e.preventDefault();
        handleFlipH();
      } else if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        handleRotate();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSelected, isHovered, onUpdateData, handleFlipH, handleRotate]);

  return (
    <div
      className="flex flex-col gap-2 p-3 select-none"
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Mini canvas wrapper with checkerboard */}
      <div className="relative mx-auto rounded border border-slate-300 bg-pixel-checker-dense overflow-hidden shadow-inner cursor-crosshair">
        <canvas
          ref={canvasRef}
          width={144}
          height={144}
          className="pixelated block"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
        <div className="absolute top-1 right-1 pointer-events-none text-[9px] font-mono font-medium text-slate-500 bg-white/80 px-1 rounded">
          {size}x{size}
        </div>
      </div>

      {/* Tool toolbar with hotkey cues */}
      <div className="flex items-center justify-between gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-md text-xs border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-0.5">
          {/* Brush / Pencil */}
          <button
            type="button"
            title={`Brush Tool [${formatKeyShort(brushKey)}]`}
            onClick={(e) => { e.stopPropagation(); onUpdateData({ currentTool: 'pencil' }); }}
            className={`flex items-center gap-1 p-1.5 rounded transition-all cursor-pointer ${
              currentTool === 'pencil'
                ? 'bg-white dark:bg-slate-700 shadow-xs text-emerald-600 dark:text-emerald-400 font-bold ring-1 ring-emerald-500/20'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/60'
            }`}
          >
            <Pencil className="w-3.5 h-3.5" />
            <span className="text-[8px] font-mono font-bold opacity-75">{formatKeyShort(brushKey)}</span>
          </button>

          {/* Eraser */}
          <button
            type="button"
            title={`Eraser Tool [${formatKeyShort(eraserKey)}]`}
            onClick={(e) => { e.stopPropagation(); onUpdateData({ currentTool: 'eraser' }); }}
            className={`flex items-center gap-1 p-1.5 rounded transition-all cursor-pointer ${
              currentTool === 'eraser'
                ? 'bg-white dark:bg-slate-700 shadow-xs text-rose-600 dark:text-rose-400 font-bold ring-1 ring-rose-500/20'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/60'
            }`}
          >
            <Eraser className="w-3.5 h-3.5" />
            <span className="text-[8px] font-mono font-bold opacity-75">{formatKeyShort(eraserKey)}</span>
          </button>

          {/* Fill Bucket */}
          <button
            type="button"
            title={`Paint Bucket [${formatKeyShort(bucketKey)}]`}
            onClick={(e) => { e.stopPropagation(); onUpdateData({ currentTool: 'bucket' }); }}
            className={`flex items-center gap-1 p-1.5 rounded transition-all cursor-pointer ${
              currentTool === 'bucket'
                ? 'bg-white dark:bg-slate-700 shadow-xs text-amber-600 dark:text-amber-400 font-bold ring-1 ring-amber-500/20'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/60'
            }`}
          >
            <PaintBucket className="w-3.5 h-3.5" />
            <span className="text-[8px] font-mono font-bold opacity-75">{formatKeyShort(bucketKey)}</span>
          </button>

          {/* Eyedropper */}
          <button
            type="button"
            title={`Color Eyedropper [${formatKeyShort(pickerKey)}]`}
            onClick={(e) => { e.stopPropagation(); onUpdateData({ currentTool: 'picker' }); }}
            className={`flex items-center gap-1 p-1.5 rounded transition-all cursor-pointer ${
              currentTool === 'picker'
                ? 'bg-white dark:bg-slate-700 shadow-xs text-sky-600 dark:text-sky-400 font-bold ring-1 ring-sky-500/20'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/60'
            }`}
          >
            <Pipette className="w-3.5 h-3.5" />
            <span className="text-[8px] font-mono font-bold opacity-75">{formatKeyShort(pickerKey)}</span>
          </button>
        </div>

        <div className="flex items-center gap-0.5 border-l border-slate-200 dark:border-slate-700 pl-1">
          {onDuplicateNode && (
            <button
              type="button"
              title="Duplicate Frame (Clones pixel art into next frame)"
              onClick={(e) => { e.stopPropagation(); onDuplicateNode(node); }}
              className="p-1.5 text-slate-500 hover:text-indigo-600 rounded hover:bg-indigo-50 dark:hover:bg-indigo-950/40 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            title="Flip Horizontal (H)"
            onClick={(e) => { e.stopPropagation(); handleFlipH(); }}
            className="p-1.5 text-slate-500 hover:text-slate-900 rounded hover:bg-white/80 cursor-pointer"
          >
            <FlipHorizontal className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Rotate 90° Clockwise (R)"
            onClick={(e) => { e.stopPropagation(); handleRotate(); }}
            className="p-1.5 text-slate-500 hover:text-slate-900 rounded hover:bg-white/80 cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Clear Canvas"
            onClick={handleClear}
            className="p-1.5 text-slate-500 hover:text-rose-600 rounded hover:bg-rose-50 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Color Palette swatches */}
      <div className="flex items-center justify-between gap-1.5 pt-0.5">
        <div className="flex items-center gap-1 flex-wrap max-w-[150px]">
          {QUICK_COLORS.slice(0, 8).map(c => (
            <button
              key={c}
              type="button"
              onClick={(e) => { e.stopPropagation(); onUpdateData({ currentColor: c, currentTool: 'pencil' }); }}
              className={`w-4 h-4 rounded-xs border transition-transform cursor-pointer ${
                currentColor.toLowerCase() === c.toLowerCase()
                  ? 'scale-110 border-slate-900 ring-1 ring-slate-900 z-10'
                  : 'border-slate-300 hover:scale-105'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        {/* Custom hex color input */}
        <div className="flex items-center gap-1">
          <input
            type="color"
            value={currentColor}
            onChange={(e) => onUpdateData({ currentColor: e.target.value })}
            className="w-5 h-5 rounded cursor-pointer border border-slate-300 p-0 bg-transparent"
            title="Choose Custom Color"
          />
          <span className="text-[10px] font-mono text-slate-500 uppercase">
            {currentColor}
          </span>
        </div>
      </div>

      {/* Hotkey helper footer */}
      <div
        onClick={(e) => {
          if (onOpenShortcutsModal) {
            e.stopPropagation();
            onOpenShortcutsModal();
          }
        }}
        className={`flex items-center justify-between text-[9px] font-mono text-slate-400 dark:text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800 ${
          onOpenShortcutsModal ? 'hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors' : ''
        }`}
        title={onOpenShortcutsModal ? 'Klicke, um Tastenkürzel anzupassen' : undefined}
      >
        <span>Hotkeys:</span>
        <span className="text-slate-600 dark:text-slate-300 font-semibold truncate pl-1">
          [{formatKeyShort(brushKey)}] Pinsel · [{formatKeyShort(eraserKey)}] Radierer · [{formatKeyShort(bucketKey)}] Eimer · [{formatKeyShort(pickerKey)}] Pipette
        </span>
      </div>
    </div>
  );
};
