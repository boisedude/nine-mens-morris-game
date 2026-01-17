/**
 * Nine Men's Morris Board Component
 * Renders the SVG-based board with 3 concentric squares and 24 nodes
 */

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

export function Board({
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
    <div className="w-full max-w-[95vw] sm:max-w-lg mx-auto px-1 sm:px-0">
      <div
        className="bg-amber-100 rounded-lg shadow-2xl p-2 sm:p-4 border-4 border-amber-800"
        role="grid"
        aria-label="Nine Men's Morris game board"
      >
        <svg
          viewBox={BOARD_VIEWBOX}
          className="w-full h-auto"
          style={{ aspectRatio: '1 / 1' }}
        >
          {/* Board background */}
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="#deb887"
            rx="8"
          />

          {/* Wood grain effect */}
          <defs>
            <pattern
              id="woodGrain"
              patternUnits="userSpaceOnUse"
              width="100"
              height="100"
            >
              <path
                d="M0 20 Q25 15 50 20 T100 20"
                stroke="#c4a060"
                strokeWidth="1"
                fill="none"
                opacity="0.3"
              />
              <path
                d="M0 50 Q25 45 50 50 T100 50"
                stroke="#c4a060"
                strokeWidth="1"
                fill="none"
                opacity="0.3"
              />
              <path
                d="M0 80 Q25 75 50 80 T100 80"
                stroke="#c4a060"
                strokeWidth="1"
                fill="none"
                opacity="0.3"
              />
            </pattern>
          </defs>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="url(#woodGrain)"
          />

          {/* Connections (lines between nodes) */}
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

          {/* Nodes */}
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
    </div>
  )
}
