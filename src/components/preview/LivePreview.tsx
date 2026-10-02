import React, { useRef, useEffect, useState } from 'react';
import { PixelFrame, AppNode, NodeConnection, SequencerNodeData } from '../../types/nodes';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Grid,
  Eye,
  Layers,
  Sparkles,
  Info,
  Sliders,
  Tv,
  Clock,
  ArrowLeftRight,
  RotateCcw
} from 'lucide-react';
import { renderFrameToCanvas, frameToImageData } from '../../utils/pixelEngine';

interface LivePreviewProps {
  frames: PixelFrame[];
  fps: number;
  isPlaying: boolean;
  activeFrameIndex: number;
  selectedNode: AppNode | null;
  allNodes: AppNode[];
  connections?: NodeConnection[];
  previewNodeId: string | null;
  onSelectPreviewSource: (nodeId: string | null) => void;
  onFpsChange: (fps: number) => void;
  onTogglePlay: () => void;
  onStepFrame: (direction: 1 | -1) => void;
  onSelectFrameIndex: (index: number) => void;
  onUpdateSelectedNodeTitle?: (title: string) => void;
  onUpdateNode?: (nodeId: string, partial: Partial<AppNode>) => void;
}

export const LivePreview: React.FC<LivePreviewProps> = ({
  frames,
  fps,
  isPlaying,
  activeFrameIndex,
  selectedNode,
  allNodes,
  connections = [],
  previewNodeId,
  onSelectPreviewSource,
  onFpsChange,
  onTogglePlay,
  onStepFrame,
  onSelectFrameIndex,
  onUpdateSelectedNodeTitle,
  onUpdateNode
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoomScale, setZoomScale] = useState(8); // 8x preview scale by default
  const [showGrid, setShowGrid] = useState(false);
  const [showChecker, setShowChecker] = useState(true);
  const [onionSkinning, setOnionSkinning] = useState(false);
  const [onionOpacity, setOnionOpacity] = useState(0.35); // 35% opacity default
  const [activeTab, setActiveTab] = useState<'preview' | 'inspector'>('preview');

  const currentFrame = frames[activeFrameIndex % Math.max(1, frames.length)];
  const resolution = currentFrame ? currentFrame.width : 16;

  // Find preview node name
  const currentStreamNode = previewNodeId ? allNodes.find(n => n.id === previewNodeId) : null;

  // Render to canvas with crisp nearest neighbor and onion skinning if enabled
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !currentFrame) return;

    const width = currentFrame.width * zoomScale;
    const height = currentFrame.height * zoomScale;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, width, height);

    // Helper to render an onion skin ghost frame at reduced opacity with optional subtle color tint
    const renderGhostFrame = (frame: PixelFrame, opacity: number, tintColor: { r: number, g: number, b: number }) => {
      const offCanvas = document.createElement('canvas');
      offCanvas.width = frame.width;
      offCanvas.height = frame.height;
      const offCtx = offCanvas.getContext('2d');
      if (!offCtx) return;

      const imgData = frameToImageData(frame);
      // Subtle color tint so animators clearly distinguish previous (past) vs next (future)
      for (let i = 0; i < imgData.data.length; i += 4) {
        if (imgData.data[i + 3] > 0) {
          imgData.data[i] = Math.round(imgData.data[i] * 0.45 + tintColor.r * 0.55);
          imgData.data[i + 1] = Math.round(imgData.data[i + 1] * 0.45 + tintColor.g * 0.55);
          imgData.data[i + 2] = Math.round(imgData.data[i + 2] * 0.45 + tintColor.b * 0.55);
        }
      }
      offCtx.putImageData(imgData, 0, 0);

      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.drawImage(offCanvas, 0, 0, width, height);
      ctx.restore();
    };

    // Onion skinning: render previous and next frames at reduced opacity behind the active frame
    if (onionSkinning && frames.length > 1) {
      // 1. Previous frame (ghost behind, blue-tinted)
      const prevIdx = (activeFrameIndex - 1 + frames.length) % frames.length;
      const prevFrame = frames[prevIdx];
      renderGhostFrame(prevFrame, onionOpacity, { r: 59, g: 130, b: 246 });

      // 2. Next frame (ghost ahead, emerald-tinted, if 3+ frames or distinct)
      if (frames.length > 2) {
        const nextIdx = (activeFrameIndex + 1) % frames.length;
        const nextFrame = frames[nextIdx];
        renderGhostFrame(nextFrame, onionOpacity, { r: 16, g: 185, b: 129 });
      }
    }

    // Render active frame on top at full 100% opacity
    const offscreen = document.createElement('canvas');
    offscreen.width = currentFrame.width;
    offscreen.height = currentFrame.height;
    const offCtx = offscreen.getContext('2d');
    if (offCtx) {
      offCtx.putImageData(frameToImageData(currentFrame), 0, 0);
      ctx.drawImage(offscreen, 0, 0, width, height);
    }

    // Render pixel grid lines if enabled
    if (showGrid && zoomScale >= 4) {
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
      ctx.lineWidth = 1;
      const cellW = zoomScale;
      const cellH = zoomScale;

      for (let x = 0; x <= width; x += cellW) {
        ctx.beginPath();
        ctx.moveTo(x + 0.5, 0);
        ctx.lineTo(x + 0.5, height);
        ctx.stroke();
      }
      for (let y = 0; y <= height; y += cellH) {
        ctx.beginPath();
        ctx.moveTo(0, y + 0.5);
        ctx.lineTo(width, y + 0.5);
        ctx.stroke();
      }
    }
  }, [currentFrame, zoomScale, showGrid, onionSkinning, activeFrameIndex, frames]);

  // Sequencer-specific inspector helper
  const isSequencerSelected = selectedNode?.type === 'SEQUENCER';
  const sequencerData = isSequencerSelected ? (selectedNode.data as SequencerNodeData) : null;
  const holdCounts = sequencerData?.holdCounts || {};

  const handleUpdateHoldForPort = (portId: string, count: number) => {
    if (!selectedNode || !onUpdateNode || !sequencerData) return;
    const nextCount = Math.max(1, Math.min(60, count));
    onUpdateNode(selectedNode.id, {
      data: {
        ...sequencerData,
        holdCounts: {
          ...holdCounts,
          [portId]: nextCount
        }
      }
    });
  };

  const handleBatchSetHold = (count: number) => {
    if (!selectedNode || !onUpdateNode || !sequencerData) return;
    const newHoldCounts: Record<string, number> = {};
    selectedNode.inputs.forEach(port => {
      newHoldCounts[port.id] = count;
    });
    onUpdateNode(selectedNode.id, {
      data: {
        ...sequencerData,
        holdCounts: newHoldCounts
      }
    });
  };

  const handleTogglePingPongInspector = () => {
    if (!selectedNode || !onUpdateNode || !sequencerData) return;
    const nextPingPong = !(sequencerData.pingPong === true || sequencerData.playbackMode === 'pingpong');
    onUpdateNode(selectedNode.id, {
      data: {
        ...sequencerData,
        pingPong: nextPingPong,
        playbackMode: nextPingPong ? 'pingpong' : 'loop'
      }
    });
  };

  return (
    <div className="theme-sidebar w-84 h-full border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0 select-none shadow-xs text-slate-800 dark:text-slate-100 transition-colors">
      {/* Top Tabs: Live View vs Selected Node Inspector */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={`flex-1 py-2.5 px-3 text-center border-b-2 flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
            activeTab === 'preview'
              ? 'border-indigo-600 text-indigo-700 dark:text-indigo-400 bg-white dark:bg-slate-900 font-bold'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Live Viewport</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('inspector')}
          className={`flex-1 py-2.5 px-3 text-center border-b-2 flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
            activeTab === 'inspector'
              ? 'border-indigo-600 text-indigo-700 dark:text-indigo-400 bg-white dark:bg-slate-900 font-bold'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Inspector {selectedNode ? `(${selectedNode.title})` : ''}</span>
        </button>
      </div>

      {activeTab === 'preview' ? (
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Stream Selector Bar (Allows picking any animation stream in project) */}
          <div className="p-2.5 bg-slate-50/80 dark:bg-slate-850/80 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1.5">
            <Tv className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 shrink-0">Stream:</span>
            <select
              value={previewNodeId || 'auto'}
              onChange={(e) => onSelectPreviewSource(e.target.value === 'auto' ? null : e.target.value)}
              className="w-full text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-slate-800 dark:text-slate-200 shadow-2xs focus:outline-none focus:border-indigo-500 cursor-pointer truncate"
            >
              <option value="auto">Auto (Follow Selected Node)</option>
              <optgroup label="Output Nodes">
                {allNodes.filter(n => n.type === 'OUTPUT').map(n => (
                  <option key={n.id} value={n.id}>
                    {n.title}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Sequencers / Timelines">
                {allNodes.filter(n => n.type === 'SEQUENCER').map(n => (
                  <option key={n.id} value={n.id}>
                    {n.title}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Modifiers & Layers">
                {allNodes.filter(n => n.type === 'TRANSFORM' || n.type === 'PALETTE' || n.type === 'BLENDER').map(n => (
                  <option key={n.id} value={n.id}>
                    {n.title}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Drawing Frames">
                {allNodes.filter(n => n.type === 'DRAWING').map(n => (
                  <option key={n.id} value={n.id}>
                    {n.title}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Main Viewport Container */}
          <div className="p-4 flex flex-col items-center justify-center bg-slate-100 border-b border-slate-200">
            <div
              className={`relative rounded-lg border border-slate-300 shadow-sm overflow-hidden flex items-center justify-center ${
                showChecker ? 'bg-pixel-checker' : 'bg-slate-900'
              }`}
              style={{
                width: `${resolution * zoomScale}px`,
                height: `${resolution * zoomScale}px`,
                maxWidth: '260px',
                maxHeight: '260px'
              }}
            >
              <canvas
                ref={canvasRef}
                className="pixelated block max-w-full max-h-full"
              />
            </div>

            {/* Readout info badge */}
            <div className="flex items-center gap-1.5 mt-3 text-xs text-slate-500 font-mono text-center">
              <span className="font-semibold text-slate-800">
                {currentStreamNode ? currentStreamNode.title : (selectedNode ? selectedNode.title : 'Output')}
              </span>
              <span>·</span>
              <span>
                Frame {frames.length > 0 ? (activeFrameIndex % frames.length) + 1 : 0} of {frames.length}
              </span>
              <span>·</span>
              <span>{fps} FPS</span>
            </div>
          </div>

          {/* Viewport Display Controls (Zoom, Grid, Checker, Onion) */}
          <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <span className="text-slate-400 font-mono text-[10px]">Scale:</span>
              {[4, 8, 12, 16].map(sc => (
                <button
                  key={sc}
                  type="button"
                  onClick={() => setZoomScale(sc)}
                  className={`px-1.5 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                    zoomScale === sc
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {sc}x
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowGrid(!showGrid)}
                className={`p-1.5 rounded transition-colors cursor-pointer ${
                  showGrid ? 'bg-indigo-100 text-indigo-700 font-semibold' : 'text-slate-500 hover:bg-slate-200'
                }`}
                title="Toggle Pixel Grid Lines"
              >
                <Grid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setShowChecker(!showChecker)}
                className={`p-1.5 rounded transition-colors cursor-pointer ${
                  showChecker ? 'bg-indigo-100 text-indigo-700 font-semibold' : 'text-slate-500 hover:bg-slate-200'
                }`}
                title="Toggle Transparency Checkerboard"
              >
                <Layers className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setOnionSkinning(!onionSkinning)}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                  onionSkinning
                    ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-200 border border-transparent'
                }`}
                title="Toggle Onion Skinning (Renders previous and next frames at reduced opacity)"
              >
                <Eye className="w-3.5 h-3.5 text-amber-600" />
                <span>Onion Skin</span>
              </button>
            </div>
          </div>

          {/* Onion Skin Legend & Opacity Options Bar (Shown when Onion Skin is active) */}
          {onionSkinning && (
            <div className="px-3.5 py-1.5 bg-amber-50/70 border-b border-amber-200/70 flex items-center justify-between text-[10px] font-mono text-slate-600 animate-in fade-in duration-100">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                  <span>Prev Ghost</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-slate-700 shrink-0" />
                  <span>Active (100%)</span>
                </div>
                {frames.length > 2 && (
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span>Next Ghost</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1">
                <span className="text-slate-400">Opacity:</span>
                {[0.2, 0.35, 0.5].map(op => (
                  <button
                    key={op}
                    type="button"
                    onClick={() => setOnionOpacity(op)}
                    className={`px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                      onionOpacity === op
                        ? 'bg-amber-600 text-white font-bold'
                        : 'bg-white border border-amber-200 text-amber-900 hover:bg-amber-100'
                    }`}
                  >
                    {Math.round(op * 100)}%
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Transport / Playback Controls */}
          <div className="p-4 flex flex-col gap-4">
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => onStepFrame(-1)}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 active:scale-95 transition-transform cursor-pointer"
                title="Step Backward (Left Arrow)"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onTogglePlay}
                className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-2 shadow-sm hover:shadow active:scale-95 transition-all text-xs cursor-pointer"
                title="Play/Pause (Space)"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>

              <button
                type="button"
                onClick={() => onStepFrame(1)}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 active:scale-95 transition-transform cursor-pointer"
                title="Step Forward (Right Arrow)"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            {/* FPS Speed Slider */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-300 font-medium">Playback Speed</span>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{fps} FPS</span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                value={fps}
                onChange={(e) => onFpsChange(parseInt(e.target.value, 10))}
                className="w-full accent-indigo-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>1 FPS</span>
                <span>8 (Slow)</span>
                <span>12 (Standard)</span>
                <span>24 FPS</span>
              </div>
            </div>

            {/* Frame Strip Scrubber */}
            <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 flex justify-between">
                <span>Frame Scrubber</span>
                <span className="font-mono text-slate-400">{frames.length} frames</span>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                {frames.map((_, idx) => {
                  const isActive = idx === (activeFrameIndex % frames.length);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => onSelectFrameIndex(idx)}
                      className={`w-8 h-8 rounded shrink-0 border flex items-center justify-center font-mono text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                          ? 'border-indigo-600 bg-indigo-600 text-white shadow-xs scale-105'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Selected Node Parameter Inspector */
        <div className="p-4 flex flex-col gap-4 overflow-y-auto flex-1 text-xs">
          {selectedNode ? (
            <div className="flex flex-col gap-4">
              {/* Header Title & Type */}
              <div className="flex flex-col gap-1 pb-3 border-b border-slate-200">
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-semibold">
                  Node Configuration
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={selectedNode.title}
                    onChange={(e) => onUpdateSelectedNodeTitle?.(e.target.value)}
                    className="w-full font-semibold text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded px-2 py-1 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-1">
                  Type: <span className="font-semibold text-indigo-600">{selectedNode.type}</span> · ID: {selectedNode.id}
                </div>
              </div>

              {/* SEQUENCER-SPECIFIC INSPECTOR: Frame Hold Count / Duration Mapping */}
              {isSequencerSelected && sequencerData && (
                <div className="flex flex-col gap-3 p-3 bg-violet-50/60 border border-violet-200/80 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-violet-900 font-bold text-xs">
                      <Clock className="w-4 h-4 text-violet-600" />
                      <span>Custom Frame Durations</span>
                    </div>
                    <span className="text-[10px] font-mono text-violet-600 bg-violet-100/70 px-1.5 py-0.5 rounded">
                      1 tick ≈ {Math.round(1000 / fps)}ms
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 leading-snug">
                    Override hold counts (ticks) for each individual frame port in this sequencer:
                  </p>

                  {/* Batch duration helpers */}
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
                    <span>Set all:</span>
                    <button
                      type="button"
                      onClick={() => handleBatchSetHold(1)}
                      className="px-2 py-0.5 rounded bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 cursor-pointer shadow-2xs font-semibold"
                    >
                      1 tick
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBatchSetHold(2)}
                      className="px-2 py-0.5 rounded bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 cursor-pointer shadow-2xs font-semibold"
                    >
                      2 ticks
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBatchSetHold(3)}
                      className="px-2 py-0.5 rounded bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 cursor-pointer shadow-2xs font-semibold"
                    >
                      3 ticks
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBatchSetHold(4)}
                      className="px-2 py-0.5 rounded bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 cursor-pointer shadow-2xs font-semibold"
                    >
                      4 ticks
                    </button>
                  </div>

                  {/* Per-Frame Port Duration Input Fields */}
                  <div className="flex flex-col gap-2 pt-1">
                    {selectedNode.inputs.map((port, idx) => {
                      const holdVal = holdCounts[port.id] ?? 1;
                      const conn = connections.find(c => c.toNodeId === selectedNode.id && c.toPortId === port.id);
                      const sourceNode = conn ? allNodes.find(n => n.id === conn.fromNodeId) : null;
                      const msVal = Math.round((holdVal * 1000) / fps);

                      return (
                        <div
                          key={port.id}
                          className="flex flex-col gap-1 p-2 bg-white rounded border border-violet-100 shadow-2xs"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="w-4 h-4 rounded-full bg-violet-600 text-white flex items-center justify-center text-[10px] font-mono font-bold shrink-0">
                                {idx + 1}
                              </span>
                              <span className="text-xs font-semibold text-slate-800 truncate">
                                {port.name}
                              </span>
                              {sourceNode && (
                                <span className="text-[10px] text-slate-400 truncate">
                                  ({sourceNode.title})
                                </span>
                              )}
                            </div>

                            <span className="text-[10px] font-mono text-slate-400 shrink-0">
                              {msVal}ms
                            </span>
                          </div>

                          {/* Direct Number Input + Stepper */}
                          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                            <div className="flex items-center gap-1 text-[11px] text-slate-600">
                              <span className="font-mono">Hold Ticks:</span>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleUpdateHoldForPort(port.id, holdVal - 1)}
                                className="w-5 h-5 flex items-center justify-center rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                              >
                                -
                              </button>

                              {/* Number input field for precise custom hold count */}
                              <input
                                type="number"
                                min="1"
                                max="60"
                                value={holdVal}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value, 10);
                                  if (!isNaN(val)) handleUpdateHoldForPort(port.id, val);
                                }}
                                className="w-12 h-6 text-center font-mono font-bold text-xs bg-slate-50 border border-slate-300 rounded focus:outline-none focus:border-violet-500 text-slate-900"
                              />

                              <button
                                type="button"
                                onClick={() => handleUpdateHoldForPort(port.id, holdVal + 1)}
                                className="w-5 h-5 flex items-center justify-center rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                              >
                                +
                              </button>

                              {/* Quick 1x / 2x / 3x / 4x multiplier buttons */}
                              <div className="flex items-center gap-0.5 ml-1 border-l border-slate-200 pl-1">
                                {[1, 2, 4].map(preset => (
                                  <button
                                    key={preset}
                                    type="button"
                                    onClick={() => handleUpdateHoldForPort(port.id, preset)}
                                    className={`px-1 py-0.5 text-[9px] font-mono rounded cursor-pointer ${
                                      holdVal === preset
                                        ? 'bg-violet-600 text-white font-bold'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                  >
                                    {preset}x
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Inspector Ping-Pong Toggle */}
                  <div className="flex items-center justify-between p-2 bg-white rounded border border-violet-100 mt-1">
                    <div className="flex items-center gap-1.5">
                      <ArrowLeftRight className="w-3.5 h-3.5 text-amber-600" />
                      <span className="text-xs font-semibold text-slate-800">Ping-Pong Bounce</span>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={sequencerData.pingPong === true || sequencerData.playbackMode === 'pingpong'}
                      onClick={handleTogglePingPongInspector}
                      className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out cursor-pointer ${
                        sequencerData.pingPong === true || sequencerData.playbackMode === 'pingpong'
                          ? 'bg-amber-500'
                          : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                          sequencerData.pingPong === true || sequencerData.playbackMode === 'pingpong'
                            ? 'translate-x-4'
                            : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              )}

              {/* Node-specific metadata stats */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-semibold">
                  Node Information
                </span>
                <div className="bg-slate-50 p-2.5 rounded border border-slate-200 flex flex-col gap-1.5">
                  <div className="flex justify-between text-slate-600">
                    <span>Input Ports:</span>
                    <span className="font-mono font-semibold">{selectedNode.inputs.length}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Output Ports:</span>
                    <span className="font-mono font-semibold">{selectedNode.outputs.length}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Canvas Position:</span>
                    <span className="font-mono font-semibold">{selectedNode.x}, {selectedNode.y}</span>
                  </div>
                </div>
              </div>

              <div className="bg-indigo-50 border border-indigo-200 text-indigo-900 p-2.5 rounded text-[11px] leading-relaxed">
                Tip: Click the eye icon in the node header on the canvas to preview this animation in the viewport!
              </div>
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center gap-2 text-slate-400">
              <Info className="w-8 h-8 stroke-1" />
              <p className="font-medium text-slate-600">No Node Selected</p>
              <p className="text-[11px] max-w-[200px]">
                Click on any node in the graph editor to inspect its parameters, ports, and custom settings.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
