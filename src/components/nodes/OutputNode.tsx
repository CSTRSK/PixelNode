import React, { useRef, useEffect } from 'react';
import { AppNode, OutputNodeData, PixelFrame } from '../../types/nodes';
import { Play, Sparkles } from 'lucide-react';
import { renderFrameToCanvas } from '../../utils/pixelEngine';

interface OutputNodeProps {
  node: AppNode;
  isSelected: boolean;
  activeFrame?: PixelFrame;
  totalFramesCount: number;
  onUpdateData: (data: Partial<OutputNodeData>) => void;
  onSelect: () => void;
}

export const OutputNode: React.FC<OutputNodeProps> = ({
  node,
  isSelected,
  activeFrame,
  totalFramesCount,
  onUpdateData,
  onSelect
}) => {
  const data = node.data as OutputNodeData;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (activeFrame && canvasRef.current) {
      renderFrameToCanvas(activeFrame, canvasRef.current, 6);
    }
  }, [activeFrame]);

  return (
    <div className="flex flex-col gap-2.5 p-3 select-none text-xs" onClick={onSelect}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-indigo-700 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Active Output Sink</span>
        </div>
        <span className="text-[10px] font-mono text-slate-500 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded">
          {totalFramesCount} {totalFramesCount === 1 ? 'frame' : 'frames'}
        </span>
      </div>

      <div className="relative mx-auto rounded-md border border-indigo-200 bg-pixel-checker overflow-hidden shadow-xs w-28 h-28 flex items-center justify-center">
        {activeFrame ? (
          <canvas ref={canvasRef} width={96} height={96} className="pixelated block max-w-full max-h-full" />
        ) : (
          <div className="flex flex-col items-center gap-1 text-slate-400">
            <Play className="w-6 h-6 stroke-1" />
            <span className="text-[10px] font-mono">Connect Stream</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
        <span className="text-slate-500 font-mono">Terminal Target:</span>
        <span className="font-mono text-indigo-600 font-semibold flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> Live Viewport
        </span>
      </div>
    </div>
  );
};
