import { PixelFrame } from '../types/nodes';
import { getPaletteRgbColors, findNearestColor, hexToRgb } from './palettes';

// Create a blank frame initialized to transparent or filled with a color
export function createBlankFrame(width = 16, height = 16, fillHex?: string): PixelFrame {
  const data = new Uint8ClampedArray(width * height * 4);
  if (fillHex) {
    const [r, g, b] = hexToRgb(fillHex);
    for (let i = 0; i < data.length; i += 4) {
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
      data[i + 3] = 255;
    }
  }
  return {
    id: 'frame_' + Math.random().toString(36).substring(2, 9),
    width,
    height,
    data
  };
}

// Deep clone frame
export function cloneFrame(frame: PixelFrame): PixelFrame {
  const clonedData = new Uint8ClampedArray(frame.data.length);
  clonedData.set(frame.data);
  return {
    id: 'frame_' + Math.random().toString(36).substring(2, 9),
    width: frame.width,
    height: frame.height,
    data: clonedData
  };
}

// Draw a single pixel with hex or RGBA
export function setPixel(
  frame: PixelFrame,
  x: number,
  y: number,
  r: number,
  g: number,
  b: number,
  a: number = 255
): void {
  if (x < 0 || x >= frame.width || y < 0 || y >= frame.height) return;
  const idx = (y * frame.width + x) * 4;
  frame.data[idx] = r;
  frame.data[idx + 1] = g;
  frame.data[idx + 2] = b;
  frame.data[idx + 3] = a;
}

// Get RGBA pixel values
export function getPixel(
  frame: PixelFrame,
  x: number,
  y: number
): [number, number, number, number] {
  if (x < 0 || x >= frame.width || y < 0 || y >= frame.height) return [0, 0, 0, 0];
  const idx = (y * frame.width + x) * 4;
  return [
    frame.data[idx],
    frame.data[idx + 1],
    frame.data[idx + 2],
    frame.data[idx + 3]
  ];
}

// Flood fill algorithm
export function floodFill(
  frame: PixelFrame,
  startX: number,
  startY: number,
  fillColorRgba: [number, number, number, number]
): void {
  if (startX < 0 || startX >= frame.width || startY < 0 || startY >= frame.height) return;
  
  const targetColor = getPixel(frame, startX, startY);
  // If target color is same as fill color, stop
  if (
    targetColor[0] === fillColorRgba[0] &&
    targetColor[1] === fillColorRgba[1] &&
    targetColor[2] === fillColorRgba[2] &&
    targetColor[3] === fillColorRgba[3]
  ) {
    return;
  }

  const queue: [number, number][] = [[startX, startY]];
  const visited = new Uint8Array(frame.width * frame.height);

  while (queue.length > 0) {
    const [x, y] = queue.pop()!;
    const pIdx = y * frame.width + x;
    if (visited[pIdx]) continue;
    visited[pIdx] = 1;

    const current = getPixel(frame, x, y);
    if (
      current[0] === targetColor[0] &&
      current[1] === targetColor[1] &&
      current[2] === targetColor[2] &&
      current[3] === targetColor[3]
    ) {
      setPixel(frame, x, y, fillColorRgba[0], fillColorRgba[1], fillColorRgba[2], fillColorRgba[3]);

      if (x > 0) queue.push([x - 1, y]);
      if (x < frame.width - 1) queue.push([x + 1, y]);
      if (y > 0) queue.push([x, y - 1]);
      if (y < frame.height - 1) queue.push([x, y + 1]);
    }
  }
}

// Bresenham's line algorithm for smooth pixel drawing
export function drawLine(
  frame: PixelFrame,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  rgba: [number, number, number, number]
): void {
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;

  let currX = x0;
  let currY = y0;

  while (true) {
    setPixel(frame, currX, currY, rgba[0], rgba[1], rgba[2], rgba[3]);
    if (currX === x1 && currY === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      currX += sx;
    }
    if (e2 < dx) {
      err += dx;
      currY += sy;
    }
  }
}

// Shift frame by dx, dy
export function shiftFrame(
  frame: PixelFrame,
  dx: number,
  dy: number,
  wrap = false
): PixelFrame {
  const out = createBlankFrame(frame.width, frame.height);
  const w = frame.width;
  const h = frame.height;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let targetX = x + dx;
      let targetY = y + dy;

      if (wrap) {
        targetX = (targetX % w + w) % w;
        targetY = (targetY % h + h) % h;
      }

      if (targetX >= 0 && targetX < w && targetY >= 0 && targetY < h) {
        const srcIdx = (y * w + x) * 4;
        const tgtIdx = (targetY * w + targetX) * 4;
        out.data[tgtIdx] = frame.data[srcIdx];
        out.data[tgtIdx + 1] = frame.data[srcIdx + 1];
        out.data[tgtIdx + 2] = frame.data[srcIdx + 2];
        out.data[tgtIdx + 3] = frame.data[srcIdx + 3];
      }
    }
  }
  return out;
}

