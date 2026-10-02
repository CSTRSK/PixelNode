import {
  AppNode,
  NodeConnection,
  PixelFrame,
  DrawingNodeData,
  SequencerNodeData,
  TransformNodeData,
  PaletteNodeData,
  BlenderNodeData,
  SubgraphNodeData
} from '../types/nodes';
import {
  createBlankFrame,
  cloneFrame,
  shiftFrame,
  flipFrameH,
  flipFrameV,
  rotateFrame,
  invertFrameColors,
  outlineFrame,
  applyGlitch,
  applyPalette,
  blendFrames
} from './pixelEngine';
import { RETRO_PALETTES } from './palettes';

export interface EvaluationResult {
  nodeOutputs: Map<string, PixelFrame[]>;
  activeOutputFrames: PixelFrame[];
  error?: string;
}

export function evaluateGraph(
  nodes: AppNode[],
  connections: NodeConnection[],
  previewNodeId?: string | null
): EvaluationResult {
  const nodeMap = new Map<string, AppNode>();
  nodes.forEach(n => nodeMap.set(n.id, n));

  const incomingConnections = new Map<string, NodeConnection[]>();
  nodes.forEach(n => incomingConnections.set(n.id, []));
  connections.forEach(c => {
    const list = incomingConnections.get(c.toNodeId);
    if (list) list.push(c);
  });

  const cache = new Map<string, PixelFrame[]>();
  const visiting = new Set<string>();

  function evaluateNode(nodeId: string): PixelFrame[] {
    if (cache.has(nodeId)) {
      return cache.get(nodeId)!;
    }
    if (visiting.has(nodeId)) {
      // Circular dependency detected, return empty fallback
      return [];
    }

    visiting.add(nodeId);
    const node = nodeMap.get(nodeId);
    if (!node) {
      visiting.delete(nodeId);
      return [];
    }

    let resultFrames: PixelFrame[] = [];

    try {
      switch (node.type) {
        case 'DRAWING': {
          const data = node.data as DrawingNodeData;
          const size = data.canvasSize || 16;
          const frame = createBlankFrame(size, size);
          if (data.pixels && data.pixels.length === size * size * 4) {
            frame.data.set(data.pixels);
          }
          resultFrames = [frame];
          break;
        }

        case 'SEQUENCER': {
          const data = node.data as SequencerNodeData;
          const nodeInConns = incomingConnections.get(node.id) || [];
          
          // Gather frames from all connected inputs
          const inputFramesMap = new Map<string, PixelFrame[]>();
          node.inputs.forEach(port => {
            const conn = nodeInConns.find(c => c.toPortId === port.id);
            if (conn) {
              const frames = evaluateNode(conn.fromNodeId);
              if (frames.length > 0) {
                inputFramesMap.set(port.id, frames);
              }
            }
          });

          // Build sequence: start with frameOrder
          const portOrder = [...(data.frameOrder && data.frameOrder.length > 0 ? data.frameOrder : [])];
          // Ensure all input ports on node are in portOrder
          node.inputs.forEach(port => {
            if (!portOrder.includes(port.id)) {
              portOrder.push(port.id);
            }
          });

          // Filter out ports that don't exist anymore on node.inputs
          const validPortIds = new Set(node.inputs.map(p => p.id));
          const effectiveOrder = portOrder.filter(id => validPortIds.has(id));

          // Filter to ports that actually have incoming frames
          const activePorts = effectiveOrder.filter(portId => {
            const f = inputFramesMap.get(portId);
            return f && f.length > 0;
          });

          // Determine ping-pong and playback mode
          const isPingPong = data.pingPong === true || data.playbackMode === 'pingpong';
          const isReverse = data.playbackMode === 'reverse';

          // Helper to expand a slot's frames with configured hold ticks
          const expandSlotFrames = (portId: string, reverseInner = false) => {
            const frames = inputFramesMap.get(portId);
            if (!frames || frames.length === 0) return [];
            const hold = Math.max(1, data.holdCounts?.[portId] || 1);
            const orderedFrames = reverseInner ? [...frames].reverse() : frames;
            const res: PixelFrame[] = [];
            for (let h = 0; h < hold; h++) {
              orderedFrames.forEach(f => res.push(cloneFrame(f)));
            }
            return res;
          };

          const rawSequence: PixelFrame[] = [];

          if (isPingPong && activePorts.length >= 2) {
            // Forward pass: 0 to N-1
            for (let i = 0; i < activePorts.length; i++) {
              rawSequence.push(...expandSlotFrames(activePorts[i], false));
            }
            // Alternating return pass: N-2 down to 1 (omitting endpoints so turnaround is smooth)
            for (let i = activePorts.length - 2; i >= 1; i--) {
              rawSequence.push(...expandSlotFrames(activePorts[i], true));
            }
          } else if (isReverse) {
            // Reverse pass: N-1 down to 0
            for (let i = activePorts.length - 1; i >= 0; i--) {
              rawSequence.push(...expandSlotFrames(activePorts[i], true));
            }
          } else {
            // Standard loop: 0 to N-1
            for (let i = 0; i < activePorts.length; i++) {
              rawSequence.push(...expandSlotFrames(activePorts[i], false));
            }
          }

          // If no active ports found, fallback to any available incoming connection
          if (rawSequence.length === 0) {
            for (const [, frames] of inputFramesMap) {
              frames.forEach(f => rawSequence.push(cloneFrame(f)));
            }
          }

          resultFrames = rawSequence;

          // If still empty, supply single default blank frame
          if (resultFrames.length === 0) {
            resultFrames = [createBlankFrame(16, 16)];
          }
          break;
        }

        case 'TRANSFORM': {
          const data = node.data as TransformNodeData;
          const nodeInConns = incomingConnections.get(node.id) || [];
          const primaryConn = nodeInConns[0];
          
          let inFrames: PixelFrame[] = [];
          if (primaryConn) {
            inFrames = evaluateNode(primaryConn.fromNodeId);
          }

          if (inFrames.length === 0) {
            inFrames = [createBlankFrame(16, 16)];
          }

          resultFrames = inFrames.map(srcFrame => {
            let f = cloneFrame(srcFrame);

            // Shift
            if (data.shiftX !== 0 || data.shiftY !== 0) {
              f = shiftFrame(f, data.shiftX || 0, data.shiftY || 0, data.wrapShift);
            }

            // Flip
            if (data.flipH) {
              f = flipFrameH(f);
            }
            if (data.flipV) {
              f = flipFrameV(f);
            }

            // Rotate
            if (data.rotate) {
              f = rotateFrame(f, data.rotate);
            }

            // Invert colors
            if (data.invertColors) {
              f = invertFrameColors(f);
            }

            // Outline
            if (data.addOutline) {
              f = outlineFrame(f, data.outlineColor || '#000000');
            }

            // Glitch
            if (data.glitchAmount && data.glitchAmount > 0) {
              f = applyGlitch(f, data.glitchAmount);
            }

            return f;
          });
          break;
        }

        case 'PALETTE': {
          const data = node.data as PaletteNodeData;
          const nodeInConns = incomingConnections.get(node.id) || [];
          const primaryConn = nodeInConns[0];

          let inFrames: PixelFrame[] = [];
          if (primaryConn) {
            inFrames = evaluateNode(primaryConn.fromNodeId);
          }
          if (inFrames.length === 0) {
            inFrames = [createBlankFrame(16, 16)];
          }

          const paletteDef = RETRO_PALETTES[data.palette] || RETRO_PALETTES.gameboy;
          const colors = (data.customColors && data.customColors.length > 0) 
            ? data.customColors 
            : paletteDef.colors;

          resultFrames = inFrames.map(f => applyPalette(f, colors));
          break;
        }

        case 'BLENDER': {
          const data = node.data as BlenderNodeData;
          const nodeInConns = incomingConnections.get(node.id) || [];
          const baseConn = nodeInConns.find(c => c.toPortId === 'in_base');
          const overlayConn = nodeInConns.find(c => c.toPortId === 'in_overlay');

          const baseFrames = baseConn ? evaluateNode(baseConn.fromNodeId) : [createBlankFrame(16, 16)];
          const overlayFrames = overlayConn ? evaluateNode(overlayConn.fromNodeId) : [createBlankFrame(16, 16)];

          const maxLen = Math.max(baseFrames.length, overlayFrames.length);
          resultFrames = [];

          for (let i = 0; i < maxLen; i++) {
            const bFrame = baseFrames[i % baseFrames.length];
            const oFrame = overlayFrames[i % overlayFrames.length];
            resultFrames.push(blendFrames(bFrame, oFrame, data.blendMode || 'normal', data.opacity ?? 1));
          }
          break;
        }

        case 'OUTPUT': {
          const nodeInConns = incomingConnections.get(node.id) || [];
          const primaryConn = nodeInConns[0];
          if (primaryConn) {
            resultFrames = evaluateNode(primaryConn.fromNodeId);
          }
          if (resultFrames.length === 0) {
            resultFrames = [createBlankFrame(16, 16)];
          }
          break;
        }

        case 'SUBGRAPH': {
          const data = node.data as SubgraphNodeData;
          if (!data || !data.innerNodes || data.innerNodes.length === 0) {
            resultFrames = [createBlankFrame(16, 16)];
            break;
          }

          // Evaluate the inner subgraph
          const innerEval = evaluateGraph(data.innerNodes, data.innerConnections || []);

          if (data.outputMappings && data.outputMappings.length > 0) {
            const mappedNodeId = data.outputMappings[0].innerNodeId;
            resultFrames = innerEval.nodeOutputs.get(mappedNodeId) || innerEval.activeOutputFrames;
          } else {
            resultFrames = innerEval.activeOutputFrames;
          }
          break;
        }
      }
    } catch (err) {
      console.error(`Error evaluating node ${nodeId}:`, err);
      resultFrames = [createBlankFrame(16, 16)];
    }

    visiting.delete(nodeId);
    cache.set(nodeId, resultFrames);
    return resultFrames;
  }

  // Evaluate all nodes so their previews are ready
  nodes.forEach(n => evaluateNode(n.id));

  // Determine active output stream
  let outputFrames: PixelFrame[] = [];

  if (previewNodeId && cache.has(previewNodeId)) {
    const candidate = cache.get(previewNodeId)!;
    if (candidate.length > 0) {
      outputFrames = candidate;
    }
  }

  if (outputFrames.length === 0) {
    const outputNode = nodes.find(n => n.type === 'OUTPUT');
    if (outputNode && cache.has(outputNode.id)) {
      outputFrames = cache.get(outputNode.id)!;
    } else if (nodes.length > 0) {
      // If no output node, pick the last non-empty evaluated node
      for (let i = nodes.length - 1; i >= 0; i--) {
        const f = cache.get(nodes[i].id);
        if (f && f.length > 0) {
          outputFrames = f;
          break;
        }
      }
    }
  }

  if (outputFrames.length === 0) {
    outputFrames = [createBlankFrame(16, 16)];
  }

  return {
    nodeOutputs: cache,
    activeOutputFrames: outputFrames
  };
}
