import React, { useState, useRef, useEffect } from 'react';
import { AppNode, SubgraphNodeData, PixelFrame } from '../../types/nodes';
import { Package, UnfoldHorizontal, ChevronDown, ChevronUp, Eye, Layers } from 'lucide-react';
import { frameToImageData } from '../../utils/pixelEngine';

interface SubgraphNodeProps {
  node: AppNode;
  isSelected: boolean;
  activeFrame?: PixelFrame;
  onUngroup: (nodeId: string) => void;
  onSelect: () => void;
}

export const SubgraphNode: React.FC<SubgraphNodeProps> = ({
  node,
  isSelected,
  activeFrame,
  onUngroup,
  onSelect
}) => {
  const data = node.data as SubgraphNodeData;
  const innerNodes = data.innerNodes || [];
  const innerConnections = data.innerConnections || [];
  const [showInnerList, setShowInnerList] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Render thumbnail of current output frame
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !activeFrame) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const offscreen = document.createElement('canvas');
    offscreen.width = activeFrame.width;
    offscreen.height = activeFrame.height;
    const offCtx = offscreen.getContext('2d');
    if (offCtx) {
      offCtx.putImageData(frameToImageData(activeFrame), 0, 0);
      ctx.drawImage(offscreen, 0, 0, canvas.width, canvas.height);
    }
  }, [activeFrame]);

  // Compute summary of node types inside
  const nodeTypeCounts = innerNodes.reduce((acc, n) => {
    acc[n.type] = (acc[n.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flex flex-col gap-2 p-3 select-none" onClick={onSelect}>
      {/* Thumbnail + Info header */}
      <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
        <div className="w-12 h-12 rounded border border-slate-300 dark:border-slate-600 bg-pixel-checker-dense flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
          {activeFrame ? (
            <canvas ref={canvasRef} width={48} height={48} className="pixelated block" />
          ) : (
            <Package className="w-5 h-5 text-indigo-400" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
              {innerNodes.length} Verbundene Knoten
            </span>
          </div>
          <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">
            {innerConnections.length} interne Verbindungen
          </div>
        </div>
      </div>

      {/* Tags of inner node types */}
      <div className="flex flex-wrap gap-1 text-[10px] font-mono">
        {Object.entries(nodeTypeCounts).map(([type, count]) => (
          <span
            key={type}
            className="px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
          >
            {count}x {type}
          </span>
        ))}
      </div>

      {/* Action buttons: Ungroup & Toggle Inner List */}
      <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onUngroup(node.id);
          }}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-md font-semibold transition-colors cursor-pointer border border-indigo-200 dark:border-indigo-800"
          title="Gruppe entpacken und ursprüngliche Knoten wiederherstellen"
        >
          <UnfoldHorizontal className="w-3.5 h-3.5" />
          <span>Entpacken (Ungroup)</span>
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowInnerList(!showInnerList);
          }}
          className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
          title={showInnerList ? 'Knotenliste verbergen' : 'Knotenliste anzeigen'}
          aria-expanded={showInnerList}
        >
          {showInnerList ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Expandable Inner Nodes List */}
      {showInnerList && (
        <div className="flex flex-col gap-1 p-2 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-[11px] font-mono max-h-36 overflow-y-auto animate-in fade-in duration-100">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
            Enthaltene Knoten:
          </span>
          {innerNodes.map(inner => (
            <div key={inner.id} className="flex items-center justify-between py-0.5 text-slate-700 dark:text-slate-300">
              <span className="truncate">{inner.title}</span>
              <span className="text-[9px] text-slate-400 shrink-0">{inner.type}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