// Flip Horizontal
export function flipFrameH(frame: PixelFrame): PixelFrame {
  const out = createBlankFrame(frame.width, frame.height);
  const w = frame.width;
  const h = frame.height;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const srcIdx = (y * w + x) * 4;
      const tgtIdx = (y * w + (w - 1 - x)) * 4;
      out.data[tgtIdx] = frame.data[srcIdx];
      out.data[tgtIdx + 1] = frame.data[srcIdx + 1];
      out.data[tgtIdx + 2] = frame.data[srcIdx + 2];
      out.data[tgtIdx + 3] = frame.data[srcIdx + 3];
    }
  }
  return out;
}

// Flip Vertical
export function flipFrameV(frame: PixelFrame): PixelFrame {
  const out = createBlankFrame(frame.width, frame.height);
  const w = frame.width;
  const h = frame.height;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const srcIdx = (y * w + x) * 4;
      const tgtIdx = ((h - 1 - y) * w + x) * 4;
      out.data[tgtIdx] = frame.data[srcIdx];
      out.data[tgtIdx + 1] = frame.data[srcIdx + 1];
      out.data[tgtIdx + 2] = frame.data[srcIdx + 2];
      out.data[tgtIdx + 3] = frame.data[srcIdx + 3];
    }
  }
  return out;
}

// Rotate 90, 180, 270 degrees clockwise
export function rotateFrame(frame: PixelFrame, degrees: 0 | 90 | 180 | 270): PixelFrame {
  if (degrees === 0) return cloneFrame(frame);

  let current = cloneFrame(frame);
  const steps = degrees / 90;

  for (let s = 0; s < steps; s++) {
    const next = createBlankFrame(current.height, current.width);
    const w = current.width;
    const h = current.height;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const srcIdx = (y * w + x) * 4;
        const tgtX = h - 1 - y;
        const tgtY = x;
        const tgtIdx = (tgtY * current.height + tgtX) * 4;

        next.data[tgtIdx] = current.data[srcIdx];
        next.data[tgtIdx + 1] = current.data[srcIdx + 1];
        next.data[tgtIdx + 2] = current.data[srcIdx + 2];
        next.data[tgtIdx + 3] = current.data[srcIdx + 3];
      }
    }
    current = next;
  }

  return current;
}

// Invert RGB Colors (preserving alpha)
export function invertFrameColors(frame: PixelFrame): PixelFrame {
  const out = cloneFrame(frame);
  for (let i = 0; i < out.data.length; i += 4) {
    if (out.data[i + 3] > 0) {
      out.data[i] = 255 - out.data[i];
      out.data[i + 1] = 255 - out.data[i + 1];
      out.data[i + 2] = 255 - out.data[i + 2];
    }
  }
  return out;
}

// Add 1px Retro Outline
export function outlineFrame(frame: PixelFrame, outlineHex = '#000000'): PixelFrame {
  const out = cloneFrame(frame);
  const [or, og, ob] = hexToRgb(outlineHex);
  const w = frame.width;
  const h = frame.height;

  // Find transparent pixels adjacent to non-transparent pixels
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      // If current pixel is already opaque, leave as is
      if (frame.data[idx + 3] > 30) continue;

      // Check 4-neighbor connectivity
      const hasOpaqueNeighbor =
        (x > 0 && frame.data[(y * w + (x - 1)) * 4 + 3] > 30) ||
        (x < w - 1 && frame.data[(y * w + (x + 1)) * 4 + 3] > 30) ||
        (y > 0 && frame.data[((y - 1) * w + x) * 4 + 3] > 30) ||
        (y < h - 1 && frame.data[((y + 1) * w + x) * 4 + 3] > 30);

      if (hasOpaqueNeighbor) {
        out.data[idx] = or;
        out.data[idx + 1] = og;
        out.data[idx + 2] = ob;
        out.data[idx + 3] = 255;
      }
    }
  }
  return out;
}

// Add subtle Glitch / Dither / Noise
export function applyGlitch(frame: PixelFrame, amount: number): PixelFrame {
  if (amount <= 0) return cloneFrame(frame);
  const out = cloneFrame(frame);
  const count = Math.floor(frame.width * frame.height * amount * 0.3);

  for (let i = 0; i < count; i++) {
    const rx = Math.floor(Math.random() * frame.width);
    const ry = Math.floor(Math.random() * frame.height);
    const idx = (ry * frame.width + rx) * 4;
    
    if (out.data[idx + 3] > 0) {
      // Color channel shift
      if (Math.random() > 0.5) {
        out.data[idx] = Math.min(255, out.data[idx] + 80);
      } else {
        out.data[idx + 2] = Math.min(255, out.data[idx + 2] + 80);
      }
    }
  }
  return out;
}

