/**
 * Nine Men's Morris Node Component
 * Represents a single position on the board with premium 3D carved effect
 */

import { memo, useState } from 'react'
import type { Player, NodeId, Position } from '@/types/morris.types'
import { Piece } from './Piece'
import { NODE_RADIUS } from '@/lib/boardLayout'

interface NodeProps {
  id: NodeId
  position: Position
  piece: Player | null
  onClick: (nodeId: NodeId) => void
  isHighlighted: boolean
  isSelected: boolean
  isRemovable: boolean
  isInMill: boolean
  disabled: boolean
}

export const Node = memo(function Node({
  id,
  position,
  piece,
  onClick,
  isHighlighted,
  isSelected,
  isRemovable,
  isInMill,
  disabled,
}: NodeProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const handleClick = () => {
    if (!disabled) {
      onClick(id)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!disabled && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault()
      onClick(id)
    }
  }

  // Generate accessible label
  const nodeLabel = piece
    ? `${id}: ${piece === 1 ? 'White' : 'Black'} piece${isSelected ? ', selected' : ''}${isRemovable ? ', can be removed' : ''}`
    : isHighlighted
      ? `${id}: valid move destination`
      : `${id}: empty`

  const isClickable = !disabled && (piece !== null || isHighlighted || isRemovable)

  return (
    <g
      transform={`translate(${position.x}, ${position.y})`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      style={{
        cursor: isClickable ? 'pointer' : 'default',
        transition: 'transform 0.15s ease-out',
        transform: isHovered && isClickable ? 'scale(1.05)' : 'scale(1)',
      }}
      role="button"
      aria-label={nodeLabel}
      aria-pressed={isSelected}
      tabIndex={isClickable ? 0 : -1}
    >
      {/* Focus ring indicator for keyboard navigation */}
      {isFocused && isClickable && (
        <circle
          r={NODE_RADIUS + 5}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={3}
          className="focus-ring"
          style={{
            filter: 'drop-shadow(0 0 4px rgba(59, 130, 246, 0.5))',
          }}
        />
      )}

      {/* Outer glow for hover effect */}
      {isHovered && isClickable && !isFocused && (
        <circle
          r={NODE_RADIUS + 4}
          fill="none"
          stroke="rgba(212, 165, 116, 0.6)"
          strokeWidth={3}
          style={{
            filter: 'drop-shadow(0 0 6px rgba(212, 165, 116, 0.4))',
          }}
        />
      )}

      {/* Node shadow (carved depth) */}
      <circle
        r={NODE_RADIUS}
        fill="none"
        stroke="rgba(74, 53, 32, 0.4)"
        strokeWidth={3}
        transform="translate(1.5, 1.5)"
      />

      {/* Node highlight (carved depth) */}
      <circle
        r={NODE_RADIUS - 1}
        fill="none"
        stroke="rgba(245, 230, 211, 0.25)"
        strokeWidth={1}
        transform="translate(-0.5, -0.5)"
      />

      {/* Main node circle - 3D carved look */}
      <circle
        r={NODE_RADIUS}
        fill={piece ? 'transparent' : 'url(#nodeGradient)'}
        stroke={isHighlighted ? '#22c55e' : '#5d3a1a'}
        strokeWidth={isHighlighted ? 3 : 2.5}
        className={`transition-all duration-200 ${
          isHighlighted ? 'animate-valid-move-pulse' : ''
        }`}
        style={{
          filter: isHighlighted
            ? 'drop-shadow(0 0 8px rgba(34, 197, 94, 0.6))'
            : 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2))',
        }}
      />

      {/* Inner circle for 3D depth when empty */}
      {!piece && (
        <>
          {/* Carved inner shadow */}
          <circle
            r={NODE_RADIUS - 3}
            fill="url(#nodeInnerGradient)"
            stroke="none"
          />

          {/* Center highlight dot */}
          <circle
            r={3}
            fill="rgba(245, 230, 211, 0.4)"
            cx={-2}
            cy={-2}
          />
        </>
      )}

      {/* Highlight indicator for valid moves */}
      {isHighlighted && !piece && (
        <>
          {/* Glowing center for valid move */}
          <circle
            r={NODE_RADIUS * 0.55}
            fill="#22c55e"
            opacity={0.7}
            className="animate-valid-move-pulse"
            style={{
              filter: 'drop-shadow(0 0 6px rgba(34, 197, 94, 0.8))',
            }}
          />
          {/* Plus icon for colorblind accessibility */}
          <g stroke="#fff" strokeWidth={2.5} strokeLinecap="round" opacity={0.95}>
            <line x1={-6} y1={0} x2={6} y2={0} />
            <line x1={0} y1={-6} x2={0} y2={6} />
          </g>
        </>
      )}

      {/* Piece */}
      {piece && (
        <foreignObject
          x={-NODE_RADIUS}
          y={-NODE_RADIUS}
          width={NODE_RADIUS * 2}
          height={NODE_RADIUS * 2}
          className="overflow-visible"
        >
          <div className="flex items-center justify-center w-full h-full">
            <Piece
              player={piece}
              isSelected={isSelected}
              isRemovable={isRemovable}
              isInMill={isInMill}
            />
          </div>
        </foreignObject>
      )}

      {/* Node label with better visibility */}
      <text
        y={NODE_RADIUS + 15}
        textAnchor="middle"
        fontSize="9"
        fill="#5d3a1a"
        fontWeight="600"
        className="select-none pointer-events-none"
        style={{
          textShadow: '0 1px 1px rgba(255, 255, 255, 0.5)',
        }}
      >
        {id}
      </text>
    </g>
  )
})
