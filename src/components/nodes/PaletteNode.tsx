import React, { useRef, useEffect } from 'react';
import { AppNode, PaletteNodeData, PaletteName, PixelFrame } from '../../types/nodes';
import { RETRO_PALETTES } from '../../utils/palettes';
import { renderFrameToCanvas } from '../../utils/pixelEngine';

interface PaletteNodeProps {
  node: AppNode;
  isSelected: boolean;
  previewFrame?: PixelFrame;
  onUpdateData: (data: Partial<PaletteNodeData>) => void;
  onSelect: () => void;
}

export const PaletteNode: React.FC<PaletteNodeProps> = ({
  node,
  isSelected,
  previewFrame,
  onUpdateData,
  onSelect
}) => {
  const data = node.data as PaletteNodeData;
  const currentPalette = data.palette || 'gameboy';
  const paletteDef = RETRO_PALETTES[currentPalette] || RETRO_PALETTES.gameboy;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (previewFrame && canvasRef.current) {
      renderFrameToCanvas(previewFrame, canvasRef.current, 4);
    }
  }, [previewFrame]);

  return (
    <div className="flex flex-col gap-2.5 p-3 select-none text-xs" onClick={onSelect}>
      {/* Top row: Palette selector + Live thumbnail */}
      <div className="flex items-center gap-3">
        <div className="relative rounded border border-slate-300 bg-pixel-checker-dense overflow-hidden shadow-inner shrink-0 w-16 h-16 flex items-center justify-center">
          {previewFrame ? (
            <canvas ref={canvasRef} width={64} height={64} className="pixelated block max-w-full max-h-full" />
          ) : (
            <span className="text-[10px] text-slate-400 font-mono">No input</span>
          )}
        </div>

        <div className="flex flex-col gap-1.5 flex-1">
          <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-semibold">
            Color Palette
          </label>
          <select
            value={currentPalette}
            onChange={(e) => onUpdateData({ palette: e.target.value as PaletteName })}
            className="w-full text-xs font-medium bg-white border border-slate-200 rounded px-2 py-1 text-slate-800 shadow-2xs focus:outline-none focus:border-amber-400"
          >
            {Object.values(RETRO_PALETTES).map(p => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <div className="text-[10px] text-slate-500 truncate" title={paletteDef.description}>
            {paletteDef.description}
          </div>
        </div>
      </div>

      {/* Swatch strip */}
      <div className="flex flex-col gap-1 pt-1">
        <div className="text-[10px] font-mono text-slate-400">
          Palette Colors ({paletteDef.colors.length}):
        </div>
        <div className="flex items-center gap-1 flex-wrap p-1.5 bg-slate-50 border border-slate-200 rounded">
          {paletteDef.colors.map((c, i) => (
            <div
              key={i}
              className="w-4 h-4 rounded-xs border border-black/10 shrink-0 shadow-2xs"
              style={{ backgroundColor: c }}
              title={c}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
