import React, { useRef, useState, useEffect, useCallback } from 'react';
import { AppNode, NodeConnection, NodeType, PixelFrame, NodePort } from '../../types/nodes';
import { BezierWire } from './BezierWire';
import { NodePortItem } from './NodePortItem';
import { SpawnMenu } from './SpawnMenu';
import { DrawingNode } from '../nodes/DrawingNode';
import { SequencerNode } from '../nodes/SequencerNode';
import { TransformNode } from '../nodes/TransformNode';
import { PaletteNode } from '../nodes/PaletteNode';
import { BlenderNode } from '../nodes/BlenderNode';
import { OutputNode } from '../nodes/OutputNode';
import { SubgraphNode } from '../nodes/SubgraphNode';
import {
  Paintbrush,
  Film,
  SlidersHorizontal,
  Palette,
  Layers,
  MonitorPlay,
  Trash2,
  Plus,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Eye,
  Package,
  UnfoldHorizontal
} from 'lucide-react';

interface NodeCanvasProps {
  nodes: AppNode[];
  connections: NodeConnection[];
  nodeOutputs: Map<string, PixelFrame[]>;
  activeOutputFrames: PixelFrame[];
  activeFrameIndex: number;
  selectedNodeId: string | null;
  selectedNodeIds?: string[];
  previewNodeId?: string | null;
  onSelectNode: (id: string | null) => void;
  onSelectNodes?: (ids: string[]) => void;
  onSetPreviewNode?: (id: string) => void;
  onUpdateNodes: (nodes: AppNode[]) => void;
  onUpdateNode: (nodeId: string, partial: Partial<AppNode>) => void;
  onUpdateConnections: (connections: NodeConnection[]) => void;
  onSpawnNode: (type: NodeType, x: number, y: number) => void;
  onDeleteNode: (id: string) => void;
  onDeleteConnection: (id: string) => void;
  onDuplicateNode?: (node: AppNode) => void;
  onAddAndLinkFrame?: (sequencerId: string, portId: string) => void;
  onGroupNodes?: (nodeIds: string[]) => void;
  onUngroupNode?: (nodeId: string) => void;
  shortcuts?: Record<string, string>;
  onOpenShortcutsModal?: () => void;
  spawnMenuPos?: { x: number; y: number } | null;
  onSetSpawnMenuPos?: (pos: { x: number; y: number } | null) => void;
}

interface DragState {
  isDraggingCanvas: boolean;
  startX: number;
  startY: number;
  draggingNodeId: string | null;
  nodeOffsetX: number;
  nodeOffsetY: number;
  initialNodePositions?: Map<string, { x: number; y: number }>;
}

interface PortWireDragState {
  fromNodeId: string;
  fromPortId: string;
  direction: 'input' | 'output';
  currentX: number;
  currentY: number;
  isClickMode?: boolean;
}

interface SelectionBox {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

export const NodeCanvas: React.FC<NodeCanvasProps> = ({
  nodes,
  connections,
  nodeOutputs,
  activeOutputFrames,
  activeFrameIndex,
  selectedNodeId,
  selectedNodeIds = [],
  previewNodeId,
  onSelectNode,
  onSelectNodes,
  onSetPreviewNode,
  onUpdateNodes,
  onUpdateNode,
  onUpdateConnections,
  onSpawnNode,
  onDeleteNode,
  onDeleteConnection,
  onDuplicateNode,
  onAddAndLinkFrame,
  onGroupNodes,
  onUngroupNode,
  shortcuts,
  onOpenShortcutsModal,
  spawnMenuPos: propSpawnMenuPos,
  onSetSpawnMenuPos
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Pan & Zoom
  const [pan, setPan] = useState({ x: 40, y: 40 });
  const [zoom, setZoom] = useState(1);

  // Marquee selection box state
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);

  // Dragging interaction state
  const [dragState, setDragState] = useState<DragState>({
    isDraggingCanvas: false,
    startX: 0,
    startY: 0,
    draggingNodeId: null,
    nodeOffsetX: 0,
    nodeOffsetY: 0
  });

  // Connecting wire from port
  const [wireDrag, setWireDrag] = useState<PortWireDragState | null>(null);

  // Context spawn menu (internal or controlled via props)
  const [internalSpawnMenuPos, setInternalSpawnMenuPos] = useState<{ x: number; y: number } | null>(null);
  const spawnMenuPos = propSpawnMenuPos !== undefined ? propSpawnMenuPos : internalSpawnMenuPos;
  const setSpawnMenuPos = onSetSpawnMenuPos || setInternalSpawnMenuPos;

  // Zoom with mouse wheel
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;

    const zoomFactor = 1.08;
    const delta = e.deltaY < 0 ? zoomFactor : 1 / zoomFactor;
    const newZoom = Math.max(0.3, Math.min(2.0, zoom * delta));

    // Zoom toward mouse pointer
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const newPanX = mouseX - (mouseX - pan.x) * (newZoom / zoom);
    const newPanY = mouseY - (mouseY - pan.y) * (newZoom / zoom);

    setZoom(newZoom);
    setPan({ x: newPanX, y: newPanY });
  };

