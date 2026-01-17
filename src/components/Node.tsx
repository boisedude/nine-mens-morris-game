/**
 * Nine Men's Morris Node Component
 * Represents a single position on the board
 */

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

export function Node({
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
  const handleClick = () => {
    if (!disabled) {
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
      style={{ cursor: isClickable ? 'pointer' : 'default' }}
      role="button"
      aria-label={nodeLabel}
      aria-pressed={isSelected}
      tabIndex={isClickable ? 0 : -1}
    >
      {/* Node circle (background) */}
      <circle
        r={NODE_RADIUS}
        fill={piece ? 'transparent' : '#f5f5dc'}
        stroke={isHighlighted ? '#22c55e' : '#8b4513'}
        strokeWidth={isHighlighted ? 3 : 2}
        className={`transition-all duration-200 ${
          isHighlighted ? 'animate-pulse' : ''
        }`}
      />

      {/* Highlight indicator for valid moves */}
      {isHighlighted && !piece && (
        <circle
          r={NODE_RADIUS * 0.5}
          fill="#22c55e"
          opacity={0.6}
          className="animate-pulse"
        />
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

      {/* Node label (for debugging/accessibility) */}
      <text
        y={NODE_RADIUS + 14}
        textAnchor="middle"
        fontSize="10"
        fill="#666"
        className="select-none pointer-events-none"
      >
        {id}
      </text>
    </g>
  )
}
