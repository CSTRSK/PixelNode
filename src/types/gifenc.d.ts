declare module 'gifenc' {
  export interface GIFEncoderOptions {
    auto?: boolean;
    initialCapacity?: number;
  }

  export interface WriteFrameOptions {
    palette?: number[][];
    delay?: number;
    repeat?: number;
    transparent?: boolean;
    dispose?: number;
  }

  export interface GIFEncoderInstance {
    writeFrame: (
      index: Uint8Array | number[],
      width: number,
      height: number,
      opts?: WriteFrameOptions
    ) => void;
    finish: () => void;
    bytesView: () => Uint8Array;
    bytes: () => Uint8Array;
    stream: any;
  }

  export function GIFEncoder(options?: GIFEncoderOptions): GIFEncoderInstance;

  export interface QuantizeOptions {
    format?: 'rgb565' | 'rgb444' | 'rgba4444';
    oneBitAlpha?: boolean;
    clearAlpha?: boolean;
    clearAlphaThreshold?: number;
    clearAlphaColor?: number;
  }

  export function quantize(
    rgba: Uint8Array | Uint8ClampedArray | number[],
    maxColors?: number,
    options?: QuantizeOptions
  ): number[][];

  export function applyPalette(
    rgba: Uint8Array | Uint8ClampedArray | number[],
    palette: number[][]
  ): Uint8Array;
}
