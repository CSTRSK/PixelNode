import { GIFEncoder, quantize, applyPalette } from 'gifenc';
import { PixelFrame, NodeGraphProject, AppNode, NodeConnection } from '../types/nodes';
import { frameToImageData } from './pixelEngine';

// Download a blob or data URL to the user's filesystem
export function downloadFile(url: string, filename: string): void {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Generate Sprite Sheet Canvas
export function generateSpriteSheet(
  frames: PixelFrame[],
  scale = 1,
  columns = 0, // 0 = all frames in 1 single horizontal row
  padding = 0
): HTMLCanvasElement {
  if (frames.length === 0) {
    const emptyCanvas = document.createElement('canvas');
    emptyCanvas.width = 16 * scale;
    emptyCanvas.height = 16 * scale;
    return emptyCanvas;
  }

  const frameW = frames[0].width * scale;
  const frameH = frames[0].height * scale;

  const cols = columns > 0 ? Math.min(columns, frames.length) : frames.length;
  const rows = Math.ceil(frames.length / cols);

  const canvas = document.createElement('canvas');
  canvas.width = cols * frameW + (cols - 1) * padding;
  canvas.height = rows * frameH + (rows - 1) * padding;

  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.imageSmoothingEnabled = false;

  frames.forEach((frame, idx) => {
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    const destX = col * (frameW + padding);
    const destY = row * (frameH + padding);

    // Render frame to offscreen
    const offscreen = document.createElement('canvas');
    offscreen.width = frame.width;
    offscreen.height = frame.height;
    const offCtx = offscreen.getContext('2d');
    if (offCtx) {
      offCtx.putImageData(frameToImageData(frame), 0, 0);
      ctx.drawImage(offscreen, destX, destY, frameW, frameH);
    }
  });

  return canvas;
}

// Export Sprite Sheet as PNG
export function exportSpriteSheetPNG(
  frames: PixelFrame[],
  filename = 'pixelnode_spritesheet.png',
  scale = 2,
  columns = 0
): void {
  const canvas = generateSpriteSheet(frames, scale, columns);
  const url = canvas.toDataURL('image/png');
  downloadFile(url, filename);
}

// Export Animated GIF using gifenc
export async function exportAnimatedGIF(
  frames: PixelFrame[],
  fps = 12,
  scale = 4,
  filename = 'pixelnode_animation.gif',
  transparent = true
): Promise<void> {
  if (frames.length === 0) return;

  const width = frames[0].width * scale;
  const height = frames[0].height * scale;
  const delay = Math.round(1000 / fps);

  // Initialize GIFEncoder
  const gif = GIFEncoder();

  // Create temporary offscreen scaling canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return;
  ctx.imageSmoothingEnabled = false;

  const srcCanvas = document.createElement('canvas');
  srcCanvas.width = frames[0].width;
  srcCanvas.height = frames[0].height;
  const srcCtx = srcCanvas.getContext('2d');
  if (!srcCtx) return;

  for (let i = 0; i < frames.length; i++) {
    const frame = frames[i];
    ctx.clearRect(0, 0, width, height);

    if (!transparent) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
    }

    srcCtx.putImageData(frameToImageData(frame), 0, 0);
    ctx.drawImage(srcCanvas, 0, 0, width, height);

    const { data } = ctx.getImageData(0, 0, width, height);
    
    // Quantize RGBA pixels to indexed palette (256 colors maximum)
    const palette = quantize(data, 256, {
      format: 'rgba4444',
      oneBitAlpha: transparent
    });

    // Map RGBA data into single indexed array
    const index = applyPalette(data, palette);

    // Write frame into GIF
    gif.writeFrame(index, width, height, {
      palette,
      delay,
      transparent: transparent,
      repeat: 0 // Infinite loop
    });
  }

  // Finish GIF stream
  gif.finish();

  const buffer = gif.bytesView();
  const blob = new Blob([buffer.buffer as ArrayBuffer], { type: 'image/gif' });
  const url = URL.createObjectURL(blob);
  downloadFile(url, filename);
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

// Export Project as JSON
export function exportProjectJSON(
  nodes: AppNode[],
  connections: NodeConnection[],
  fps: number,
  resolution: number,
  projectName = 'pixelnode_project.json'
): void {
  const project: NodeGraphProject = {
    version: '1.0',
    name: projectName.replace('.json', ''),
    fps,
    canvasResolution: resolution,
    nodes: nodes.map(n => ({
      id: n.id,
      type: n.type,
      title: n.title,
      x: n.x,
      y: n.y,
      inputs: n.inputs,
      outputs: n.outputs,
      data: n.data
    })),
    connections
  };

  const jsonStr = JSON.stringify(project, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  downloadFile(url, projectName);
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

// Parse imported JSON project
export function parseProjectJSON(jsonString: string): NodeGraphProject | null {
  try {
    const data = JSON.parse(jsonString) as NodeGraphProject;
    if (data && Array.isArray(data.nodes) && Array.isArray(data.connections)) {
      return data;
    }
  } catch (err) {
    console.error('Failed to parse project file:', err);
  }
  return null;
}
