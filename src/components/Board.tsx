/**
 * Nine Men's Morris Board Component
 * Renders the SVG-based board with 3 concentric squares and 24 nodes
 * Matte wood, hairline lines
 */

import { memo } from 'react'
import type { Board as BoardType, NodeId, MillPattern } from '@/types/morris.types'
import { Node } from './Node'
import { Connection } from './Connection'
import {
  NODES,
  CONNECTIONS,
  BOARD_VIEWBOX,
  getNodePosition,
} from '@/lib/boardLayout'

interface BoardProps {
  board: BoardType
  onNodeClick: (nodeId: NodeId) => void
  isHighlighted: (nodeId: NodeId) => boolean
  isNodeSelected: (nodeId: NodeId) => boolean
  isRemovable: (nodeId: NodeId) => boolean
  isInLastMill: (nodeId: NodeId) => boolean
  lastFormedMill?: MillPattern
  disabled?: boolean
}

export const Board = memo(function Board({
  board,
  onNodeClick,
  isHighlighted,
  isNodeSelected,
  isRemovable,
  isInLastMill,
  lastFormedMill,
  disabled = false,
}: BoardProps) {
  // Check if a connection is part of the last formed mill
  const isMillConnection = (from: NodeId, to: NodeId): boolean => {
    if (!lastFormedMill) return false
    return lastFormedMill.includes(from) && lastFormedMill.includes(to)
  }

  return (
    <div className="arcade-board overflow-hidden" role="grid" aria-label="Nine Men's Morris game board">
      <svg viewBox={BOARD_VIEWBOX} className="block h-auto w-full" style={{ aspectRatio: '1 / 1' }}>
        <defs>
          <pattern id="woodGrain" patternUnits="userSpaceOnUse" width="200" height="200">
            <rect width="200" height="200" fill="#8b6a45" />
            <path d="M0 15 Q50 10 100 15 T200 15" stroke="#7d5e3c" strokeWidth="2" fill="none" opacity="0.35" />
            <path d="M0 40 Q40 35 80 42 T160 38 T200 40" stroke="#977650" strokeWidth="1" fill="none" opacity="0.3" />
            <path d="M0 70 Q30 65 60 72 T120 68 T180 72 T200 70" stroke="#7d5e3c" strokeWidth="1.5" fill="none" opacity="0.35" />
            <path d="M0 100 Q45 95 90 102 T180 98 T200 100" stroke="#977650" strokeWidth="2" fill="none" opacity="0.25" />
            <path d="M0 130 Q35 125 70 132 T140 128 T200 132" stroke="#7d5e3c" strokeWidth="1" fill="none" opacity="0.35" />
            <path d="M0 160 Q40 155 80 162 T160 158 T200 160" stroke="#977650" strokeWidth="1.5" fill="none" opacity="0.3" />
            <path d="M0 190 Q30 185 60 192 T120 188 T180 192 T200 190" stroke="#7d5e3c" strokeWidth="2" fill="none" opacity="0.3" />
          </pattern>
        </defs>

        <rect x="0" y="0" width="100%" height="100%" fill="url(#woodGrain)" />

        <g className="connections">
          {CONNECTIONS.map((connection) => {
            const fromPos = getNodePosition(connection.from)
            const toPos = getNodePosition(connection.to)

            if (!fromPos || !toPos) return null

            return (
              <Connection
                key={`${connection.from}-${connection.to}`}
                from={fromPos}
                to={toPos}
                isMillConnection={isMillConnection(connection.from, connection.to)}
              />
            )
          })}
        </g>

        <g className="nodes">
          {NODES.map(node => (
            <Node
              key={node.id}
              id={node.id}
              position={node.position}
              piece={board.get(node.id) ?? null}
              onClick={disabled ? () => {} : onNodeClick}
              isHighlighted={!disabled && isHighlighted(node.id)}
              isSelected={!disabled && isNodeSelected(node.id)}
              isRemovable={!disabled && isRemovable(node.id)}
              isInMill={isInLastMill(node.id)}
              disabled={disabled}
            />
          ))}
        </g>
      </svg>
    </div>
  )
})
