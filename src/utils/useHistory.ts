import { useState, useCallback, useRef } from 'react';
import { AppNode, NodeConnection } from '../types/nodes';

export interface GraphSnapshot {
  nodes: AppNode[];
  connections: NodeConnection[];
  fps: number;
}

const MAX_HISTORY = 40;

export function useHistory(initialState: GraphSnapshot) {
  const [past, setPast] = useState<GraphSnapshot[]>([]);
  const [present, setPresent] = useState<GraphSnapshot>(initialState);
  const [future, setFuture] = useState<GraphSnapshot[]>([]);

  // Ref to keep track of current present state synchronously to avoid race conditions in callbacks
  const presentRef = useRef<GraphSnapshot>(present);
  presentRef.current = present;

  const canUndo = past.length > 0;
  const canRedo = future.length > 0;

  // Record a new snapshot into history stack
  const record = useCallback((newSnapshot: GraphSnapshot) => {
    // Quick equality check to avoid recording redundant duplicate states
    const current = presentRef.current;
    if (
      current.nodes === newSnapshot.nodes &&
      current.connections === newSnapshot.connections &&
      current.fps === newSnapshot.fps
    ) {
      return;
    }

    setPast(prev => {
      const nextPast = [...prev, presentRef.current];
      if (nextPast.length > MAX_HISTORY) {
        return nextPast.slice(nextPast.length - MAX_HISTORY);
      }
      return nextPast;
    });
    setPresent(newSnapshot);
    setFuture([]); // Clear redo stack on new action
  }, []);

  // Undo step
  const undo = useCallback(() => {
    setPast(prevPast => {
      if (prevPast.length === 0) return prevPast;
      const previous = prevPast[prevPast.length - 1];
      const newPast = prevPast.slice(0, prevPast.length - 1);

      setFuture(prevFuture => [presentRef.current, ...prevFuture]);
      setPresent(previous);
      return newPast;
    });
  }, []);

  // Redo step
  const redo = useCallback(() => {
    setFuture(prevFuture => {
      if (prevFuture.length === 0) return prevFuture;
      const next = prevFuture[0];
      const newFuture = prevFuture.slice(1);

      setPast(prevPast => [...prevPast, presentRef.current]);
      setPresent(next);
      return newFuture;
    });
  }, []);

  // Reset entire history (e.g. when loading presets or importing project)
  const reset = useCallback((snapshot: GraphSnapshot) => {
    setPast([]);
    setPresent(snapshot);
    setFuture([]);
  }, []);

  return {
    state: present,
    canUndo,
    canRedo,
    undo,
    redo,
    record,
    reset,
    historyDepth: past.length,
    futureDepth: future.length
  };
}
