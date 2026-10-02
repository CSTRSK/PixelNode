import React from 'react';
import { NodePort } from '../../types/nodes';

interface NodePortItemProps {
  port: NodePort;
  nodeId: string;
  isConnected: boolean;
  isConnecting?: boolean;
  isValidTarget?: boolean;
  onPortClick: (e: React.MouseEvent, nodeId: string, portId: string, direction: 'input' | 'output') => void;
  onPortMouseDown: (e: React.MouseEvent, nodeId: string, portId: string, direction: 'input' | 'output') => void;
  onPortMouseUp: (e: React.MouseEvent, nodeId: string, portId: string, direction: 'input' | 'output') => void;
}

export const NodePortItem: React.FC<NodePortItemProps> = ({
  port,
  nodeId,
  isConnected,
  isConnecting = false,
  isValidTarget = false,
  onPortClick,
  onPortMouseDown,
  onPortMouseUp
}) => {
  const isInput = port.direction === 'input';

  // Bead styling
  const isStream = port.type === 'stream';
  let beadClasses = 'bg-white border-2 border-emerald-500 text-emerald-700';

  if (isStream) {
    beadClasses = isConnected
      ? 'bg-violet-600 border-2 border-violet-700 ring-2 ring-violet-200'
      : 'bg-white border-2 border-violet-500 text-violet-700';
  } else {
    beadClasses = isConnected
      ? 'bg-emerald-600 border-2 border-emerald-700 ring-2 ring-emerald-200'
      : 'bg-white border-2 border-emerald-500 text-emerald-700';
  }

  if (isValidTarget) {
    beadClasses += ' scale-135 ring-4 ring-indigo-400 animate-pulse';
  }

  return (
    <div
      className={`group relative flex items-center h-6 py-0.5 text-xs select-none cursor-pointer ${
        isInput ? 'flex-row pl-2.5' : 'flex-row-reverse text-right pr-2.5'
      }`}
      onClick={(e) => {
        e.stopPropagation();
        onPortClick(e, nodeId, port.id, port.direction);
      }}
      data-port-id={port.id}
      data-node-id={nodeId}
      data-direction={port.direction}
    >
      {/* Port Connector Bead positioned right on the card edge */}
      <button
        type="button"
        className={`absolute z-10 w-4 h-4 rounded-full transition-all hover:scale-130 shadow-xs cursor-pointer flex items-center justify-center ${
          isInput ? '-left-2' : '-right-2'
        } ${beadClasses}`}
        onMouseDown={(e) => {
          e.stopPropagation();
          onPortMouseDown(e, nodeId, port.id, port.direction);
        }}
        onMouseUp={(e) => {
          e.stopPropagation();
          onPortMouseUp(e, nodeId, port.id, port.direction);
        }}
        title={`${port.name} (${port.direction === 'input' ? 'Click or drag to connect input' : 'Click or drag to connect output'})`}
      >
        <div className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
      </button>

      {/* Port Label */}
      <span className={`text-[11px] font-medium truncate max-w-[100px] transition-colors ${
        isConnected ? 'text-slate-800 font-semibold' : 'text-slate-500 group-hover:text-slate-900'
      }`}>
        {port.name}
      </span>
    </div>
  );
};