  // Convert screen coordinates to canvas graph coordinates
  const clientToGraphCoords = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const canvasX = clientX - rect.left;
    const canvasY = clientY - rect.top;
    return {
      x: (canvasX - pan.x) / zoom,
      y: (canvasY - pan.y) / zoom
    };
  }, [pan, zoom]);

  // Reset pan/zoom
  const resetZoom = useCallback(() => {
    setPan({ x: 40, y: 40 });
    setZoom(1);
  }, []);

  // Listen to custom event for reset view
  useEffect(() => {
    const handleResetEvent = () => resetZoom();
    window.addEventListener('reset-canvas-view', handleResetEvent);
    return () => window.removeEventListener('reset-canvas-view', handleResetEvent);
  }, [resetZoom]);

  const zoomIn = () => setZoom(z => Math.min(2.0, z * 1.2));
  const zoomOut = () => setZoom(z => Math.max(0.3, z / 1.2));

  // Canvas background mouse down (Panning or Marquee box selection)
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button === 2) return; // Right click handled by context menu

    // Cancel any active wire click-to-connect mode
    if (wireDrag) {
      setWireDrag(null);
      return;
    }

    const graphCoords = clientToGraphCoords(e.clientX, e.clientY);

    // If shift is held or user drags on background: start marquee selection box
    if (e.shiftKey) {
      setSelectionBox({
        startX: graphCoords.x,
        startY: graphCoords.y,
        currentX: graphCoords.x,
        currentY: graphCoords.y
      });
      return;
    }

    // Default background pan
    setDragState({
      isDraggingCanvas: true,
      startX: e.clientX - pan.x,
      startY: e.clientY - pan.y,
      draggingNodeId: null,
      nodeOffsetX: 0,
      nodeOffsetY: 0
    });

    onSelectNode(null);
    if (onSelectNodes) onSelectNodes([]);
    setSpawnMenuPos(null);
  };

  // Handle Node header mouse down (node dragging with multi-selection support)
  const handleNodeMouseDown = (e: React.MouseEvent, node: AppNode) => {
    e.stopPropagation();

    // Multi-selection toggle with Shift or Ctrl/Cmd
    if (e.shiftKey || e.ctrlKey || e.metaKey) {
      const currentSelected = selectedNodeIds.length > 0 ? selectedNodeIds : (selectedNodeId ? [selectedNodeId] : []);
      const isAlreadySelected = currentSelected.includes(node.id);
      const nextSelected = isAlreadySelected
        ? currentSelected.filter(id => id !== node.id)
        : [...currentSelected, node.id];

      if (onSelectNodes) {
        onSelectNodes(nextSelected);
      }
      onSelectNode(nextSelected[nextSelected.length - 1] || null);
      return;
    }

    // If clicking a node that wasn't already in selectedNodeIds, make it the sole selection
    const isAlreadyInMulti = selectedNodeIds.includes(node.id);
    const activeSelected = isAlreadyInMulti ? selectedNodeIds : [node.id];
    onSelectNode(node.id);
    if (onSelectNodes && !isAlreadyInMulti) {
      onSelectNodes([node.id]);
    }

    setSpawnMenuPos(null);

    const graphCoords = clientToGraphCoords(e.clientX, e.clientY);

    // Snapshot initial positions of all currently selected nodes for group dragging
    const initialPositions = new Map<string, { x: number; y: number }>();
    nodes.forEach(n => {
      if (activeSelected.includes(n.id)) {
        initialPositions.set(n.id, { x: n.x, y: n.y });
      }
    });

    setDragState({
      isDraggingCanvas: false,
      startX: graphCoords.x,
      startY: graphCoords.y,
      draggingNodeId: node.id,
      nodeOffsetX: graphCoords.x - node.x,
      nodeOffsetY: graphCoords.y - node.y,
      initialNodePositions: initialPositions
    });
  };

  // Global mouse move
  const handleMouseMove = (e: React.MouseEvent) => {
    const graphCoords = clientToGraphCoords(e.clientX, e.clientY);

    // Marquee box selection drag
    if (selectionBox) {
      setSelectionBox(prev => prev ? {
        ...prev,
        currentX: graphCoords.x,
        currentY: graphCoords.y
      } : null);
      return;
    }

    // Canvas background panning
    if (dragState.isDraggingCanvas) {
      setPan({
        x: e.clientX - dragState.startX,
        y: e.clientY - dragState.startY
      });
      return;
    }

    // Node dragging (single or multi-selected group)
    if (dragState.draggingNodeId && dragState.initialNodePositions) {
      const dx = graphCoords.x - dragState.startX;
      const dy = graphCoords.y - dragState.startY;

      const initialPos = dragState.initialNodePositions;
      onUpdateNodes(
        nodes.map(n => {
          if (initialPos.has(n.id)) {
            const init = initialPos.get(n.id)!;
            return {
              ...n,
              x: Math.round(init.x + dx),
              y: Math.round(init.y + dy)
            };
          }
          return n;
        })
      );
    }

    // Wire dragging
    if (wireDrag) {
      setWireDrag(prev => prev ? { ...prev, currentX: graphCoords.x, currentY: graphCoords.y } : null);
    }
  };

  // Global mouse up
  const handleMouseUp = () => {
    // Finalize Marquee Selection Box
    if (selectionBox) {
      const x0 = Math.min(selectionBox.startX, selectionBox.currentX);
      const x1 = Math.max(selectionBox.startX, selectionBox.currentX);
      const y0 = Math.min(selectionBox.startY, selectionBox.currentY);
      const y1 = Math.max(selectionBox.startY, selectionBox.currentY);

      // Only perform selection if dragged more than 5px
      if (Math.abs(x1 - x0) > 5 || Math.abs(y1 - y0) > 5) {
        const intersectedIds: string[] = [];
        nodes.forEach(n => {
          const nw = n.width || 240;
          const nh = 260; // approximate node height
          const nx0 = n.x;
          const nx1 = n.x + nw;
          const ny0 = n.y;
          const ny1 = n.y + nh;

          // Check AABB collision
          if (nx0 < x1 && nx1 > x0 && ny0 < y1 && ny1 > y0) {
            intersectedIds.push(n.id);
          }
        });

        if (intersectedIds.length > 0) {
          if (onSelectNodes) onSelectNodes(intersectedIds);
          onSelectNode(intersectedIds[intersectedIds.length - 1]);
        }
      }
      setSelectionBox(null);
    }

    if (dragState.isDraggingCanvas || dragState.draggingNodeId) {
      setDragState(prev => ({
        ...prev,
        isDraggingCanvas: false,
        draggingNodeId: null,
        initialNodePositions: undefined
      }));
    }

    // Only cancel wireDrag on mouseUp if it wasn't started in click-to-connect mode
    if (wireDrag && !wireDrag.isClickMode) {
      setWireDrag(null);
    }
  };

  // Connect helper
  const completeConnection = (
    fromNodeId: string,
    fromPortId: string,
    toNodeId: string,
    toPortId: string
  ) => {
    if (fromNodeId === toNodeId) return;

    // Remove any existing connection targeting the same input port
    const filteredConns = connections.filter(
      c => !(c.toNodeId === toNodeId && c.toPortId === toPortId)
    );

    const newConnection: NodeConnection = {
      id: `conn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      fromNodeId,
      fromPortId,
      toNodeId,
      toPortId
    };

    onUpdateConnections([...filteredConns, newConnection]);
    setWireDrag(null);
  };

  // Port Click Handler (Click-to-Connect)
  const handlePortClick = (
    e: React.MouseEvent,
    nodeId: string,
    portId: string,
    direction: 'input' | 'output'
  ) => {
    e.stopPropagation();

    // If we are currently wiring
    if (wireDrag) {
      // If clicked the same port, cancel
      if (wireDrag.fromNodeId === nodeId && wireDrag.fromPortId === portId) {
        setWireDrag(null);
        return;
      }

      // If one is output and one is input
      if (wireDrag.direction === 'output' && direction === 'input') {
        completeConnection(wireDrag.fromNodeId, wireDrag.fromPortId, nodeId, portId);
        return;
      } else if (wireDrag.direction === 'input' && direction === 'output') {
        completeConnection(nodeId, portId, wireDrag.fromNodeId, wireDrag.fromPortId);
        return;
      } else {
        setWireDrag(null);
        return;
      }
    }

    // If NOT wiring:
    if (direction === 'input') {
      const existingConn = connections.find(c => c.toNodeId === nodeId && c.toPortId === portId);
      if (existingConn) {
        onDeleteConnection(existingConn.id);
        const coords = clientToGraphCoords(e.clientX, e.clientY);
        setWireDrag({
          fromNodeId: existingConn.fromNodeId,
          fromPortId: existingConn.fromPortId,
          direction: 'output',
          currentX: coords.x,
          currentY: coords.y,
          isClickMode: true
        });
        return;
      }
    }

    // Start wiring from this port
    const coords = clientToGraphCoords(e.clientX, e.clientY);
    setWireDrag({
      fromNodeId: nodeId,
      fromPortId: portId,
      direction,
      currentX: coords.x,
      currentY: coords.y,
      isClickMode: true
    });
  };

  // Port MouseDown (Drag-to-Connect)
  const handlePortMouseDown = (
    e: React.MouseEvent,
    nodeId: string,
    portId: string,
    direction: 'input' | 'output'
  ) => {
    e.stopPropagation();
    if (wireDrag) return;

    const coords = clientToGraphCoords(e.clientX, e.clientY);
    setWireDrag({
      fromNodeId: nodeId,
      fromPortId: portId,
      direction,
      currentX: coords.x,
      currentY: coords.y,
      isClickMode: false
    });
  };

  // Port MouseUp (Drop-to-Connect)
  const handlePortMouseUp = (
    e: React.MouseEvent,
    nodeId: string,
    portId: string,
    direction: 'input' | 'output'
  ) => {
    e.stopPropagation();
    if (!wireDrag) return;

    if (wireDrag.direction === 'output' && direction === 'input') {
      completeConnection(wireDrag.fromNodeId, wireDrag.fromPortId, nodeId, portId);
    } else if (wireDrag.direction === 'input' && direction === 'output') {
      completeConnection(nodeId, portId, wireDrag.fromNodeId, wireDrag.fromPortId);
    } else {
      setWireDrag(null);
    }
  };

  // Context Menu
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setSpawnMenuPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleSpawnFromMenu = (type: NodeType) => {
    if (!spawnMenuPos) return;
    const graphCoords = {
      x: (spawnMenuPos.x - pan.x) / zoom,
      y: (spawnMenuPos.y - pan.y) / zoom
    };
    onSpawnNode(type, Math.round(graphCoords.x), Math.round(graphCoords.y));
    setSpawnMenuPos(null);
  };

  const handleDeletePortConnections = (portId: string) => {
    connections
      .filter(c => c.fromPortId === portId || c.toPortId === portId)
      .forEach(c => onDeleteConnection(c.id));
  };

  // Calculate coordinates of ports for wire drawing
  const getPortCoords = useCallback((nodeId: string, portId: string): { x: number; y: number } | null => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return null;

    const isInput = node.inputs.some(p => p.id === portId);
    const isOutput = node.outputs.some(p => p.id === portId);
    if (!isInput && !isOutput) return null;

    const nodeWidth = node.width || 240;
    const headerHeight = 36;
    const portRowHeight = 22;

    if (isInput) {
      const idx = node.inputs.findIndex(p => p.id === portId);
      return {
        x: node.x + 8,
        y: node.y + headerHeight + 8 + idx * portRowHeight + 11
      };
    } else {
      const idx = node.outputs.findIndex(p => p.id === portId);
      return {
        x: node.x + nodeWidth - 8,
        y: node.y + headerHeight + 8 + idx * portRowHeight + 11
      };
    }
  }, [nodes]);

  // Effective multi-selection IDs
  const activeSelectedSet = new Set(
    selectedNodeIds.length > 0 ? selectedNodeIds : (selectedNodeId ? [selectedNodeId] : [])
  );

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label="Node Canvas Arbeitsfläche"
      onWheel={handleWheel}
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onContextMenu={handleContextMenu}
      className="flex-1 h-full bg-graph-grid relative overflow-hidden select-none cursor-default focus:outline-none"
      tabIndex={0}
    >
      {/* Floating Group Action Bar when 2+ nodes are selected */}
      {activeSelectedSet.size >= 2 && onGroupNodes && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5 bg-slate-900/95 dark:bg-slate-900/95 text-white px-4 py-2 rounded-xl shadow-xl border border-indigo-500/80 backdrop-blur-md animate-in fade-in slide-in-from-top-2">
          <Package className="w-4 h-4 text-indigo-400 shrink-0" />
          <span className="text-xs font-bold font-mono">
            {activeSelectedSet.size} Knoten ausgewählt
          </span>
          <button
            type="button"
            onClick={() => onGroupNodes(Array.from(activeSelectedSet))}
            className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer"
            title="Ausgewählte Knoten in einen Sub-Graph bündeln (Ctrl+G)"
          >
            <span>In Sub-Graph gruppieren</span>
            <kbd className="text-[10px] bg-indigo-800/80 px-1 py-0.2 rounded font-mono">Ctrl+G</kbd>
          </button>
        </div>
      )}

      {/* Canvas Transform Layer */}
      <div
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0'
        }}
        className="absolute inset-0 pointer-events-none"
      >
        {/* SVG Wire Layer */}
        <svg className="absolute inset-0 w-[10000px] h-[10000px] overflow-visible pointer-events-none z-10">
          {connections.map(conn => {
            const start = getPortCoords(conn.fromNodeId, conn.fromPortId);
            const end = getPortCoords(conn.toNodeId, conn.toPortId);
            if (!start || !end) return null;

            const isHighlighted = activeSelectedSet.has(conn.fromNodeId) || activeSelectedSet.has(conn.toNodeId);

            return (
              <BezierWire
                key={conn.id}
                id={conn.id}
                fromX={start.x}
                fromY={start.y}
                toX={end.x}
                toY={end.y}
                isSelected={isHighlighted}
                onDelete={() => onDeleteConnection(conn.id)}
              />
            );
          })}

          {/* Active dragged wire */}
          {wireDrag && (
            <path
              d={`M ${
                wireDrag.direction === 'output'
                  ? `${getPortCoords(wireDrag.fromNodeId, wireDrag.fromPortId)?.x || wireDrag.currentX} ${getPortCoords(wireDrag.fromNodeId, wireDrag.fromPortId)?.y || wireDrag.currentY}`
                  : `${wireDrag.currentX} ${wireDrag.currentY}`
              } C ${
                wireDrag.direction === 'output'
                  ? `${(getPortCoords(wireDrag.fromNodeId, wireDrag.fromPortId)?.x || wireDrag.currentX) + 60} ${getPortCoords(wireDrag.fromNodeId, wireDrag.fromPortId)?.y || wireDrag.currentY}`
                  : `${wireDrag.currentX + 60} ${wireDrag.currentY}`
              }, ${
                wireDrag.direction === 'output'
                  ? `${wireDrag.currentX - 60} ${wireDrag.currentY}`
                  : `${(getPortCoords(wireDrag.fromNodeId, wireDrag.fromPortId)?.x || wireDrag.currentX) - 60} ${getPortCoords(wireDrag.fromNodeId, wireDrag.fromPortId)?.y || wireDrag.currentY}`
              }, ${
                wireDrag.direction === 'output'
                  ? `${wireDrag.currentX} ${wireDrag.currentY}`
                  : `${getPortCoords(wireDrag.fromNodeId, wireDrag.fromPortId)?.x || wireDrag.currentX} ${getPortCoords(wireDrag.fromNodeId, wireDrag.fromPortId)?.y || wireDrag.currentY}`
              }`}
              fill="none"
              stroke="#6366f1"
              strokeWidth="2.5"
              strokeDasharray="6 4"
              className="animate-pulse"
            />
          )}

          {/* Marquee Selection Box Rectangle */}
          {selectionBox && (
            <rect
              x={Math.min(selectionBox.startX, selectionBox.currentX)}
              y={Math.min(selectionBox.startY, selectionBox.currentY)}
              width={Math.abs(selectionBox.currentX - selectionBox.startX)}
              height={Math.abs(selectionBox.currentY - selectionBox.startY)}
              fill="rgba(99, 102, 241, 0.12)"
              stroke="#6366f1"
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />
          )}
        </svg>

        {/* Nodes Layer */}
        {nodes.map(node => {
          const isSelected = activeSelectedSet.has(node.id);
          const isPreviewing = previewNodeId === node.id;
          const nodeOutputFrames = nodeOutputs.get(node.id) || [];
          const activeFrame = nodeOutputFrames[activeFrameIndex % Math.max(1, nodeOutputFrames.length)];

          return (
            <div
              key={node.id}
              style={{
                transform: `translate(${node.x}px, ${node.y}px)`,
                width: '240px'
              }}
              className={`theme-node-card absolute rounded-lg bg-white dark:bg-slate-900 border transition-shadow pointer-events-auto ${
                isSelected
                  ? 'border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
                  : isPreviewing
                  ? 'border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                  : 'border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                if (e.shiftKey || e.ctrlKey || e.metaKey) {
                  const current = Array.from(activeSelectedSet);
                  const next = current.includes(node.id)
                    ? current.filter(id => id !== node.id)
                    : [...current, node.id];
                  if (onSelectNodes) onSelectNodes(next);
                  onSelectNode(next[next.length - 1] || null);
                } else {
                  onSelectNode(node.id);
                  if (onSelectNodes) onSelectNodes([node.id]);
                }
              }}
            >
              {/* Node Header */}
              <div
                onMouseDown={(e) => handleNodeMouseDown(e, node)}
                data-type={node.type}
                className={`node-header flex items-center justify-between px-3 py-2 border-b rounded-t-lg cursor-move select-none ${
                  node.type === 'DRAWING' ? 'bg-emerald-50/80 dark:bg-emerald-950/50 border-emerald-200/70 dark:border-emerald-800/60 text-emerald-950 dark:text-emerald-200' :
                  node.type === 'SEQUENCER' ? 'bg-violet-50/80 dark:bg-violet-950/50 border-violet-200/70 dark:border-violet-800/60 text-violet-950 dark:text-violet-200' :
                  node.type === 'TRANSFORM' ? 'bg-sky-50/80 dark:bg-sky-950/50 border-sky-200/70 dark:border-sky-800/60 text-sky-950 dark:text-sky-200' :
                  node.type === 'PALETTE' ? 'bg-amber-50/80 dark:bg-amber-950/50 border-amber-200/70 dark:border-amber-800/60 text-amber-950 dark:text-amber-200' :
                  node.type === 'BLENDER' ? 'bg-rose-50/80 dark:bg-rose-950/50 border-rose-200/70 dark:border-rose-800/60 text-rose-950 dark:text-rose-200' :
                  node.type === 'SUBGRAPH' ? 'bg-indigo-100/90 dark:bg-indigo-950/70 border-indigo-300 dark:border-indigo-800 text-indigo-950 dark:text-indigo-200 font-bold' :
                  'bg-indigo-50/80 dark:bg-indigo-950/50 border-indigo-200/70 dark:border-indigo-800/60 text-indigo-950 dark:text-indigo-200'
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  {node.type === 'DRAWING' && <Paintbrush className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                  {node.type === 'SEQUENCER' && <Film className="w-3.5 h-3.5 text-violet-600 shrink-0" />}
                  {node.type === 'TRANSFORM' && <SlidersHorizontal className="w-3.5 h-3.5 text-sky-600 shrink-0" />}
                  {node.type === 'PALETTE' && <Palette className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                  {node.type === 'BLENDER' && <Layers className="w-3.5 h-3.5 text-rose-600 shrink-0" />}
                  {node.type === 'OUTPUT' && <MonitorPlay className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                  {node.type === 'SUBGRAPH' && <Package className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}

                  <span className="text-xs font-semibold truncate tracking-tight">{node.title}</span>
                </div>

                <div className="flex items-center gap-0.5">
                  {/* Eye preview button */}
                  {onSetPreviewNode && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSetPreviewNode(node.id);
                      }}
                      className={`p-1 rounded transition-colors ${
                        isPreviewing ? 'text-emerald-700 bg-emerald-100 font-bold' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                      title={isPreviewing ? 'Currently previewing in Viewport' : 'Preview this node in Viewport'}
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Ungroup button for Subgraph nodes */}
                  {node.type === 'SUBGRAPH' && onUngroupNode && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUngroupNode(node.id);
                      }}
                      className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded transition-colors"
                      title="Gruppe entpacken (Ctrl+Shift+G)"
                    >
                      <UnfoldHorizontal className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteNode(node.id);
                    }}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                    title="Delete node"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Ports Columns */}
              <div className="flex justify-between px-2 pt-1.5 pb-0.5 relative">
                {/* Input Ports (Left) */}
                <div className="flex flex-col gap-0.5">
                  {node.inputs.map(port => {
                    const isConnected = connections.some(c => c.toNodeId === node.id && c.toPortId === port.id);
                    const isValidTarget = !!wireDrag && wireDrag.direction === 'output' && wireDrag.fromNodeId !== node.id;
                    return (
                      <NodePortItem
                        key={port.id}
                        port={port}
                        nodeId={node.id}
                        isConnected={isConnected}
                        isConnecting={!!wireDrag}
                        isValidTarget={isValidTarget}
                        onPortClick={handlePortClick}
                        onPortMouseDown={handlePortMouseDown}
                        onPortMouseUp={handlePortMouseUp}
                      />
                    );
                  })}
                </div>

                {/* Output Ports (Right) */}
                <div className="flex flex-col gap-0.5 ml-auto">
                  {node.outputs.map(port => {
                    const isConnected = connections.some(c => c.fromNodeId === node.id && c.fromPortId === port.id);
                    const isValidTarget = !!wireDrag && wireDrag.direction === 'input' && wireDrag.fromNodeId !== node.id;
                    return (
                      <NodePortItem
                        key={port.id}
                        port={port}
                        nodeId={node.id}
                        isConnected={isConnected}
                        isConnecting={!!wireDrag}
                        isValidTarget={isValidTarget}
                        onPortClick={handlePortClick}
                        onPortMouseDown={handlePortMouseDown}
                        onPortMouseUp={handlePortMouseUp}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Node Main Body */}
              <div className="pb-1">
                {node.type === 'DRAWING' && (
                  <DrawingNode
                    node={node}
                    isSelected={isSelected}
                    onUpdateData={(partial) => {
                      onUpdateNode(node.id, { data: { ...node.data, ...partial } });
                    }}
                    onSelect={() => onSelectNode(node.id)}
                    onDuplicateNode={onDuplicateNode}
                    shortcuts={shortcuts}
                    onOpenShortcutsModal={onOpenShortcutsModal}
                  />
                )}

                {node.type === 'SEQUENCER' && (
                  <SequencerNode
                    node={node}
                    isSelected={isSelected}
                    connections={connections}
                    allNodes={nodes}
                    nodeOutputs={nodeOutputs}
                    activeOutputFrames={activeOutputFrames}
                    onUpdateNode={onUpdateNode}
                    onSelect={() => onSelectNode(node.id)}
                    onAddAndLinkFrame={onAddAndLinkFrame}
                    onDeletePortConnections={handleDeletePortConnections}
                  />
                )}

                {node.type === 'TRANSFORM' && (
                  <TransformNode
                    node={node}
                    isSelected={isSelected}
                    previewFrame={activeFrame}
                    onUpdateData={(partial) => {
                      onUpdateNode(node.id, { data: { ...node.data, ...partial } });
                    }}
                    onSelect={() => onSelectNode(node.id)}
                  />
                )}

                {node.type === 'PALETTE' && (
                  <PaletteNode
                    node={node}
                    isSelected={isSelected}
                    previewFrame={activeFrame}
                    onUpdateData={(partial) => {
                      onUpdateNode(node.id, { data: { ...node.data, ...partial } });
                    }}
                    onSelect={() => onSelectNode(node.id)}
                  />
                )}

                {node.type === 'BLENDER' && (
                  <BlenderNode
                    node={node}
                    isSelected={isSelected}
                    previewFrame={activeFrame}
                    onUpdateData={(partial) => {
                      onUpdateNode(node.id, { data: { ...node.data, ...partial } });
                    }}
                    onSelect={() => onSelectNode(node.id)}
                  />
                )}

                {node.type === 'OUTPUT' && (
                  <OutputNode
                    node={node}
                    isSelected={isSelected}
                    activeFrame={activeFrame}
                    totalFramesCount={activeOutputFrames.length}
                    onUpdateData={(partial) => {
                      onUpdateNode(node.id, { data: { ...node.data, ...partial } });
                    }}
                    onSelect={() => onSelectNode(node.id)}
                  />
                )}

                {node.type === 'SUBGRAPH' && (
                  <SubgraphNode
                    node={node}
                    isSelected={isSelected}
                    activeFrame={activeFrame}
                    onUngroup={onUngroupNode || (() => {})}
                    onSelect={() => onSelectNode(node.id)}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Canvas Controls (Bottom-Left) */}
      <div className="theme-canvas-controls absolute bottom-4 left-4 z-20 flex items-center gap-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs border border-slate-200 dark:border-slate-800 rounded-lg p-1 shadow-sm text-slate-600 dark:text-slate-300">
        <button
          type="button"
          onClick={zoomIn}
          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-700 dark:text-slate-200 cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={zoomOut}
          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-700 dark:text-slate-200 cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <span className="text-[11px] font-mono px-1 font-semibold text-slate-500 dark:text-slate-400">
          {Math.round(zoom * 100)}%
        </span>
        <button
          type="button"
          onClick={resetZoom}
          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-700 dark:text-slate-200 cursor-pointer"
          title="Reset Zoom & Pan"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Floating "+ Add Node" Button (Top-Left of graph) */}
      <div className="absolute top-4 left-4 z-20">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setSpawnMenuPos({ x: 70, y: 70 });
          }}
          className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Node</span>
        </button>
      </div>

      {/* Spawn Node Context Menu */}
      {spawnMenuPos && (
        <SpawnMenu
          x={spawnMenuPos.x}
          y={spawnMenuPos.y}
          onSpawn={handleSpawnFromMenu}
          onClose={() => setSpawnMenuPos(null)}
        />
      )}
    </div>
  );
};
