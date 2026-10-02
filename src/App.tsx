/**
 * @license
 * SPDX-License-Identifier: AGPL-3.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  AppNode,
  NodeConnection,
  NodeType,
  NodePort,
  DrawingNodeData,
  SequencerNodeData,
  SubgraphNodeData
} from './types/nodes';
import { UIDesign } from './types/theme';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { StartScreen } from './components/layout/StartScreen';
import { NodeCanvas } from './components/graph/NodeCanvas';
import { LivePreview } from './components/preview/LivePreview';
import { ExportModal } from './components/modals/ExportModal';
import { CookieBanner, getStoredConsent } from './components/modals/CookieBanner';
import { ThemeModal, ThemeMode } from './components/modals/ThemeModal';
import { ShortcutsSettingsModal } from './components/modals/ShortcutsSettingsModal';
import { LanguageModal } from './components/modals/LanguageModal';
import { evaluateGraph } from './utils/graphEvaluator';
import { PRESET_GRAPHS } from './utils/presets';
import { exportProjectJSON, parseProjectJSON } from './utils/exporter';
import { saveToLocalStorage, loadFromLocalStorage, AutoSavePayload } from './utils/autoSave';
import { useHistory } from './utils/useHistory';
import { loadShortcuts, isKeyMatch } from './utils/shortcuts';
import { LanguageCode, detectBrowserLanguage, saveSelectedLanguage } from './utils/i18n';

export default function App() {
  // Initialize with the iconic Bouncing Slime preset
  const defaultPreset = PRESET_GRAPHS[0];

  // Undo/Redo state stack management for nodes, connections, and fps
  const history = useHistory({
    nodes: defaultPreset.nodes,
    connections: defaultPreset.connections,
    fps: defaultPreset.fps || 8
  });

  const nodes = history.state.nodes;
  const connections = history.state.connections;
  const fps = history.state.fps;

  const setNodes = useCallback((action: AppNode[] | ((prev: AppNode[]) => AppNode[])) => {
    const nextNodes = typeof action === 'function' ? action(history.state.nodes) : action;
    history.record({ nodes: nextNodes, connections: history.state.connections, fps: history.state.fps });
  }, [history]);

  const setConnections = useCallback((action: NodeConnection[] | ((prev: NodeConnection[]) => NodeConnection[])) => {
    const nextConnections = typeof action === 'function' ? action(history.state.connections) : action;
    history.record({ nodes: history.state.nodes, connections: nextConnections, fps: history.state.fps });
  }, [history]);

  const setFps = useCallback((action: number | ((prev: number) => number)) => {
    const nextFps = typeof action === 'function' ? action(history.state.fps) : action;
    history.record({ nodes: history.state.nodes, connections: history.state.connections, fps: nextFps });
  }, [history]);

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [activeFrameIndex, setActiveFrameIndex] = useState<number>(0);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
  const [previewNodeId, setPreviewNodeId] = useState<string | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState<boolean>(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState<boolean>(false);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState<boolean>(false);
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>(() => detectBrowserLanguage());
  const [shortcuts, setShortcuts] = useState<Record<string, string>>(() => loadShortcuts());
  const [spawnMenuPos, setSpawnMenuPos] = useState<{ x: number; y: number } | null>(null);

  // Auto-Save, Start Screen & DSGVO/Accessibility state
  const [isStartScreenOpen, setIsStartScreenOpen] = useState<boolean>(true);
  const [isCookieBannerOpen, setIsCookieBannerOpen] = useState<boolean>(false);
  const [autoSavedProject, setAutoSavedProject] = useState<AutoSavePayload | null>(null);
  const [lastAutoSaveTime, setLastAutoSaveTime] = useState<string | null>(null);
  const [isHighContrast, setIsHighContrast] = useState<boolean>(() => {
    try {
      return localStorage.getItem('pixelnode_high_contrast') === 'true';
    } catch {
      return false;
    }
  });

  // Dark Mode, Auto-Detect System Theme & Visual Design Themes
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    try {
      const stored = localStorage.getItem('pixelnode_theme_mode');
      if (stored && ['auto', 'light', 'dark'].includes(stored)) return stored as ThemeMode;
    } catch {}
    return 'auto';
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const storedMode = localStorage.getItem('pixelnode_theme_mode');
      if (storedMode === 'dark') return true;
      if (storedMode === 'light') return false;
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  // Listen to OS system color scheme changes when in 'auto' mode
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (themeMode === 'auto') {
        setIsDarkMode(e.matches);
      }
    };

    if (themeMode === 'auto') {
      setIsDarkMode(mediaQuery.matches);
    } else if (themeMode === 'dark') {
      setIsDarkMode(true);
    } else if (themeMode === 'light') {
      setIsDarkMode(false);
    }

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [themeMode]);

  const handleSetThemeMode = useCallback((mode: ThemeMode) => {
    setThemeMode(mode);
    try {
      localStorage.setItem('pixelnode_theme_mode', mode);
    } catch {}
    if (mode === 'auto') {
      setIsDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
    } else {
      setIsDarkMode(mode === 'dark');
    }
  }, []);

  const handleCycleThemeMode = useCallback(() => {
    const nextMode: ThemeMode = themeMode === 'auto' ? 'light' : themeMode === 'light' ? 'dark' : 'auto';
    handleSetThemeMode(nextMode);
  }, [themeMode, handleSetThemeMode]);

  const handleSelectLanguage = useCallback((lang: LanguageCode) => {
    setCurrentLanguage(lang);
    saveSelectedLanguage(lang);
  }, []);

  const [currentDesign, setCurrentDesign] = useState<UIDesign>(() => {
    try {
      const stored = localStorage.getItem('pixelnode_ui_design');
      if (stored && ['studio', 'cyberpunk', 'gameboy', 'pico8', 'blueprint'].includes(stored)) {
        return stored as UIDesign;
      }
    } catch {}
    return 'studio';
  });

  // Sync dark class on documentElement for global styles
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Check consent & existing auto-save on initial mount
  useEffect(() => {
    const consent = getStoredConsent();
    if (!consent) {
      setIsCookieBannerOpen(true);
    }

    const saved = loadFromLocalStorage();
    if (saved) {
      setAutoSavedProject(saved);
      setLastAutoSaveTime(saved.dateFormatted);
    }
  }, []);

  // Determine effective preview target: user chosen previewNodeId > selectedNodeId (if valid) > null (fallback to output node)
  const effectivePreviewNodeId = useMemo(() => {
    if (previewNodeId && nodes.some(n => n.id === previewNodeId)) {
      return previewNodeId;
    }
    if (selectedNodeId && nodes.some(n => n.id === selectedNodeId)) {
      return selectedNodeId;
    }
    return null;
  }, [previewNodeId, selectedNodeId, nodes]);

  // Evaluate the node graph dynamically
  const { nodeOutputs, activeOutputFrames } = useMemo(() => {
    return evaluateGraph(nodes, connections, effectivePreviewNodeId);
  }, [nodes, connections, effectivePreviewNodeId]);

  // Selected node reference
  const selectedNode = useMemo(() => {
    return nodes.find(n => n.id === selectedNodeId) || null;
  }, [nodes, selectedNodeId]);

  // Auto-save graph to localStorage every 30 seconds
  useEffect(() => {
    const autoSaveTimer = setInterval(() => {
      const saved = saveToLocalStorage(nodes, connections, fps);
      if (saved) {
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setLastAutoSaveTime(timeStr);
        setAutoSavedProject(loadFromLocalStorage());
      }
    }, 30000); // 30 seconds

    return () => clearInterval(autoSaveTimer);
  }, [nodes, connections, fps]);

  const handleManualSave = useCallback(() => {
    const saved = saveToLocalStorage(nodes, connections, fps);
    if (saved) {
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastAutoSaveTime(timeStr);
      setAutoSavedProject(loadFromLocalStorage());
    }
  }, [nodes, connections, fps]);

  // Real-time animation playback loop
  useEffect(() => {
    if (!isPlaying || activeOutputFrames.length <= 1) return;

    const intervalMs = 1000 / Math.max(1, fps);
    const timer = setInterval(() => {
      setActiveFrameIndex(prev => (prev + 1) % activeOutputFrames.length);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, fps, activeOutputFrames.length]);

  // Reset frame index if stream length changes
  useEffect(() => {
    setActiveFrameIndex(0);
  }, [activeOutputFrames.length, effectivePreviewNodeId]);

  // Delete node and clean up orphan connections
  const handleDeleteNode = useCallback((id: string) => {
    const nextNodes = nodes.filter(n => n.id !== id);
    const nextConns = connections.filter(c => c.fromNodeId !== id && c.toNodeId !== id);
    history.record({ nodes: nextNodes, connections: nextConns, fps });
    if (selectedNodeId === id) setSelectedNodeId(null);
    setSelectedNodeIds(prev => prev.filter(item => item !== id));
    if (previewNodeId === id) setPreviewNodeId(null);
  }, [nodes, connections, fps, history, selectedNodeId, previewNodeId]);

  // Delete single connection wire
  const handleDeleteConnection = useCallback((connectionId: string) => {
    const nextConns = connections.filter(c => c.id !== connectionId);
    history.record({ nodes, connections: nextConns, fps });
  }, [nodes, connections, fps, history]);

  // Group multiple selected nodes into a Sub-Graph node
  const handleGroupNodes = useCallback((nodeIdsToGroup: string[]) => {
    if (nodeIdsToGroup.length < 2) return;

    const innerNodes = nodes.filter(n => nodeIdsToGroup.includes(n.id));
    const outerNodes = nodes.filter(n => !nodeIdsToGroup.includes(n.id));

    // Inner connections (both endpoints inside group)
    const innerConnections = connections.filter(
      c => nodeIdsToGroup.includes(c.fromNodeId) && nodeIdsToGroup.includes(c.toNodeId)
    );

    // Wires entering group from outside
    const incomingWires = connections.filter(
      c => !nodeIdsToGroup.includes(c.fromNodeId) && nodeIdsToGroup.includes(c.toNodeId)
    );

    // Wires leaving group to outside
    const outgoingWires = connections.filter(
      c => nodeIdsToGroup.includes(c.fromNodeId) && !nodeIdsToGroup.includes(c.toNodeId)
    );

    // Remaining connections outside the group
    const remainingConnections = connections.filter(
      c => !nodeIdsToGroup.includes(c.fromNodeId) && !nodeIdsToGroup.includes(c.toNodeId)
    );

    // Calculate center coordinates
    const minX = Math.min(...innerNodes.map(n => n.x));
    const maxX = Math.max(...innerNodes.map(n => n.x));
    const minY = Math.min(...innerNodes.map(n => n.y));
    const maxY = Math.max(...innerNodes.map(n => n.y));
    const centerX = Math.round((minX + maxX) / 2);
    const centerY = Math.round((minY + maxY) / 2);

    const subgroupId = `node_subgraph_${Date.now()}`;

    // Build input ports on Sub-Graph
    const inputs: NodePort[] = [];
    const inputMappings: { subgraphPortId: string; innerNodeId: string; innerPortId: string }[] = [];
    const newIncomingConns: NodeConnection[] = [];

    incomingWires.forEach((wire, idx) => {
      const portId = `in_sub_${idx + 1}`;
      inputs.push({
        id: portId,
        name: `In ${idx + 1}`,
        type: 'stream',
        direction: 'input'
      });
      inputMappings.push({
        subgraphPortId: portId,
        innerNodeId: wire.toNodeId,
        innerPortId: wire.toPortId
      });
      newIncomingConns.push({
        id: `conn_in_${Date.now()}_${idx}`,
        fromNodeId: wire.fromNodeId,
        fromPortId: wire.fromPortId,
        toNodeId: subgroupId,
        toPortId: portId
      });
    });

    // Build output ports on Sub-Graph
    const outputs: NodePort[] = [];
    const outputMappings: { subgraphPortId: string; innerNodeId: string; innerPortId: string }[] = [];
    const newOutgoingConns: NodeConnection[] = [];

    if (outgoingWires.length > 0) {
      outgoingWires.forEach((wire, idx) => {
        const portId = `out_sub_${idx + 1}`;
        outputs.push({
          id: portId,
          name: `Out ${idx + 1}`,
          type: 'stream',
          direction: 'output'
        });
        outputMappings.push({
          subgraphPortId: portId,
          innerNodeId: wire.fromNodeId,
          innerPortId: wire.fromPortId
        });
        newOutgoingConns.push({
          id: `conn_out_${Date.now()}_${idx}`,
          fromNodeId: subgroupId,
          fromPortId: portId,
          toNodeId: wire.toNodeId,
          toPortId: wire.toPortId
        });
      });
    } else {
      const portId = 'out_stream';
      outputs.push({
        id: portId,
        name: 'Stream Out',
        type: 'stream',
        direction: 'output'
      });
      const lastInner = innerNodes[innerNodes.length - 1];
      outputMappings.push({
        subgraphPortId: portId,
        innerNodeId: lastInner.id,
        innerPortId: lastInner.outputs[0]?.id || 'out_stream'
      });
    }

    const subgraphNode: AppNode = {
      id: subgroupId,
      type: 'SUBGRAPH',
      title: `Sub-Graph (${innerNodes.length} Knoten)`,
      x: centerX,
      y: centerY,
      inputs,
      outputs,
      data: {
        innerNodes,
        innerConnections,
        inputMappings,
        outputMappings,
        description: `${innerNodes.length} Knoten gebündelt`,
        collapsed: true
      }
    };

    const nextNodes = [...outerNodes, subgraphNode];
    const nextConnections = [...remainingConnections, ...newIncomingConns, ...newOutgoingConns];

    history.record({ nodes: nextNodes, connections: nextConnections, fps });
    setSelectedNodeId(subgroupId);
    setSelectedNodeIds([subgroupId]);
  }, [nodes, connections, fps, history]);

  // Ungroup a Sub-Graph node back into individual canvas nodes
  const handleUngroupNode = useCallback((subgraphNodeId: string) => {
    const sgNode = nodes.find(n => n.id === subgraphNodeId);
    if (!sgNode || sgNode.type !== 'SUBGRAPH') return;

    const data = sgNode.data as SubgraphNodeData;
    if (!data || !data.innerNodes || data.innerNodes.length === 0) return;

    const innerNodes = data.innerNodes;
    const innerConnections = data.innerConnections || [];

    // Reposition inner nodes relative to subgraph location
    const minX = Math.min(...innerNodes.map(n => n.x));
    const minY = Math.min(...innerNodes.map(n => n.y));
    const restoredNodes = innerNodes.map(n => ({
      ...n,
      x: sgNode.x + (n.x - minX),
      y: sgNode.y + (n.y - minY)
    }));

    // Reconnect incoming wires
    const restoredIncoming: NodeConnection[] = [];
    connections.filter(c => c.toNodeId === subgraphNodeId).forEach(wire => {
      const mapping = data.inputMappings?.find(m => m.subgraphPortId === wire.toPortId);
      if (mapping) {
        restoredIncoming.push({
          id: `conn_rest_in_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          fromNodeId: wire.fromNodeId,
          fromPortId: wire.fromPortId,
          toNodeId: mapping.innerNodeId,
          toPortId: mapping.innerPortId
        });
      }
    });

    // Reconnect outgoing wires
    const restoredOutgoing: NodeConnection[] = [];
    connections.filter(c => c.fromNodeId === subgraphNodeId).forEach(wire => {
      const mapping = data.outputMappings?.find(m => m.subgraphPortId === wire.fromPortId);
      if (mapping) {
        restoredOutgoing.push({
          id: `conn_rest_out_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          fromNodeId: mapping.innerNodeId,
          fromPortId: mapping.innerPortId,
          toNodeId: wire.toNodeId,
          toPortId: wire.toPortId
        });
      }
    });

    const remainingConnections = connections.filter(
      c => c.fromNodeId !== subgraphNodeId && c.toNodeId !== subgraphNodeId
    );

    const nextNodes = nodes.filter(n => n.id !== subgraphNodeId).concat(restoredNodes);
    const nextConnections = [
      ...remainingConnections,
      ...innerConnections,
      ...restoredIncoming,
      ...restoredOutgoing
    ];

    history.record({ nodes: nextNodes, connections: nextConnections, fps });
    setSelectedNodeIds(restoredNodes.map(n => n.id));
    setSelectedNodeId(restoredNodes[0]?.id || null);
  }, [nodes, connections, fps, history]);

  // Atomic node update helper
  const handleUpdateNode = useCallback((id: string, updates: Partial<AppNode>) => {
    const nextNodes = nodes.map(n => n.id === id ? { ...n, ...updates } : n);
    history.record({ nodes: nextNodes, connections, fps });
  }, [nodes, connections, fps, history]);

  // Keyboard shortcuts (including Ctrl+Z/Y for Undo/Redo, Ctrl+G for Group, Ctrl+Shift+G for Ungroup)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input or select
      const target = e.target as HTMLElement | null;
      if (target && ['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName)) {
        return;
      }

      // Group / Ungroup: Ctrl+G or Cmd+G
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'g') {
        e.preventDefault();
        if (e.shiftKey) {
          // Ungroup
          if (selectedNodeId && nodes.find(n => n.id === selectedNodeId)?.type === 'SUBGRAPH') {
            handleUngroupNode(selectedNodeId);
          }
        } else {
          // Group
          const activeIds = selectedNodeIds.length >= 2 ? selectedNodeIds : (selectedNodeId ? [selectedNodeId] : []);
          if (activeIds.length >= 2) {
            handleGroupNodes(activeIds);
          }
        }
        return;
      }

      // Undo: Ctrl+Z or Cmd+Z (without shift)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (history.canUndo) history.undo();
        return;
      }

      // Redo: Ctrl+Y or Cmd+Shift+Z or Ctrl+Shift+Z
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'))
      ) {
        e.preventDefault();
        if (history.canRedo) history.redo();
        return;
      }

      // Check if modal dialogs are open
      if (isShortcutsModalOpen) {
        if (e.code === 'Escape') {
          setIsShortcutsModalOpen(false);
        }
        return;
      }

      if (e.code === 'Escape') {
        if (spawnMenuPos) setSpawnMenuPos(null);
        else if (isThemeModalOpen) setIsThemeModalOpen(false);
        else if (isStartScreenOpen) setIsStartScreenOpen(false);
        return;
      }

      // Playback / Pause shortcut (default: Space)
      if (isKeyMatch(e, shortcuts['action_play_pause'] || 'Space')) {
        e.preventDefault();
        setIsPlaying(p => !p);
        return;
      }

      // Step Forward shortcut (default: ArrowRight)
      if (isKeyMatch(e, shortcuts['action_step_forward'] || 'ArrowRight')) {
        e.preventDefault();
        setIsPlaying(false);
        setActiveFrameIndex(prev => (prev + 1) % Math.max(1, activeOutputFrames.length));
        return;
      }

      // Step Backward shortcut (default: ArrowLeft)
      if (isKeyMatch(e, shortcuts['action_step_back'] || 'ArrowLeft')) {
        e.preventDefault();
        setIsPlaying(false);
        setActiveFrameIndex(prev => (prev - 1 + activeOutputFrames.length) % Math.max(1, activeOutputFrames.length));
        return;
      }

      // Spawn Node shortcut (default: 'a')
      if (isKeyMatch(e, shortcuts['action_spawn_node'] || 'a')) {
        e.preventDefault();
        setSpawnMenuPos({
          x: Math.max(80, window.innerWidth / 3),
          y: Math.max(80, window.innerHeight / 3)
        });
        return;
      }

      // Center Canvas / Reset Zoom shortcut (default: 'c')
      if (isKeyMatch(e, shortcuts['action_center_canvas'] || 'c')) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('reset-canvas-view'));
        return;
      }

      // Delete Node shortcut (default: Delete / Backspace)
      if (isKeyMatch(e, shortcuts['action_delete_node'] || 'Delete') && selectedNodeId) {
        e.preventDefault();
        handleDeleteNode(selectedNodeId);
        return;
      }

      // Tool shortcuts (Brush, Eraser, Bucket, Picker) when a drawing node is selected
      if (selectedNodeId) {
        const targetNode = nodes.find(n => n.id === selectedNodeId);
        if (targetNode && targetNode.type === 'DRAWING') {
          if (isKeyMatch(e, shortcuts['tool_brush'] || 'b')) {
            e.preventDefault();
            handleUpdateNode(selectedNodeId, { data: { ...targetNode.data, currentTool: 'pencil' } });
            return;
          }
          if (isKeyMatch(e, shortcuts['tool_eraser'] || 'e')) {
            e.preventDefault();
            handleUpdateNode(selectedNodeId, { data: { ...targetNode.data, currentTool: 'eraser' } });
            return;
          }
          if (isKeyMatch(e, shortcuts['tool_bucket'] || 'f')) {
            e.preventDefault();
            handleUpdateNode(selectedNodeId, { data: { ...targetNode.data, currentTool: 'bucket' } });
            return;
          }
          if (isKeyMatch(e, shortcuts['tool_picker'] || 'i')) {
            e.preventDefault();
            handleUpdateNode(selectedNodeId, { data: { ...targetNode.data, currentTool: 'picker' } });
            return;
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    selectedNodeId,
    selectedNodeIds,
    activeOutputFrames.length,
    isStartScreenOpen,
    isThemeModalOpen,
    isShortcutsModalOpen,
    spawnMenuPos,
    shortcuts,
    history,
    handleDeleteNode,
    handleGroupNodes,
    handleUngroupNode,
    handleUpdateNode,
    nodes
  ]);

  // Spawn new node on canvas
  const handleSpawnNode = useCallback((type: NodeType) => {
    const newId = `node_${type.toLowerCase()}_${Date.now()}`;
    let title = `${type} Node`;
    let inputs: NodePort[] = [];
    let outputs: NodePort[] = [];
    let data: any = {};

    switch (type) {
      case 'DRAWING':
        title = `Frame ${nodes.filter(n => n.type === 'DRAWING').length + 1}`;
        outputs = [{ id: 'out_frame', name: 'Frame Data', type: 'frame', direction: 'output' }];
        data = {
          canvasSize: 16,
          pixels: new Array(16 * 16 * 4).fill(0),
          currentColor: '#22c55e',
          currentTool: 'pencil'
        };
        break;

      case 'SEQUENCER':
        title = `Sequencer ${nodes.filter(n => n.type === 'SEQUENCER').length + 1}`;
        inputs = [
          { id: 'f_in1', name: 'Frame 1', type: 'frame', direction: 'input' },
          { id: 'f_in2', name: 'Frame 2', type: 'frame', direction: 'input' }
        ];
        outputs = [{ id: 'out_stream', name: 'Animation Stream', type: 'stream', direction: 'output' }];
        data = {
          frameOrder: ['f_in1', 'f_in2'],
          holdCounts: { f_in1: 1, f_in2: 1 },
          playbackMode: 'loop',
          pingPong: false
        };
        break;

      case 'PALETTE':
        title = 'Retro Palette';
        inputs = [{ id: 'in_stream', name: 'In Stream', type: 'stream', direction: 'input' }];
        outputs = [{ id: 'out_stream', name: 'Palette Stream', type: 'stream', direction: 'output' }];
        data = {
          palette: 'gameboy',
          preserveBlackAndWhite: false
        };
        break;

      case 'TRANSFORM':
        title = 'Motion FX';
        inputs = [{ id: 'in_stream', name: 'In Stream', type: 'stream', direction: 'input' }];
        outputs = [{ id: 'out_stream', name: 'Out Stream', type: 'stream', direction: 'output' }];
        data = {
          shiftX: 0,
          shiftY: -2,
          wrapShift: true,
          flipH: false,
          flipV: false,
          rotate: 0
        };
        break;

      case 'BLENDER':
        title = 'Layer Blender';
        inputs = [
          { id: 'in_base', name: 'Base Layer (A)', type: 'stream', direction: 'input' },
          { id: 'in_overlay', name: 'Overlay Layer (B)', type: 'stream', direction: 'input' }
        ];
        outputs = [{ id: 'out_stream', name: 'Blended Stream', type: 'stream', direction: 'output' }];
        data = {
          blendMode: 'overlay',
          opacity: 1.0
        };
        break;

      case 'OUTPUT':
        title = 'Render Output';
        inputs = [{ id: 'in_stream', name: 'Final Stream', type: 'stream', direction: 'input' }];
        outputs = [];
        data = {
          name: 'My Animation',
          resolution: 16
        };
        break;

      case 'SUBGRAPH':
        title = 'Sub-Graph';
        inputs = [{ id: 'in_stream', name: 'In Stream', type: 'stream', direction: 'input' }];
        outputs = [{ id: 'out_stream', name: 'Stream Out', type: 'stream', direction: 'output' }];
        data = {
          innerNodes: [],
          innerConnections: [],
          description: 'Empty Sub-Graph',
          collapsed: true
        };
        break;
    }

    const newNode: AppNode = {
      id: newId,
      type,
      title,
      x: 200 + Math.random() * 80,
      y: 160 + Math.random() * 80,
      inputs,
      outputs,
      data
    };

    history.record({ nodes: [...nodes, newNode], connections, fps });
    setSelectedNodeId(newId);
    setSelectedNodeIds([newId]);
  }, [nodes, connections, fps, history]);

  // Duplicate an existing node
  const handleDuplicateNode = useCallback((sourceNode: AppNode) => {
    const newId = `node_${sourceNode.type.toLowerCase()}_${Date.now()}`;
    const frameCount = nodes.filter(n => n.type === sourceNode.type).length + 1;
    const title = sourceNode.type === 'DRAWING'
      ? `Frame ${frameCount} (Copy)`
      : `${sourceNode.title} (Copy)`;

    const duplicatedData = JSON.parse(JSON.stringify(sourceNode.data));

    const newNode: AppNode = {
      ...sourceNode,
      id: newId,
      title,
      x: sourceNode.x + 40,
      y: sourceNode.y + 40,
      inputs: sourceNode.inputs.map(p => ({ ...p, id: `in_${Date.now()}_${Math.random().toString(36).substring(2, 5)}` })),
      outputs: sourceNode.outputs.map(p => ({ ...p, id: `out_${Date.now()}_${Math.random().toString(36).substring(2, 5)}` })),
      data: duplicatedData
    };

    let targetSequencerId: string | null = null;
    let newConnection: NodeConnection | null = null;

    if (sourceNode.type === 'DRAWING') {
      const existingConn = connections.find(c => c.fromNodeId === sourceNode.id);
      if (existingConn) {
        targetSequencerId = existingConn.toNodeId;
      }
    }

    let nextNodes = [...nodes];
    let nextConnections = [...connections];

    if (targetSequencerId) {
      const seqNode = nodes.find(n => n.id === targetSequencerId);
      if (seqNode && seqNode.type === 'SEQUENCER') {
        const newSlotIndex = seqNode.inputs.length + 1;
        const newPortId = `f_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
        const newPort: NodePort = {
          id: newPortId,
          name: `Frame ${newSlotIndex}`,
          type: 'frame',
          direction: 'input'
        };

        const seqData = seqNode.data as SequencerNodeData;
        const currentOrder = seqData.frameOrder && seqData.frameOrder.length > 0
          ? seqData.frameOrder
          : seqNode.inputs.map(p => p.id);

        const updatedSeqNode: AppNode = {
          ...seqNode,
          inputs: [...seqNode.inputs, newPort],
          data: {
            ...seqData,
            frameOrder: [...currentOrder, newPortId],
            holdCounts: { ...(seqData.holdCounts || {}), [newPortId]: 1 }
          }
        };

        nextNodes = [...nextNodes.map(n => n.id === targetSequencerId ? updatedSeqNode : n), newNode];

        newConnection = {
          id: `conn_${Date.now()}`,
          fromNodeId: newId,
          fromPortId: 'out_frame',
          toNodeId: targetSequencerId,
          toPortId: newPortId
        };
        nextConnections = [...nextConnections, newConnection];
      }
    } else {
      nextNodes = [...nextNodes, newNode];
    }

    history.record({ nodes: nextNodes, connections: nextConnections, fps });
    setSelectedNodeId(newId);
    setSelectedNodeIds([newId]);
  }, [nodes, connections, fps, history]);

  // Spawn and link a new frame directly to a sequencer slot
  const handleAddAndLinkFrame = useCallback((sequencerId: string, portId: string) => {
    const seqNode = nodes.find(n => n.id === sequencerId);
    if (!seqNode) return;

    const frameCount = nodes.filter(n => n.type === 'DRAWING').length + 1;
    const newFrameId = `node_drawing_${Date.now()}`;

    const slotIdx = seqNode.inputs.length;
    const newNode: AppNode = {
      id: newFrameId,
      type: 'DRAWING',
      title: `Frame ${frameCount}`,
      x: Math.max(40, seqNode.x - 300),
      y: seqNode.y + (slotIdx - 1) * 80,
      inputs: [],
      outputs: [{ id: 'out_frame', name: 'Frame Data', type: 'frame', direction: 'output' }],
      data: {
        canvasSize: 16,
        pixels: new Array(16 * 16 * 4).fill(0),
        currentColor: '#10b981',
        currentTool: 'pencil'
      }
    };

    const newConnection: NodeConnection = {
      id: `conn_${Date.now()}`,
      fromNodeId: newFrameId,
      fromPortId: 'out_frame',
      toNodeId: sequencerId,
      toPortId: portId
    };

    history.record({ nodes: [...nodes, newNode], connections: [...connections, newConnection], fps });
    setSelectedNodeId(newFrameId);
    setSelectedNodeIds([newFrameId]);
  }, [nodes, connections, fps, history]);

  // Load Preset
  const handleLoadPreset = (presetId: string) => {
    const preset = PRESET_GRAPHS.find(p => p.id === presetId);
    if (preset) {
      history.reset({
        nodes: preset.nodes,
        connections: preset.connections,
        fps: preset.fps || 10
      });
      setActiveFrameIndex(0);
      setSelectedNodeId(null);
      setSelectedNodeIds([]);
      setPreviewNodeId(null);
    }
  };

  // Create clean starter graph
  const handleNewGraph = () => {
    const blankNodes: AppNode[] = [
      {
        id: 'node_draw_starter',
        type: 'DRAWING',
        title: 'Frame 1',
        x: 80,
        y: 140,
        inputs: [],
        outputs: [{ id: 'out_frame', name: 'Frame Data', type: 'frame', direction: 'output' }],
        data: {
          canvasSize: 16,
          pixels: new Array(16 * 16 * 4).fill(0),
          currentColor: '#6366f1',
          currentTool: 'pencil'
        }
      },
      {
        id: 'node_seq_starter',
        type: 'SEQUENCER',
        title: 'Timeline Sequencer',
        x: 380,
        y: 140,
        inputs: [
          { id: 'f_in1', name: 'Frame 1', type: 'frame', direction: 'input' }
        ],
        outputs: [{ id: 'out_stream', name: 'Animation Stream', type: 'stream', direction: 'output' }],
        data: {
          frameOrder: ['f_in1'],
          holdCounts: { f_in1: 2 },
          playbackMode: 'loop',
          pingPong: false
        }
      },
      {
        id: 'node_out_starter',
        type: 'OUTPUT',
        title: 'Render Output',
        x: 680,
        y: 140,
        inputs: [{ id: 'in_stream', name: 'Final Stream', type: 'stream', direction: 'input' }],
        outputs: [],
        data: {
          name: 'New Animation',
          resolution: 16
        }
      }
    ];

    const blankConns: NodeConnection[] = [
      {
        id: 'conn_s1',
        fromNodeId: 'node_draw_starter',
        fromPortId: 'out_frame',
        toNodeId: 'node_seq_starter',
        toPortId: 'f_in1'
      },
      {
        id: 'conn_s2',
        fromNodeId: 'node_seq_starter',
        fromPortId: 'out_stream',
        toNodeId: 'node_out_starter',
        toPortId: 'in_stream'
      }
    ];

    history.reset({
      nodes: blankNodes,
      connections: blankConns,
      fps: 10
    });
    setActiveFrameIndex(0);
    setSelectedNodeId('node_draw_starter');
    setSelectedNodeIds(['node_draw_starter']);
    setPreviewNodeId(null);
  };

  // Clear all nodes
  const handleClearAll = () => {
    history.record({ nodes: [], connections: [], fps });
    setSelectedNodeId(null);
    setSelectedNodeIds([]);
    setPreviewNodeId(null);
  };

  const canvasResolution = activeOutputFrames[0]?.width || 16;

  // Export full project JSON
  const handleExportProject = () => {
    exportProjectJSON(nodes, connections, fps, canvasResolution, 'pixelnode_project.json');
  };

  // Import project JSON
  const handleImportProject = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const parsed = parseProjectJSON(content);
      if (parsed) {
        history.reset({
          nodes: parsed.nodes,
          connections: parsed.connections,
          fps: parsed.fps || 10
        });
        setSelectedNodeId(null);
        setSelectedNodeIds([]);
        setPreviewNodeId(null);
      }
    };
    reader.readAsText(file);
  };

  // Resume auto-save from StartScreen
  const handleResumeAutoSave = () => {
    if (autoSavedProject) {
      history.reset({
        nodes: autoSavedProject.nodes,
        connections: autoSavedProject.connections,
        fps: autoSavedProject.fps || 10
      });
      setIsPlaying(true);
      setActiveFrameIndex(0);
      setSelectedNodeId(null);
      setSelectedNodeIds([]);
      setPreviewNodeId(null);
      setIsStartScreenOpen(false);
    }
  };

  // Start blank from StartScreen
  const handleStartBlankFromStart = () => {
    handleNewGraph();
    setIsStartScreenOpen(false);
  };

  // Select preset from StartScreen
  const handleSelectPresetFromStart = (presetId: string) => {
    handleLoadPreset(presetId);
    setIsStartScreenOpen(false);
  };

  // Import file from StartScreen
  const handleImportFromStart = (file: File) => {
    handleImportProject(file);
    setIsStartScreenOpen(false);
  };

  // Toggle high contrast
  const handleToggleHighContrast = () => {
    setIsHighContrast(prev => {
      const next = !prev;
      try {
        localStorage.setItem('pixelnode_high_contrast', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Toggle Dark Mode
  const handleToggleDarkMode = () => {
    handleCycleThemeMode();
  };

  // Select Design Theme
  const handleSelectDesign = (design: UIDesign) => {
    setCurrentDesign(design);
    try {
      localStorage.setItem('pixelnode_ui_design', design);
    } catch {}
  };

  return (
    <div
      className={`w-screen h-screen flex flex-col bg-slate-100 dark:bg-slate-950 overflow-hidden font-sans text-slate-800 dark:text-slate-100 transition-colors theme-${currentDesign} ${
        isDarkMode ? 'dark' : ''
      } ${isHighContrast ? 'contrast-125' : ''}`}
    >
      {/* EU Accessibility (WCAG 2.1 AA) Skip Link */}
      <a
        href="#canvas-main-area"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded-md focus:font-bold focus:shadow-xl focus:outline-none focus:ring-4 focus:ring-indigo-400"
      >
        Zum Hauptinhalt springen (Skip to canvas)
      </a>

      {/* Header with Undo/Redo, Dark Mode, Themes & Graph Controls */}
      <Header
        onOpenStartScreen={() => setIsStartScreenOpen(true)}
        onNewGraph={handleNewGraph}
        onClearAll={handleClearAll}
        onResetView={() => window.dispatchEvent(new CustomEvent('reset-canvas-view'))}
        onLoadPreset={handleLoadPreset}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onExportProject={handleExportProject}
        onImportProject={handleImportProject}
        isHighContrast={isHighContrast}
        onToggleHighContrast={handleToggleHighContrast}
        canUndo={history.canUndo}
        canRedo={history.canRedo}
        onUndo={history.undo}
        onRedo={history.redo}
        isDarkMode={isDarkMode}
        themeMode={themeMode}
        onToggleDarkMode={handleToggleDarkMode}
        onCycleThemeMode={handleCycleThemeMode}
        onOpenThemeModal={() => setIsThemeModalOpen(true)}
        onOpenShortcutsModal={() => setIsShortcutsModalOpen(true)}
        onOpenLanguageModal={() => setIsLanguageModalOpen(true)}
        currentDesign={currentDesign}
        currentLanguage={currentLanguage}
      />

      {/* Main Workspace (Node Canvas + Live Viewport / Inspector) */}
      <main
        id="canvas-main-area"
        role="main"
        aria-label="Node-Graph und Vorschau-Arbeitsbereich"
        className="flex-1 flex overflow-hidden relative"
      >
        <NodeCanvas
          nodes={nodes}
          connections={connections}
          nodeOutputs={nodeOutputs}
          activeOutputFrames={activeOutputFrames}
          activeFrameIndex={activeFrameIndex}
          selectedNodeId={selectedNodeId}
          selectedNodeIds={selectedNodeIds}
          previewNodeId={effectivePreviewNodeId}
          onSelectNode={(id) => {
            setSelectedNodeId(id);
            if (id && !selectedNodeIds.includes(id)) {
              setSelectedNodeIds([id]);
            } else if (!id) {
              setSelectedNodeIds([]);
            }
          }}
          onSelectNodes={setSelectedNodeIds}
          onSetPreviewNode={setPreviewNodeId}
          onUpdateNodes={setNodes}
          onUpdateNode={handleUpdateNode}
          onUpdateConnections={setConnections}
          onSpawnNode={handleSpawnNode}
          onDeleteNode={handleDeleteNode}
          onDeleteConnection={handleDeleteConnection}
          onDuplicateNode={handleDuplicateNode}
          onAddAndLinkFrame={handleAddAndLinkFrame}
          onGroupNodes={handleGroupNodes}
          onUngroupNode={handleUngroupNode}
          shortcuts={shortcuts}
          onOpenShortcutsModal={() => setIsShortcutsModalOpen(true)}
          spawnMenuPos={spawnMenuPos}
          onSetSpawnMenuPos={setSpawnMenuPos}
        />

        <LivePreview
          frames={activeOutputFrames}
          fps={fps}
          isPlaying={isPlaying}
          activeFrameIndex={activeFrameIndex}
          selectedNode={selectedNode}
          allNodes={nodes}
          connections={connections}
          previewNodeId={previewNodeId}
          onSelectPreviewSource={setPreviewNodeId}
          onFpsChange={setFps}
          onTogglePlay={() => setIsPlaying(p => !p)}
          onStepFrame={(dir) => {
            setIsPlaying(false);
            setActiveFrameIndex(prev => (prev + dir + activeOutputFrames.length) % Math.max(1, activeOutputFrames.length));
          }}
          onSelectFrameIndex={(idx) => {
            setIsPlaying(false);
            setActiveFrameIndex(idx);
          }}
          onUpdateSelectedNodeTitle={(title) => {
            if (selectedNodeId) {
              handleUpdateNode(selectedNodeId, { title });
            }
          }}
          onUpdateNode={handleUpdateNode}
        />
      </main>

      {/* Footer with Stats, Legal Links & Bottom Auto-Save Status */}
      <Footer
        nodeCount={nodes.length}
        connectionCount={connections.length}
        frameCount={activeOutputFrames.length}
        fps={fps}
        resolution={canvasResolution}
        onOpenCookieSettings={() => setIsCookieBannerOpen(true)}
        lastAutoSaveTime={lastAutoSaveTime}
        onManualSave={handleManualSave}
      />

      {/* Start Screen / Landing Page */}
      {isStartScreenOpen && (
        <StartScreen
          autoSavedProject={autoSavedProject}
          isHighContrast={isHighContrast}
          onToggleHighContrast={handleToggleHighContrast}
          onStartBlank={handleStartBlankFromStart}
          onResumeAutoSave={handleResumeAutoSave}
          onSelectPreset={handleSelectPresetFromStart}
          onImportFile={handleImportFromStart}
          onOpenEditor={() => setIsStartScreenOpen(false)}
          onOpenCookieSettings={() => setIsCookieBannerOpen(true)}
          onOpenThemeModal={() => setIsThemeModalOpen(true)}
          onOpenShortcutsModal={() => setIsShortcutsModalOpen(true)}
          onOpenLanguageModal={() => setIsLanguageModalOpen(true)}
          currentLanguage={currentLanguage}
          isDarkMode={isDarkMode}
          themeMode={themeMode}
          onToggleDarkMode={handleToggleDarkMode}
          onCycleThemeMode={handleCycleThemeMode}
        />
      )}

      {/* Export Dialog */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        frames={activeOutputFrames}
        nodes={nodes}
        connections={connections}
        nodeOutputs={nodeOutputs}
        fps={fps}
      />

      {/* Visual Design / Theme Customization Modal */}
      <ThemeModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        isDarkMode={isDarkMode}
        themeMode={themeMode}
        onSetThemeMode={handleSetThemeMode}
        onToggleDarkMode={handleToggleDarkMode}
        currentDesign={currentDesign}
        onSelectDesign={handleSelectDesign}
        currentLanguage={currentLanguage}
      />

      {/* Keyboard Shortcuts Settings Modal */}
      <ShortcutsSettingsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
        shortcuts={shortcuts}
        onUpdateShortcuts={setShortcuts}
        currentLanguage={currentLanguage}
      />

      {/* G20 Languages Selection Modal */}
      <LanguageModal
        isOpen={isLanguageModalOpen}
        onClose={() => setIsLanguageModalOpen(false)}
        currentLanguage={currentLanguage}
        onSelectLanguage={handleSelectLanguage}
      />

      {/* DSGVO / GDPR Compliant Cookie & Storage Banner */}
      <CookieBanner
        isOpen={isCookieBannerOpen}
        onClose={() => setIsCookieBannerOpen(false)}
        onSaveConsent={() => {}}
      />
    </div>
  );
}
