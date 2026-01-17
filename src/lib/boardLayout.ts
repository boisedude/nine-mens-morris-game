/**
 * Nine Men's Morris Board Layout
 * Defines node positions, connections, and mill patterns
 *
 * Board layout with node IDs:
 *
 * a7 -------- d7 -------- g7
 * |           |           |
 * |   b6 ---- d6 ---- f6  |
 * |   |       |       |   |
 * |   |  c5 - d5 - e5 |   |
 * |   |  |         |  |   |
 * a4 - b4 - c4     e4 - f4 - g4
 * |   |  |         |  |   |
 * |   |  c3 - d3 - e3 |   |
 * |   |       |       |   |
 * |   b2 ---- d2 ---- f2  |
 * |           |           |
 * a1 -------- d1 -------- g1
 */

import type { NodeDefinition, Connection, MillPattern, NodeId, Position } from '@/types/morris.types'

// Board dimensions for SVG (viewBox will be 0 0 400 400)
const BOARD_SIZE = 400
const PADDING = 40
const OUTER_SIZE = BOARD_SIZE - 2 * PADDING
const MIDDLE_SIZE = OUTER_SIZE * 0.666
const INNER_SIZE = OUTER_SIZE * 0.333

// Calculate center offset for each ring
const outerOffset = PADDING
const middleOffset = PADDING + (OUTER_SIZE - MIDDLE_SIZE) / 2
const innerOffset = PADDING + (OUTER_SIZE - INNER_SIZE) / 2
const center = BOARD_SIZE / 2

// Helper to create positions for a square ring
function createRingPositions(offset: number, size: number): Record<string, Position> {
  return {
    topLeft: { x: offset, y: offset },
    topCenter: { x: offset + size / 2, y: offset },
    topRight: { x: offset + size, y: offset },
    middleLeft: { x: offset, y: offset + size / 2 },
    middleRight: { x: offset + size, y: offset + size / 2 },
    bottomLeft: { x: offset, y: offset + size },
    bottomCenter: { x: offset + size / 2, y: offset + size },
    bottomRight: { x: offset + size, y: offset + size },
  }
}

const outerRing = createRingPositions(outerOffset, OUTER_SIZE)
const middleRing = createRingPositions(middleOffset, MIDDLE_SIZE)
const innerRing = createRingPositions(innerOffset, INNER_SIZE)

// Node definitions with positions and adjacencies
export const NODES: NodeDefinition[] = [
  // Outer ring (row 7, 4, 1 for corners; cols a, d, g)
  { id: 'a7', position: outerRing.topLeft, adjacent: ['d7', 'a4'] },
  { id: 'd7', position: outerRing.topCenter, adjacent: ['a7', 'g7', 'd6'] },
  { id: 'g7', position: outerRing.topRight, adjacent: ['d7', 'g4'] },
  { id: 'a4', position: outerRing.middleLeft, adjacent: ['a7', 'a1', 'b4'] },
  { id: 'g4', position: outerRing.middleRight, adjacent: ['g7', 'g1', 'f4'] },
  { id: 'a1', position: outerRing.bottomLeft, adjacent: ['a4', 'd1'] },
  { id: 'd1', position: outerRing.bottomCenter, adjacent: ['a1', 'g1', 'd2'] },
  { id: 'g1', position: outerRing.bottomRight, adjacent: ['d1', 'g4'] },

  // Middle ring (row 6, 4, 2 for corners; cols b, d, f)
  { id: 'b6', position: middleRing.topLeft, adjacent: ['d6', 'b4'] },
  { id: 'd6', position: middleRing.topCenter, adjacent: ['b6', 'f6', 'd7', 'd5'] },
  { id: 'f6', position: middleRing.topRight, adjacent: ['d6', 'f4'] },
  { id: 'b4', position: middleRing.middleLeft, adjacent: ['b6', 'b2', 'a4', 'c4'] },
  { id: 'f4', position: middleRing.middleRight, adjacent: ['f6', 'f2', 'g4', 'e4'] },
  { id: 'b2', position: middleRing.bottomLeft, adjacent: ['b4', 'd2'] },
  { id: 'd2', position: middleRing.bottomCenter, adjacent: ['b2', 'f2', 'd1', 'd3'] },
  { id: 'f2', position: middleRing.bottomRight, adjacent: ['d2', 'f4'] },

  // Inner ring (row 5, 4, 3 for corners; cols c, d, e)
  { id: 'c5', position: innerRing.topLeft, adjacent: ['d5', 'c4'] },
  { id: 'd5', position: innerRing.topCenter, adjacent: ['c5', 'e5', 'd6'] },
  { id: 'e5', position: innerRing.topRight, adjacent: ['d5', 'e4'] },
  { id: 'c4', position: innerRing.middleLeft, adjacent: ['c5', 'c3', 'b4'] },
  { id: 'e4', position: innerRing.middleRight, adjacent: ['e5', 'e3', 'f4'] },
  { id: 'c3', position: innerRing.bottomLeft, adjacent: ['c4', 'd3'] },
  { id: 'd3', position: innerRing.bottomCenter, adjacent: ['c3', 'e3', 'd2'] },
  { id: 'e3', position: innerRing.bottomRight, adjacent: ['d3', 'e4'] },
]