// Apply Palette Remapping
export function applyPalette(frame: PixelFrame, paletteColors: string[]): PixelFrame {
  const out = cloneFrame(frame);
  const paletteRgbs = getPaletteRgbColors(paletteColors);
  if (paletteRgbs.length === 0) return out;

  for (let i = 0; i < out.data.length; i += 4) {
    const a = out.data[i + 3];
    if (a < 30) {
      // Transparent pixel remains transparent
      out.data[i + 3] = 0;
      continue;
    }

    const r = out.data[i];
    const g = out.data[i + 1];
    const b = out.data[i + 2];

    const [nr, ng, nb] = findNearestColor(r, g, b, paletteRgbs);
    out.data[i] = nr;
    out.data[i + 1] = ng;
    out.data[i + 2] = nb;
    out.data[i + 3] = 255;
  }

  return out;
}

// Blend two frames
export function blendFrames(
  base: PixelFrame,
  overlay: PixelFrame,
  mode: 'normal' | 'add' | 'multiply' | 'mask' = 'normal',
  opacity = 1
): PixelFrame {
  const out = cloneFrame(base);
  const len = Math.min(base.data.length, overlay.data.length);

  for (let i = 0; i < len; i += 4) {
    const srcA = (overlay.data[i + 3] / 255) * opacity;
    if (srcA <= 0) continue;

    const dstA = out.data[i + 3] / 255;
    const srcR = overlay.data[i];
    const srcG = overlay.data[i + 1];
    const srcB = overlay.data[i + 2];

    const dstR = out.data[i];
    const dstG = out.data[i + 1];
    const dstB = out.data[i + 2];

    if (mode === 'mask') {
      // Overlay acts as alpha mask on base
      out.data[i + 3] = Math.round(dstA * srcA * 255);
      continue;
    }

    if (mode === 'add') {
      out.data[i] = Math.min(255, dstR + srcR * srcA);
      out.data[i + 1] = Math.min(255, dstG + srcG * srcA);
      out.data[i + 2] = Math.min(255, dstB + srcB * srcA);
      out.data[i + 3] = Math.round(Math.min(1, dstA + srcA) * 255);
      continue;
    }

    if (mode === 'multiply') {
      out.data[i] = Math.round(((dstR * srcR) / 255) * srcA + dstR * (1 - srcA));
      out.data[i + 1] = Math.round(((dstG * srcG) / 255) * srcA + dstG * (1 - srcA));
      out.data[i + 2] = Math.round(((dstB * srcB) / 255) * srcA + dstB * (1 - srcA));
      out.data[i + 3] = Math.round(Math.max(dstA, srcA) * 255);
      continue;
    }

    // Normal (Alpha Compositing)
    const outA = srcA + dstA * (1 - srcA);
    if (outA > 0) {
      out.data[i] = Math.round((srcR * srcA + dstR * dstA * (1 - srcA)) / outA);
      out.data[i + 1] = Math.round((srcG * srcA + dstG * dstA * (1 - srcA)) / outA);
      out.data[i + 2] = Math.round((srcB * srcA + dstB * dstA * (1 - srcA)) / outA);
      out.data[i + 3] = Math.round(outA * 255);
    }
  }

  return out;
}

// Convert frame to ImageData for direct Canvas putImageData
export function frameToImageData(frame: PixelFrame): ImageData {
  return new ImageData(new Uint8ClampedArray(frame.data), frame.width, frame.height);
}

// Render frame to an HTMLCanvasElement with nearest-neighbor scaling
export function renderFrameToCanvas(
  frame: PixelFrame,
  canvas: HTMLCanvasElement,
  scale = 1
): void {
  canvas.width = frame.width * scale;
  canvas.height = frame.height * scale;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.imageSmoothingEnabled = false;

  if (scale === 1) {
    const imgData = frameToImageData(frame);
    ctx.putImageData(imgData, 0, 0);
  } else {
    // Offscreen render then nearest neighbor stretch
    const offscreen = document.createElement('canvas');
    offscreen.width = frame.width;
    offscreen.height = frame.height;
    const offCtx = offscreen.getContext('2d');
    if (offCtx) {
      offCtx.putImageData(frameToImageData(frame), 0, 0);
      ctx.drawImage(offscreen, 0, 0, canvas.width, canvas.height);
    }
  }
}
