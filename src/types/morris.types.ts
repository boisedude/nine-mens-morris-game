/**
 * Nine Men's Morris Game Type Definitions
 */

// Player identifiers
export type Player = 1 | 2 // 1 = White (Player), 2 = Black (AI)

// Node ID is a string like "a1", "b2", etc.
export type NodeId = string

// Game phases
export type GamePhase = 'placement' | 'movement' | 'flying'

// Game status
export type GameStatus = 'playing' | 'won' | 'draw'

// Game mode
export type GameMode = 'pvp' | 'pvc' // Player vs Player or Player vs Computer

// AI difficulty levels
export type Difficulty = 'easy' | 'medium' | 'hard'

// Node state: which player's piece is on the node (or null if empty)
export type NodeState = Player | null

// The board is a map from node IDs to their state
export type Board = Map<NodeId, NodeState>

// Position on the SVG board (for rendering)
export interface Position {
  x: number
  y: number
}

// Node definition with its position and adjacent nodes
export interface NodeDefinition {
  id: NodeId
  position: Position
  adjacent: NodeId[] // Adjacent nodes for movement
}

// A connection between two nodes (for drawing lines)
export interface Connection {
  from: NodeId
  to: NodeId
}

// Mill pattern (3 nodes that form a mill)
export type MillPattern = [NodeId, NodeId, NodeId]

// Move representation
export interface Move {
  from: NodeId | null // null for placement moves
  to: NodeId
  player: Player
  formedMill: boolean
  removedPiece?: NodeId // Node ID of piece removed after mill
}

// Valid move with optional metadata
export interface ValidMove {
  from: NodeId | null // null for placement
  to: NodeId
  score?: number // For AI evaluation
}

// Snapshot of game state for undo functionality
export interface GameStateSnapshot {
  board: Board
  currentPlayer: Player
  phase: GamePhase
  status: GameStatus
  winner: Player | null
  moveHistory: Move[]
  lastMove?: Move
  player1PiecesInHand: number
  player2PiecesInHand: number
  player1PiecesOnBoard: number
  player2PiecesOnBoard: number
  validMoves: ValidMove[]
  mustRemovePiece: boolean
  lastFormedMill?: MillPattern
  positionKeys?: string[]
}

// Complete game state
export interface GameState {
  board: Board
  currentPlayer: Player
  phase: GamePhase
  status: GameStatus
  winner: Player | null
  mode: GameMode
  difficulty: Difficulty
  moveHistory: Move[]
  lastMove?: Move

  // Piece counts
  player1PiecesInHand: number // Pieces not yet placed
  player2PiecesInHand: number
  player1PiecesOnBoard: number
  player2PiecesOnBoard: number

  // Valid moves
  validMoves: ValidMove[]

  // Mill detection
  mustRemovePiece: boolean // True if current player just formed a mill
  lastFormedMill?: MillPattern // For highlighting

  // Positions reached since the last capture (post-placement), for threefold repetition
  positionKeys?: string[]

  // UI state
  selectedNode?: NodeId

  // Undo history - stores snapshots of game state before player moves
  undoHistory: GameStateSnapshot[]
}

// Leaderboard entry
export interface LeaderboardEntry {
  playerName: string
  wins: number
  losses: number
  draws: number
  winStreak: number
  longestWinStreak: number
  millsFormed: number
  piecesRemoved: number
  perfectGames: number // Games where opponent couldn't move
  totalGames: number
  quickestWin: number // Fewest moves to win (0 if never won)
}

// Constants
export const PIECES_PER_PLAYER = 9
export const MIN_PIECES_TO_LOSE = 2 // Player loses if reduced to 2 pieces
export const FLYING_THRESHOLD = 3 // Player can fly when reduced to 3 pieces
