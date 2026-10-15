/**
 * Nine Men's Morris Node Component
 * Represents a single position on the board 
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

const SAGEBRUSH = '#b5ca9b'

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
    <g transform={`translate(${position.x}, ${position.y})`}>
    <g
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={(e) => setIsFocused(e.currentTarget.matches(':focus-visible'))}
      onBlur={() => setIsFocused(false)}
      style={{
        cursor: isClickable ? 'pointer' : 'default',
        transition: 'transform 0.15s ease-out',
        transform: isHovered && isClickable ? 'scale(1.05)' : 'scale(1)',
      }}
      className="outline-none"
      role="button"
      aria-label={nodeLabel}
      aria-pressed={isSelected}
      tabIndex={isClickable ? 0 : -1}
    >
      {/* Invisible hit area so a node is a comfortable tap target */}
      <circle r={21} fill="transparent" />

      {/* Keyboard focus ring */}
      {isFocused && isClickable && (
        <circle r={NODE_RADIUS + 7} fill="none" stroke={SAGEBRUSH} strokeWidth={1.5} strokeDasharray="3 3" />
      )}

      {/* Empty node: a shallow disc cut into the wood */}
      <circle
        r={NODE_RADIUS - 4}
        fill={piece ? 'transparent' : '#6f5233'}
        stroke="#3d2a18"
        strokeWidth={1}
      />

      {/* Static ring: valid destination, selected piece, removable piece */}
      {(isHighlighted || isSelected || isRemovable) && (
        <circle
          r={NODE_RADIUS + 3}
          fill="none"
          stroke={SAGEBRUSH}
          strokeWidth={isSelected ? 3 : 2}
        />
      )}

      {/* Mill: thin ring around each piece in the last mill */}
      {isInMill && piece && !isSelected && !isRemovable && (
        <circle r={NODE_RADIUS + 3} fill="none" stroke={SAGEBRUSH} strokeWidth={1} />
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

      {/* Node label */}
      <text
        y={NODE_RADIUS + 12}
        textAnchor="middle"
        fontSize="8"
        fill="rgba(245, 230, 211, 0.6)"
        className="select-none pointer-events-none"
      >
        {id}
      </text>
    </g>
    </g>
  )
})
