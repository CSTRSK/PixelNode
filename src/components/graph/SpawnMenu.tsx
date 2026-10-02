import React, { useState, useRef, useEffect } from 'react';
import { NodeType } from '../../types/nodes';
import {
  Paintbrush,
  Film,
  SlidersHorizontal,
  Palette,
  Layers,
  MonitorPlay,
  Search,
  X
} from 'lucide-react';

interface SpawnMenuProps {
  x: number;
  y: number;
  onSpawn: (type: NodeType) => void;
  onClose: () => void;
}

interface NodeMenuItem {
  type: NodeType;
  name: string;
  category: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const NODE_CATALOG: NodeMenuItem[] = [
  {
    type: 'DRAWING',
    name: 'Drawing / Frame',
    category: 'Generators',
    description: 'Mini 16x16 pixel canvas editor with pencil, fill bucket, and swatches',
    icon: <Paintbrush className="w-4 h-4 text-emerald-600" />,
    color: 'emerald'
  },
  {
    type: 'SEQUENCER',
    name: 'Timeline / Sequencer',
    category: 'Timeline',
    description: 'Sequences frames with hold durations, loop, ping-pong, and reverse',
    icon: <Film className="w-4 h-4 text-violet-600" />,
    color: 'violet'
  },
  {
    type: 'TRANSFORM',
    name: 'Transform & FX',
    category: 'Modifiers',
    description: 'Pixel shifts, flips, 90° rotation, color invert, and retro outlines',
    icon: <SlidersHorizontal className="w-4 h-4 text-sky-600" />,
    color: 'sky'
  },
  {
    type: 'PALETTE',
    name: 'Retro Palette',
    category: 'Color',
    description: 'Remaps colors to Game Boy green, Pico-8, NES, or Cyberpunk Neon',
    icon: <Palette className="w-4 h-4 text-amber-600" />,
    color: 'amber'
  },
  {
    type: 'BLENDER',
    name: 'Layer Blender',
    category: 'Compositing',
    description: 'Combines two animation streams with Alpha, Additive, or Multiply modes',
    icon: <Layers className="w-4 h-4 text-rose-600" />,
    color: 'rose'
  },
  {
    type: 'OUTPUT',
    name: 'Output / Terminal',
    category: 'Render',
    description: 'Direct render sink feeding the live preview and export engine',
    icon: <MonitorPlay className="w-4 h-4 text-indigo-600" />,
    color: 'indigo'
  }
];

export const SpawnMenu: React.FC<SpawnMenuProps> = ({
  x,
  y,
  onSpawn,
  onClose
}) => {
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const filtered = NODE_CATALOG.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase()) ||
    item.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      ref={containerRef}
      style={{ left: `${x}px`, top: `${y}px` }}
      className="fixed z-50 w-72 bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden text-slate-800 animate-in fade-in zoom-in-95 duration-100"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header & Search */}
      <div className="p-2 border-b border-slate-100 flex items-center gap-1.5 bg-slate-50">
        <Search className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Spawn node (e.g. Frame, FX...)"
          className="w-full text-xs bg-transparent border-none focus:outline-none placeholder:text-slate-400 text-slate-800 font-medium"
        />
        <button
          type="button"
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-slate-600 rounded"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Node list */}
      <div className="max-h-80 overflow-y-auto p-1.5 flex flex-col gap-1">
        {filtered.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400 font-mono">
            No matching nodes
          </div>
        ) : (
          filtered.map(item => (
            <button
              key={item.type}
              type="button"
              onClick={() => {
                onSpawn(item.type);
                onClose();
              }}
              className="flex items-start gap-2.5 p-2 rounded-md hover:bg-slate-50 text-left transition-colors group cursor-pointer border border-transparent hover:border-slate-200"
            >
              <div className="p-1.5 rounded-md bg-slate-100 group-hover:bg-white shadow-2xs shrink-0 mt-0.5">
                {item.icon}
              </div>
              <div className="flex flex-col gap-0.5 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-slate-800 group-hover:text-indigo-600">
                    {item.name}
                  </span>
                  <span className="text-[9px] font-mono uppercase text-slate-400 bg-slate-100 px-1 rounded">
                    {item.category}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </button>
          ))
        )}
      </div>

      <div className="bg-slate-50 border-t border-slate-100 px-3 py-1.5 text-[10px] text-slate-400 font-mono flex items-center justify-between">
        <span>Click to insert at position</span>
        <span>Esc to cancel</span>
      </div>
    </div>
  );
};
