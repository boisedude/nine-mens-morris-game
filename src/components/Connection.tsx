/**
 * Nine Men's Morris Connection Component
 * Draws carved/etched lines between nodes with premium visual effects
 */

import type { Position } from '@/types/morris.types'

interface ConnectionProps {
  from: Position
  to: Position
  isMillConnection?: boolean
}

export function Connection({ from, to, isMillConnection = false }: ConnectionProps) {
  return (
    <g>
      {/* Shadow line for carved depth effect */}
      <line
        x1={from.x + 1}
        y1={from.y + 1}
        x2={to.x + 1}
        y2={to.y + 1}
        stroke="rgba(74, 53, 32, 0.5)"
        strokeWidth={isMillConnection ? 5 : 4}
        strokeLinecap="round"
      />

      {/* Highlight line for carved depth effect */}
      <line
        x1={from.x - 0.5}
        y1={from.y - 0.5}
        x2={to.x - 0.5}
        y2={to.y - 0.5}
        stroke="rgba(245, 230, 211, 0.3)"
        strokeWidth={isMillConnection ? 3 : 2}
        strokeLinecap="round"
      />

      {/* Main connection line */}
      <line
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        stroke={isMillConnection ? '#fbbf24' : '#6b3d1e'}
        strokeWidth={isMillConnection ? 4 : 3}
        strokeLinecap="round"
        className={isMillConnection ? 'animate-mill-flash' : ''}
        style={{
          filter: isMillConnection ? 'drop-shadow(0 0 6px #fbbf24)' : 'none',
          transition: 'all 0.3s ease',
        }}
      />

      {/* Metallic highlight for mill connections */}
      {isMillConnection && (
        <line
          x1={from.x}
          y1={from.y}
          x2={to.x}
          y2={to.y}
          stroke="rgba(255, 255, 255, 0.4)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeDasharray="4 8"
          style={{
            animation: 'shimmer 1s linear infinite',
          }}
        />
      )}
    </g>
  )
}
