/**
 * Nine Men's Morris Connection Component
 * Draws a line between two nodes
 */

import type { Position } from '@/types/morris.types'

interface ConnectionProps {
  from: Position
  to: Position
  isMillConnection?: boolean
}

export function Connection({ from, to, isMillConnection = false }: ConnectionProps) {
  return (
    <line
      x1={from.x}
      y1={from.y}
      x2={to.x}
      y2={to.y}
      stroke={isMillConnection ? '#fbbf24' : '#8b4513'}
      strokeWidth={isMillConnection ? 4 : 3}
      strokeLinecap="round"
      className={isMillConnection ? 'animate-mill-flash' : ''}
    />
  )
}
