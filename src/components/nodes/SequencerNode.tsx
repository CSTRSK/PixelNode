import React, { useRef, useEffect } from 'react';
import { AppNode, SequencerNodeData, NodePort, PixelFrame, NodeConnection } from '../../types/nodes';
import { Plus, Trash2, Repeat, ArrowLeftRight, ArrowDownUp, Sparkles } from 'lucide-react';
import { renderFrameToCanvas } from '../../utils/pixelEngine';

interface SequencerNodeProps {
  node: AppNode;
  isSelected: boolean;
  connections: NodeConnection[];
  allNodes: AppNode[];
  nodeOutputs: Map<string, PixelFrame[]>;
  activeOutputFrames?: PixelFrame[];
  onUpdateNode: (nodeId: string, partial: Partial<AppNode>) => void;
  onSelect: () => void;
  onAddAndLinkFrame?: (sequencerId: string, portId: string) => void;
  onDeletePortConnections?: (nodeId: string, portId: string) => void;
}

export const SequencerNode: React.FC<SequencerNodeProps> = ({
  node,
  isSelected,
  connections,
  allNodes,
  nodeOutputs,
  onUpdateNode,
  onSelect,
  onAddAndLinkFrame,
  onDeletePortConnections
}) => {
  const data = node.data as SequencerNodeData;
  const holdCounts = data.holdCounts || {};
  const isPingPong = data.pingPong === true || data.playbackMode === 'pingpong';
  const playbackMode = data.playbackMode || (isPingPong ? 'pingpong' : 'loop');
  const miniCanvasRef = useRef<HTMLCanvasElement>(null);

  // Incoming connections to this sequencer
  const inConns = connections.filter(c => c.toNodeId === node.id);

  // Mini preview of the sequencer stream
  const sequencerStream = nodeOutputs.get(node.id) || [];
  useEffect(() => {
    if (sequencerStream.length > 0 && miniCanvasRef.current) {
      renderFrameToCanvas(sequencerStream[0], miniCanvasRef.current, 3);
    }
  }, [sequencerStream]);

  // Add slot reliably with atomic update
  const handleAddSlot = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newIndex = node.inputs.length + 1;
    const newPortId = `f_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
    const newPort: NodePort = {
      id: newPortId,
      name: `Frame ${newIndex}`,
      type: 'frame',
      direction: 'input'
    };

    const nextInputs = [...node.inputs, newPort];
    const currentOrder = data.frameOrder && data.frameOrder.length > 0
      ? data.frameOrder
      : node.inputs.map(p => p.id);
    const nextOrder = [...currentOrder, newPortId];
    const nextHold = { ...holdCounts, [newPortId]: 1 };

    onUpdateNode(node.id, {
      inputs: nextInputs,
      data: {
        ...data,
        frameOrder: nextOrder,
        holdCounts: nextHold
      }
    });
  };

  // Remove slot reliably
  const handleRemoveSlot = (e: React.MouseEvent, portId: string) => {
    e.stopPropagation();
    if (node.inputs.length <= 1) return;

    const nextInputs = node.inputs.filter(p => p.id !== portId);
    const nextOrder = (data.frameOrder || []).filter(id => id !== portId);
    const nextHold = { ...holdCounts };
    delete nextHold[portId];

    // Clean up connections for this port
    onDeletePortConnections?.(node.id, portId);

    onUpdateNode(node.id, {
      inputs: nextInputs,
      data: {
        ...data,
        frameOrder: nextOrder,
        holdCounts: nextHold
      }
    });
  };

  const updateHold = (portId: string, delta: number) => {
    const cur = holdCounts[portId] ?? 1;
    const next = Math.max(1, Math.min(10, cur + delta));
    onUpdateNode(node.id, {
      data: {
        ...data,
        holdCounts: { ...holdCounts, [portId]: next }
      }
    });
  };

  // Toggle Ping-Pong dedicated switch
  const handleTogglePingPong = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextPingPong = !isPingPong;
    onUpdateNode(node.id, {
      data: {
        ...data,
        pingPong: nextPingPong,
        playbackMode: nextPingPong ? 'pingpong' : 'loop'
      }
    });
  };

  // Mode cycle button
  const cyclePlaybackMode = (e: React.MouseEvent) => {
    e.stopPropagation();
    const modes: ('loop' | 'pingpong' | 'reverse')[] = ['loop', 'pingpong', 'reverse'];
    const nextIdx = (modes.indexOf(playbackMode) + 1) % modes.length;
    const nextMode = modes[nextIdx];
    onUpdateNode(node.id, {
      data: {
        ...data,
        playbackMode: nextMode,
        pingPong: nextMode === 'pingpong'
      }
    });
  };

  // Compute visual sequence flow representation
  const sequenceBreadcrumbs = () => {
    const count = node.inputs.length;
    if (count <= 1) return '1';
    if (isPingPong) {
      if (count === 2) return '1 ➔ 2 ➔ 1';
      if (count === 3) return '1 ➔ 2 ➔ 3 ➔ 2';
      return `1 ➔ ... ➔ ${count} ➔ ... ➔ 2`;
    }
    if (playbackMode === 'reverse') {
      return `${count} ➔ ... ➔ 1`;
    }
    return `1 ➔ ... ➔ ${count} ➔ 1`;
  };

  return (
    <div className="flex flex-col gap-2.5 p-3 select-none text-xs text-slate-800 dark:text-slate-100" onClick={onSelect}>
      {/* Top Bar: Playback Mode dropdown/cycle + Add Slot */}
      <div className="flex items-center justify-between gap-1 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-1.5 rounded-md">
        <button
          type="button"
          onClick={cyclePlaybackMode}
          className="flex items-center gap-1.5 px-2 py-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-200 font-medium capitalize cursor-pointer"
          title="Click to cycle Loop / Ping-Pong / Reverse"
        >
          {playbackMode === 'loop' && <Repeat className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />}
          {playbackMode === 'pingpong' && <ArrowLeftRight className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />}
          {playbackMode === 'reverse' && <ArrowDownUp className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
          <span>{playbackMode}</span>
        </button>

        <button
          type="button"
          onClick={handleAddSlot}
          className="flex items-center gap-1 px-2.5 py-1 rounded bg-violet-600 hover:bg-violet-700 text-white font-semibold transition-colors shadow-2xs cursor-pointer"
          title="Add a new input frame slot"
        >
          <Plus className="w-3 h-3 stroke-3" />
          <span>Add Slot</span>
        </button>
      </div>

      {/* Dedicated Ping-Pong Toggle Switch Card */}
      <div
        onClick={handleTogglePingPong}
        className={`flex items-center justify-between px-2.5 py-2 rounded-lg border transition-all cursor-pointer ${
          isPingPong
            ? 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 shadow-2xs'
            : 'bg-slate-50/80 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:bg-slate-100/70 dark:hover:bg-slate-800'
        }`}
      >
        <div className="flex items-center gap-2">
          <div className={`p-1 rounded ${isPingPong ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300' : 'bg-slate-200/80 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
            <ArrowLeftRight className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col">
            <span className={`text-[11px] font-bold ${isPingPong ? 'text-amber-900 dark:text-amber-300' : 'text-slate-700 dark:text-slate-200'}`}>
              Ping-Pong Playback
            </span>
            <span className="text-[9px] text-slate-500 dark:text-slate-400 font-mono">
              {isPingPong ? 'Alternating forward & bounce' : 'Standard unidirectional loop'}
            </span>
          </div>
        </div>

        {/* Custom Toggle Switch Pill */}
        <div
          role="switch"
          aria-checked={isPingPong}
          className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out cursor-pointer ${
            isPingPong ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-600'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
              isPingPong ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </div>
      </div>

      {/* Frame Inputs & Slots List */}
      <div className="flex flex-col gap-1.5 max-h-52 overflow-y-auto pr-0.5">
        <div className="flex items-center justify-between text-[10px] uppercase font-mono tracking-wider text-slate-400 dark:text-slate-400 font-semibold px-1">
          <span>Sequencer Slots ({node.inputs.length})</span>
          <span>Hold Ticks</span>
        </div>

        {node.inputs.map((port, idx) => {
          const hold = holdCounts[port.id] ?? 1;
          const conn = inConns.find(c => c.toPortId === port.id);
          const sourceNode = conn ? allNodes.find(n => n.id === conn.fromNodeId) : null;

          return (
            <div
              key={port.id}
              className={`flex items-center justify-between gap-1.5 px-2 py-1.5 rounded border transition-colors ${
                conn
                  ? 'bg-violet-50/50 dark:bg-violet-950/40 border-violet-200 dark:border-violet-800 text-slate-800 dark:text-slate-100'
                  : 'bg-white dark:bg-slate-800/60 border-dashed border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400'
              }`}
            >
              {/* Left: Index badge & Slot connection info */}
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <span className="w-4 h-4 rounded-full bg-violet-100 dark:bg-violet-900/60 text-violet-700 dark:text-violet-300 flex items-center justify-center text-[10px] font-mono font-bold shrink-0">
                  {idx + 1}
                </span>

                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">
                    {sourceNode ? sourceNode.title : port.name}
                  </span>
                  <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500 truncate">
                    {sourceNode ? 'Connected' : 'Empty (drag wire here)'}
                  </span>
                </div>
              </div>

              {/* Hold count stepper */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); updateHold(port.id, -1); }}
                  className="w-4 h-4 flex items-center justify-center rounded bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-200 font-bold cursor-pointer"
                  title="Decrease hold ticks"
                >
                  -
                </button>
                <span className="w-3 text-center font-mono font-semibold text-slate-800 dark:text-slate-100" title="Frames held per tick">
                  {hold}
                </span>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); updateHold(port.id, 1); }}
                  className="w-4 h-4 flex items-center justify-center rounded bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-200 font-bold cursor-pointer"
                  title="Increase hold ticks"
                >
                  +
                </button>

                {node.inputs.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => handleRemoveSlot(e, port.id)}
                    className="p-1 text-slate-400 hover:text-rose-500 rounded ml-0.5 cursor-pointer"
                    title="Remove this slot"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Helper: "+ Add & Wire New Frame" */}
      {onAddAndLinkFrame && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            const newIndex = node.inputs.length + 1;
            const newPortId = `f_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
            const newPort: NodePort = {
              id: newPortId,
              name: `Frame ${newIndex}`,
              type: 'frame',
              direction: 'input'
            };
            const nextInputs = [...node.inputs, newPort];
            const currentOrder = data.frameOrder && data.frameOrder.length > 0
              ? data.frameOrder
              : node.inputs.map(p => p.id);
            const nextOrder = [...currentOrder, newPortId];

            onUpdateNode(node.id, {
              inputs: nextInputs,
              data: {
                ...data,
                frameOrder: nextOrder,
                holdCounts: { ...holdCounts, [newPortId]: 1 }
              }
            });

            onAddAndLinkFrame(node.id, newPortId);
          }}
          className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-slate-100 dark:bg-slate-800/80 hover:bg-violet-50 dark:hover:bg-violet-950/40 text-slate-700 dark:text-slate-200 hover:text-violet-700 dark:hover:text-violet-300 rounded border border-dashed border-slate-300 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-700 font-medium transition-colors cursor-pointer text-[11px]"
        >
          <Sparkles className="w-3 h-3 text-violet-500 dark:text-violet-400" />
          <span>+ Spawn &amp; Wire Next Frame</span>
        </button>
      )}

      {/* Sequence path readout */}
      <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono pt-1 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-1">
          <span>Path:</span>
          <span className="font-semibold text-slate-700 dark:text-slate-200">{sequenceBreadcrumbs()}</span>
        </div>
        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${isPingPong ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300' : 'bg-violet-100 dark:bg-violet-950/80 text-violet-800 dark:text-violet-300'}`}>
          {isPingPong ? '🔀 Ping-Pong' : '🔁 Loop'}
        </span>
      </div>
    </div>
  );
};
