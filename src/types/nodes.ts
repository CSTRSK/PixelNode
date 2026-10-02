export type NodeType = 'DRAWING' | 'SEQUENCER' | 'TRANSFORM' | 'PALETTE' | 'BLENDER' | 'OUTPUT' | 'SUBGRAPH';

export interface PixelFrame {
  id: string;
  width: number;
  height: number;
  // RGBA pixel data: 4 bytes per pixel (r, g, b, a)
  data: Uint8ClampedArray;
}

export interface NodePort {
  id: string;
  name: string;
  type: 'frame' | 'stream' | 'color';
  direction: 'input' | 'output';
}

export interface DrawingNodeData {
  canvasSize: number; // 16, 32, etc.
  pixels: number[]; // Flat array of RGBA numbers (length = width * height * 4)
  currentColor: string; // hex color e.g. '#2563eb'
  currentTool: 'pencil' | 'eraser' | 'bucket' | 'picker';
}

export interface SequencerNodeData {
  frameOrder: string[]; // List of input port IDs or frame references in sequence
  holdCounts: Record<string, number>; // How many ticks each frame holds (default 1)
  playbackMode: 'loop' | 'pingpong' | 'reverse';
  pingPong?: boolean; // Dedicated alternating animation toggle
  customFps?: number;
}

export interface TransformNodeData {
  shiftX: number; // -16 to +16
  shiftY: number; // -16 to +16
  wrapShift: boolean;
  flipH: boolean;
  flipV: boolean;
  rotate: 0 | 90 | 180 | 270;
  invertColors: boolean;
  addOutline: boolean;
  outlineColor: string;
  glitchAmount: number; // 0 to 1
}

export type PaletteName = 
  | 'gameboy'
  | 'pico8'
  | 'nes'
  | 'cyberpunk'
  | 'vaporwave'
  | 'monochrome'
  | 'solarized';

export interface PaletteNodeData {
  palette: PaletteName;
  customColors?: string[];
  preserveBlackAndWhite: boolean;
}

export interface BlenderNodeData {
  blendMode: 'normal' | 'add' | 'multiply' | 'mask';
  opacity: number; // 0 to 1
}

export interface OutputNodeData {
  name: string;
  resolution: number; // 16, 32, 64
}

export interface SubgraphPortMapping {
  subgraphPortId: string;
  innerNodeId: string;
  innerPortId: string;
  portName?: string;
}

export interface SubgraphNodeData {
  innerNodes: AppNode[];
  innerConnections: NodeConnection[];
  inputMappings?: SubgraphPortMapping[];
  outputMappings?: SubgraphPortMapping[];
  description?: string;
  collapsed?: boolean;
}

export type NodeData = 
  | DrawingNodeData 
  | SequencerNodeData 
  | TransformNodeData 
  | PaletteNodeData 
  | BlenderNodeData 
  | OutputNodeData
  | SubgraphNodeData;

export interface AppNode {
  id: string;
  type: NodeType;
  title: string;
  x: number;
  y: number;
  width?: number;
  inputs: NodePort[];
  outputs: NodePort[];
  data: NodeData;
}

export interface NodeConnection {
  id: string;
  fromNodeId: string;
  fromPortId: string;
  toNodeId: string;
  toPortId: string;
}

export interface NodeGraphProject {
  version: string;
  name: string;
  fps: number;
  canvasResolution: number;
  nodes: {
    id: string;
    type: NodeType;
    title: string;
    x: number;
    y: number;
    inputs: NodePort[];
    outputs: NodePort[];
    data: any;
  }[];
  connections: NodeConnection[];
}