// Map for quick node lookup
export const NODE_MAP: Map<NodeId, NodeDefinition> = new Map(
  NODES.map(node => [node.id, node])
)

// Connections for drawing lines between nodes
export const CONNECTIONS: Connection[] = [
  // Outer ring
  { from: 'a7', to: 'd7' },
  { from: 'd7', to: 'g7' },
  { from: 'g7', to: 'g4' },
  { from: 'g4', to: 'g1' },
  { from: 'g1', to: 'd1' },
  { from: 'd1', to: 'a1' },
  { from: 'a1', to: 'a4' },
  { from: 'a4', to: 'a7' },

  // Middle ring
  { from: 'b6', to: 'd6' },
  { from: 'd6', to: 'f6' },
  { from: 'f6', to: 'f4' },
  { from: 'f4', to: 'f2' },
  { from: 'f2', to: 'd2' },
  { from: 'd2', to: 'b2' },
  { from: 'b2', to: 'b4' },
  { from: 'b4', to: 'b6' },

  // Inner ring
  { from: 'c5', to: 'd5' },
  { from: 'd5', to: 'e5' },
  { from: 'e5', to: 'e4' },
  { from: 'e4', to: 'e3' },
  { from: 'e3', to: 'd3' },
  { from: 'd3', to: 'c3' },
  { from: 'c3', to: 'c4' },
  { from: 'c4', to: 'c5' },

  // Cross connections (connecting rings)
  { from: 'd7', to: 'd6' },
  { from: 'd6', to: 'd5' },
  { from: 'a4', to: 'b4' },
  { from: 'b4', to: 'c4' },
  { from: 'g4', to: 'f4' },
  { from: 'f4', to: 'e4' },
  { from: 'd1', to: 'd2' },
  { from: 'd2', to: 'd3' },
]

// All possible mill patterns (16 total)
export const MILL_PATTERNS: MillPattern[] = [
  // Outer ring mills
  ['a7', 'd7', 'g7'], // top row
  ['a1', 'd1', 'g1'], // bottom row
  ['a7', 'a4', 'a1'], // left column
  ['g7', 'g4', 'g1'], // right column

  // Middle ring mills
  ['b6', 'd6', 'f6'], // top row
  ['b2', 'd2', 'f2'], // bottom row
  ['b6', 'b4', 'b2'], // left column
  ['f6', 'f4', 'f2'], // right column

  // Inner ring mills
  ['c5', 'd5', 'e5'], // top row
  ['c3', 'd3', 'e3'], // bottom row
  ['c5', 'c4', 'c3'], // left column
  ['e5', 'e4', 'e3'], // right column

  // Cross mills (connecting rings)
  ['d7', 'd6', 'd5'], // top center column
  ['d1', 'd2', 'd3'], // bottom center column
  ['a4', 'b4', 'c4'], // left center row
  ['g4', 'f4', 'e4'], // right center row
]

// Get node position by ID
export function getNodePosition(nodeId: NodeId): Position | undefined {
  return NODE_MAP.get(nodeId)?.position
}

// Get adjacent nodes for a given node
export function getAdjacentNodes(nodeId: NodeId): NodeId[] {
  return NODE_MAP.get(nodeId)?.adjacent ?? []
}

// Check if two nodes are adjacent
export function areNodesAdjacent(node1: NodeId, node2: NodeId): boolean {
  const adjacentNodes = getAdjacentNodes(node1)
  return adjacentNodes.includes(node2)
}

// Get all node IDs
export function getAllNodeIds(): NodeId[] {
  return NODES.map(node => node.id)
}

// Board size for SVG viewBox
export const BOARD_VIEWBOX = `0 0 ${BOARD_SIZE} ${BOARD_SIZE}`
export const NODE_RADIUS = 16
export { center as BOARD_CENTER }
