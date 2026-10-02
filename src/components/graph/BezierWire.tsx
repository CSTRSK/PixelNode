import React, { useState } from 'react';
import { X } from 'lucide-react';

interface BezierWireProps {
  id: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  isSelected?: boolean;
  isActive?: boolean;
  onDelete: (id: string) => void;
  onSelect?: (id: string) => void;
}

export const BezierWire: React.FC<BezierWireProps> = ({
  id,
  fromX,
  fromY,
  toX,
  toY,
  isSelected = false,
  isActive = false,
  onDelete,
  onSelect
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Calculate smooth cubic bezier path
  const dx = Math.abs(toX - fromX);
  const controlOffset = Math.max(40, dx * 0.5);

  const p1x = fromX + controlOffset;
  const p1y = fromY;
  const p2x = toX - controlOffset;
  const p2y = toY;

  const pathData = `M ${fromX} ${fromY} C ${p1x} ${p1y}, ${p2x} ${p2y}, ${toX} ${toY}`;

  // Midpoint for the hover cut/delete button
  const midX = (fromX + toX) / 2;
  const midY = (fromY + toY) / 2;

  return (
    <g
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="cursor-pointer group"
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.(id);
      }}
    >
      {/* Invisible wider stroke for easy clicking/hovering */}
      <path
        d={pathData}
        fill="none"
        stroke="transparent"
        strokeWidth={18}
      />

      {/* Outer glow when selected */}
      {isSelected && (
        <path
          d={pathData}
          fill="none"
          stroke="#818cf8"
          strokeWidth={6}
          strokeOpacity={0.6}
        />
      )}

      {/* Main wire line */}
      <path
        d={pathData}
        fill="none"
        stroke={isSelected ? '#4f46e5' : isHovered ? '#6366f1' : '#94a3b8'}
        strokeWidth={isSelected ? 3 : 2.5}
        strokeLinecap="round"
        className="transition-colors duration-150"
      />

      {/* Active animation pulse dots */}
      {isActive && (
        <path
          d={pathData}
          fill="none"
          stroke="#ffffff"
          strokeWidth={1.5}
          strokeDasharray="4 8"
          className="animate-pulse"
        />
      )}

      {/* Hover delete / disconnect badge */}
      {(isHovered || isSelected) && (
        <g
          transform={`translate(${midX}, ${midY})`}
          className="transition-transform duration-150 hover:scale-125"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(id);
          }}
        >
          <circle
            r={10}
            fill="#ffffff"
            stroke="#ef4444"
            strokeWidth={1.5}
            className="shadow-sm"
          />
          <X
            x={-5}
            y={-5}
            width={10}
            height={10}
            className="text-rose-600 stroke-2 pointer-events-none"
          />
        </g>
      )}
    </g>
  );
};
