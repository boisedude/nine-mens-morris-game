/**
 * Nine Men's Morris Connection Component
 * A hairline between two nodes; lines of the last mill are drawn in sagebrush
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
      stroke={isMillConnection ? '#b5ca9b' : '#3d2a18'}
      strokeWidth={isMillConnection ? 1.5 : 1}
      strokeLinecap="round"
    />
  )
}
