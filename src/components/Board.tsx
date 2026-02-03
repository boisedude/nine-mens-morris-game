/**
 * Nine Men's Morris Board Component
 * Renders the SVG-based board with 3 concentric squares and 24 nodes
 * Enhanced with premium wood textures, carved lines, and depth effects
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
    <div className="w-full max-w-[95vw] sm:max-w-lg mx-auto px-1 sm:px-0">
      {/* Premium board frame with carved border effect */}
      <div
        className="rounded-xl p-3 sm:p-5 board-premium-shadow"
        style={{
          background: 'linear-gradient(145deg, #8B5A2B 0%, #654321 50%, #5D3A1A 100%)',
          border: '6px solid #4a2c17',
          boxShadow: `
            inset 0 2px 4px rgba(255, 255, 255, 0.1),
            inset 0 -2px 4px rgba(0, 0, 0, 0.3),
            0 12px 40px rgba(0, 0, 0, 0.4),
            0 6px 20px rgba(0, 0, 0, 0.3)
          `,
        }}
        role="grid"
        aria-label="Nine Men's Morris game board"
      >
        {/* Inner board with inset effect */}
        <div
          className="rounded-lg overflow-hidden"
          style={{
            boxShadow: `
              inset 0 4px 12px rgba(0, 0, 0, 0.4),
              inset 0 -2px 6px rgba(255, 255, 255, 0.05)
            `,
          }}
        >
          <svg
            viewBox={BOARD_VIEWBOX}
            className="w-full h-auto"
            style={{ aspectRatio: '1 / 1' }}
          >
            {/* SVG Definitions for textures and effects */}
            <defs>
              {/* Premium wood grain pattern - realistic */}
              <pattern
                id="woodGrainPremium"
                patternUnits="userSpaceOnUse"
                width="200"
                height="200"
              >
                {/* Base wood color variations */}
                <rect width="200" height="200" fill="#d4a574" />

                {/* Wood grain lines - varied thickness and curves */}
                <path d="M0 15 Q50 10 100 15 T200 15" stroke="#c49660" strokeWidth="2" fill="none" opacity="0.4" />
                <path d="M0 25 Q60 20 120 28 T200 22" stroke="#b8865a" strokeWidth="1.5" fill="none" opacity="0.3" />
                <path d="M0 40 Q40 35 80 42 T160 38 T200 40" stroke="#c49660" strokeWidth="1" fill="none" opacity="0.35" />
                <path d="M0 55 Q70 50 140 58 T200 52" stroke="#a07850" strokeWidth="2" fill="none" opacity="0.25" />
                <path d="M0 70 Q30 65 60 72 T120 68 T180 72 T200 70" stroke="#c49660" strokeWidth="1.5" fill="none" opacity="0.4" />
                <path d="M0 85 Q55 80 110 88 T200 82" stroke="#b8865a" strokeWidth="1" fill="none" opacity="0.3" />
                <path d="M0 100 Q45 95 90 102 T180 98 T200 100" stroke="#c49660" strokeWidth="2" fill="none" opacity="0.35" />
                <path d="M0 115 Q65 110 130 118 T200 112" stroke="#a07850" strokeWidth="1.5" fill="none" opacity="0.25" />
                <path d="M0 130 Q35 125 70 132 T140 128 T200 132" stroke="#c49660" strokeWidth="1" fill="none" opacity="0.4" />
                <path d="M0 145 Q50 140 100 148 T200 142" stroke="#b8865a" strokeWidth="2" fill="none" opacity="0.3" />
                <path d="M0 160 Q40 155 80 162 T160 158 T200 160" stroke="#c49660" strokeWidth="1.5" fill="none" opacity="0.35" />
                <path d="M0 175 Q60 170 120 178 T200 172" stroke="#a07850" strokeWidth="1" fill="none" opacity="0.25" />
                <path d="M0 190 Q30 185 60 192 T120 188 T180 192 T200 190" stroke="#c49660" strokeWidth="2" fill="none" opacity="0.4" />

                {/* Knot variations */}
                <ellipse cx="50" cy="60" rx="8" ry="12" fill="none" stroke="#9a7040" strokeWidth="1" opacity="0.2" />
                <ellipse cx="150" cy="140" rx="6" ry="10" fill="none" stroke="#9a7040" strokeWidth="1" opacity="0.15" />
              </pattern>

              {/* Noise texture for subtle grain */}
              <filter id="woodNoise" x="0%" y="0%" width="100%" height="100%">
                <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" result="noise" />
                <feColorMatrix type="saturate" values="0" />
                <feBlend in="SourceGraphic" in2="noise" mode="multiply" result="blend" />
                <feBlend in="blend" in2="SourceGraphic" mode="overlay" />
              </filter>

              {/* Carved line effect filter */}
              <filter id="carvedLine" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur" />
                <feOffset in="blur" dx="1" dy="1" result="offsetBlur" />
                <feFlood floodColor="#4a3520" floodOpacity="0.6" result="darkShadow" />
                <feComposite in="darkShadow" in2="offsetBlur" operator="in" result="darkComposite" />
                <feOffset in="blur" dx="-0.5" dy="-0.5" result="offsetBlurLight" />
                <feFlood floodColor="#f5e6d3" floodOpacity="0.4" result="lightHighlight" />
                <feComposite in="lightHighlight" in2="offsetBlurLight" operator="in" result="lightComposite" />
                <feMerge>
                  <feMergeNode in="darkComposite" />
                  <feMergeNode in="SourceGraphic" />
                  <feMergeNode in="lightComposite" />
                </feMerge>
              </filter>

              {/* Glow filter for mill connections */}
              <filter id="millGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
                <feFlood floodColor="#fbbf24" floodOpacity="0.8" />
                <feComposite in2="blur" operator="in" />
                <feMerge>
                  <feMergeNode />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Vignette gradient for depth */}
              <radialGradient id="boardVignette" cx="50%" cy="50%" r="70%">
                <stop offset="0%" stopColor="transparent" />
                <stop offset="85%" stopColor="transparent" />
                <stop offset="100%" stopColor="rgba(0,0,0,0.15)" />
              </radialGradient>

              {/* Subtle inner shadow gradient */}
              <linearGradient id="innerShadowTop" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(0,0,0,0.12)" />
                <stop offset="8%" stopColor="transparent" />
              </linearGradient>
              <linearGradient id="innerShadowLeft" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(0,0,0,0.08)" />
                <stop offset="8%" stopColor="transparent" />
              </linearGradient>

              {/* Node gradients (moved from Node.tsx for performance) */}
              <radialGradient id="nodeGradient" cx="30%" cy="30%">
                <stop offset="0%" stopColor="#e8dcc8" />
                <stop offset="60%" stopColor="#d4c4a8" />
                <stop offset="100%" stopColor="#c4b090" />
              </radialGradient>
              <radialGradient id="nodeInnerGradient" cx="70%" cy="70%">
                <stop offset="0%" stopColor="#b8a888" />
                <stop offset="100%" stopColor="#a89878" />
              </radialGradient>
            </defs>

            {/* Board background - base wood color */}
            <rect
              x="0"
              y="0"
              width="100%"
              height="100%"
              fill="#d4a574"
              rx="4"
            />

            {/* Wood grain texture overlay */}
            <rect
              x="0"
              y="0"
              width="100%"
              height="100%"
              fill="url(#woodGrainPremium)"
              rx="4"
            />

            {/* Subtle vignette for depth */}
            <rect
              x="0"
              y="0"
              width="100%"
              height="100%"
              fill="url(#boardVignette)"
              rx="4"
            />

            {/* Inner shadows */}
            <rect x="0" y="0" width="100%" height="100%" fill="url(#innerShadowTop)" rx="4" />
            <rect x="0" y="0" width="100%" height="100%" fill="url(#innerShadowLeft)" rx="4" />

            {/* Connections (carved lines between nodes) */}
            <g className="connections" filter="url(#carvedLine)">
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
    </div>
  )
})
