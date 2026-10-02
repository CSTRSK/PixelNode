import React, { useRef, useEffect } from 'react';
import { AppNode, BlenderNodeData, PixelFrame } from '../../types/nodes';
import { Layers } from 'lucide-react';
import { renderFrameToCanvas } from '../../utils/pixelEngine';

interface BlenderNodeProps {
  node: AppNode;
  isSelected: boolean;
  previewFrame?: PixelFrame;
  onUpdateData: (data: Partial<BlenderNodeData>) => void;
  onSelect: () => void;
}

export const BlenderNode: React.FC<BlenderNodeProps> = ({
  node,
  isSelected,
  previewFrame,
  onUpdateData,
  onSelect
}) => {
  const data = node.data as BlenderNodeData;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (previewFrame && canvasRef.current) {
      renderFrameToCanvas(previewFrame, canvasRef.current, 4);
    }
  }, [previewFrame]);

  return (
    <div className="flex flex-col gap-2.5 p-3 select-none text-xs" onClick={onSelect}>
      <div className="flex items-center gap-3">
        <div className="relative rounded border border-slate-300 bg-pixel-checker-dense overflow-hidden shadow-inner shrink-0 w-16 h-16 flex items-center justify-center">
          {previewFrame ? (
            <canvas ref={canvasRef} width={64} height={64} className="pixelated block max-w-full max-h-full" />
          ) : (
            <Layers className="w-5 h-5 text-slate-300" />
          )}
        </div>

        <div className="flex flex-col gap-1.5 flex-1">
          <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-semibold">
            Blend Mode
          </label>
          <select
            value={data.blendMode || 'normal'}
            onChange={(e) => onUpdateData({ blendMode: e.target.value as any })}
            className="w-full text-xs font-medium bg-white border border-slate-200 rounded px-2 py-1 text-slate-800 shadow-2xs focus:outline-none focus:border-rose-400 capitalize"
          >
            <option value="normal">Normal (Alpha Over)</option>
            <option value="add">Additive (Glow)</option>
            <option value="multiply">Multiply (Shadow)</option>
            <option value="mask">Silhouette Mask</option>
          </select>

          <div className="flex items-center justify-between text-[11px] pt-0.5">
            <span className="text-slate-500 font-mono">Opacity:</span>
            <span className="font-mono font-medium text-slate-700">
              {Math.round((data.opacity ?? 1) * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={data.opacity ?? 1}
            onChange={(e) => onUpdateData({ opacity: parseFloat(e.target.value) })}
            className="w-full accent-rose-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
