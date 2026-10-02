import React, { useRef, useEffect } from 'react';
import { AppNode, TransformNodeData, PixelFrame } from '../../types/nodes';
import { FlipHorizontal, FlipVertical, RotateCw, Sparkles } from 'lucide-react';
import { renderFrameToCanvas } from '../../utils/pixelEngine';

interface TransformNodeProps {
  node: AppNode;
  isSelected: boolean;
  previewFrame?: PixelFrame;
  onUpdateData: (data: Partial<TransformNodeData>) => void;
  onSelect: () => void;
}

export const TransformNode: React.FC<TransformNodeProps> = ({
  node,
  isSelected,
  previewFrame,
  onUpdateData,
  onSelect
}) => {
  const data = node.data as TransformNodeData;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (previewFrame && canvasRef.current) {
      renderFrameToCanvas(previewFrame, canvasRef.current, 4);
    }
  }, [previewFrame]);

  return (
    <div className="flex flex-col gap-2.5 p-3 select-none text-xs" onClick={onSelect}>
      {/* Top row: Live Mini Preview + Offset Sliders */}
      <div className="flex items-center gap-3">
        <div className="relative rounded border border-slate-300 bg-pixel-checker-dense overflow-hidden shadow-inner shrink-0 w-16 h-16 flex items-center justify-center">
          {previewFrame ? (
            <canvas ref={canvasRef} width={64} height={64} className="pixelated block max-w-full max-h-full" />
          ) : (
            <span className="text-[10px] text-slate-400 font-mono">No input</span>
          )}
        </div>

        <div className="flex flex-col gap-1.5 flex-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500 font-mono">Shift X:</span>
            <span className="font-mono font-medium text-slate-700">{data.shiftX ?? 0}px</span>
          </div>
          <input
            type="range"
            min="-8"
            max="8"
            value={data.shiftX ?? 0}
            onChange={(e) => onUpdateData({ shiftX: parseInt(e.target.value, 10) })}
            className="w-full accent-sky-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
          />

          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500 font-mono">Shift Y:</span>
            <span className="font-mono font-medium text-slate-700">{data.shiftY ?? 0}px</span>
          </div>
          <input
            type="range"
            min="-8"
            max="8"
            value={data.shiftY ?? 0}
            onChange={(e) => onUpdateData({ shiftY: parseInt(e.target.value, 10) })}
            className="w-full accent-sky-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
          />
        </div>
      </div>

      {/* Button toggles: Flip H, Flip V, Rotate, Wrap */}
      <div className="grid grid-cols-4 gap-1 pt-1">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onUpdateData({ flipH: !data.flipH }); }}
          className={`flex flex-col items-center justify-center py-1.5 rounded border transition-colors ${data.flipH ? 'bg-sky-50 border-sky-300 text-sky-700 font-medium' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white'}`}
          title="Flip Horizontal"
        >
          <FlipHorizontal className="w-3.5 h-3.5 mb-0.5" />
          <span className="text-[9px]">Flip H</span>
        </button>

        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onUpdateData({ flipV: !data.flipV }); }}
          className={`flex flex-col items-center justify-center py-1.5 rounded border transition-colors ${data.flipV ? 'bg-sky-50 border-sky-300 text-sky-700 font-medium' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white'}`}
          title="Flip Vertical"
        >
          <FlipVertical className="w-3.5 h-3.5 mb-0.5" />
          <span className="text-[9px]">Flip V</span>
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            const rots: (0 | 90 | 180 | 270)[] = [0, 90, 180, 270];
            const curIdx = rots.indexOf(data.rotate || 0);
            const nextRot = rots[(curIdx + 1) % rots.length];
            onUpdateData({ rotate: nextRot });
          }}
          className={`flex flex-col items-center justify-center py-1.5 rounded border transition-colors ${data.rotate ? 'bg-sky-50 border-sky-300 text-sky-700 font-medium' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white'}`}
          title="Rotate 90° clockwise"
        >
          <RotateCw className="w-3.5 h-3.5 mb-0.5" />
          <span className="text-[9px]">{data.rotate ? `${data.rotate}°` : '0°'}</span>
        </button>

        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onUpdateData({ wrapShift: !data.wrapShift }); }}
          className={`flex flex-col items-center justify-center py-1.5 rounded border transition-colors ${data.wrapShift ? 'bg-sky-50 border-sky-300 text-sky-700 font-medium' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white'}`}
          title="Wrap edges on shift"
        >
          <Sparkles className="w-3.5 h-3.5 mb-0.5" />
          <span className="text-[9px]">Wrap</span>
        </button>
      </div>

      {/* FX Options: Outline, Invert, Glitch */}
      <div className="flex flex-col gap-1.5 pt-1 border-t border-slate-100">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-slate-600">1px Outline:</span>
          <div className="flex items-center gap-1.5">
            <input
              type="color"
              value={data.outlineColor || '#000000'}
              disabled={!data.addOutline}
              onChange={(e) => onUpdateData({ outlineColor: e.target.value })}
              className="w-4 h-4 p-0 border border-slate-300 rounded cursor-pointer disabled:opacity-30"
            />
            <input
              type="checkbox"
              checked={data.addOutline || false}
              onChange={(e) => onUpdateData({ addOutline: e.target.checked })}
              className="accent-sky-600 rounded"
            />
          </div>
        </label>

        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-slate-600">Invert Colors:</span>
          <input
            type="checkbox"
            checked={data.invertColors || false}
            onChange={(e) => onUpdateData({ invertColors: e.target.checked })}
            className="accent-sky-600 rounded"
          />
        </label>
      </div>
    </div>
  );
};
