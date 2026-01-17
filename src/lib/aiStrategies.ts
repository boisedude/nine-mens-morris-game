/**
 * Nine Men's Morris AI Strategies
 * Implements minimax with alpha-beta pruning for different difficulty levels
 */

import type { Board, Player, ValidMove, Difficulty, GameState } from '@/types/morris.types'
import {
  getAllValidMoves,
  makeMove,
  checkGameOver,
  countPiecesOnBoard,
  countMills,
  checkMillFormed,
  getRemovablePieces,
  isPieceInMill,
  applyMove,
} from './morrisRules'
import { MILL_PATTERNS, getAdjacentNodes } from './boardLayout'

// AI search depth by difficulty level
const AI_DEPTH = {
  easy: 1,
  medium: 3,
  hard: 5,
} as const

// Scoring constants
const SCORE = {
  WIN: 100000,
  LOSS: -100000,
  MILL: 500,
  POTENTIAL_MILL: 100,
  PIECE: 50,
  BLOCKED_OPPONENT: 20,
  CENTER_CONTROL: 10,
  MOBILITY: 5,
} as const

// Random move chance for easier difficulties
const RANDOM_MOVE_CHANCE = {
  easy: 0.4,
  medium: 0.1,
  hard: 0,
} as const

// Center and strategic positions (more valuable)
const STRATEGIC_POSITIONS = new Set(['d7', 'd6', 'd5', 'd3', 'd2', 'd1', 'a4', 'b4', 'c4', 'e4', 'f4', 'g4'])

/**
 * Evaluates the board position for a player
 */
function evaluateBoard(state: GameState, player: Player): number {
  const opponent: Player = player === 1 ? 2 : 1

  // Check for game over
  const gameOver = checkGameOver(state)
  if (gameOver.isOver) {
    if (gameOver.winner === player) return SCORE.WIN
    if (gameOver.winner === opponent) return SCORE.LOSS
    return 0
  }

  let score = 0
  const pieces = countPiecesOnBoard(state.board)
  const playerPieces = player === 1 ? pieces.player1 : pieces.player2
  const opponentPieces = player === 1 ? pieces.player2 : pieces.player1

  // Material advantage
  score += (playerPieces - opponentPieces) * SCORE.PIECE

  // Mill count
  const playerMills = countMills(state.board, player)
  const opponentMills = countMills(state.board, opponent)
  score += (playerMills - opponentMills) * SCORE.MILL

  // Potential mills (two pieces in a line with empty third)
  score += countPotentialMills(state.board, player) * SCORE.POTENTIAL_MILL
  score -= countPotentialMills(state.board, opponent) * SCORE.POTENTIAL_MILL

  // Mobility (number of valid moves)
  const playerMoves = getValidMovesForPlayer(state, player).length
  const opponentMoves = getValidMovesForPlayer(state, opponent).length
  score += (playerMoves - opponentMoves) * SCORE.MOBILITY

  // Strategic position control
  state.board.forEach((piecePlayer, nodeId) => {
    if (piecePlayer === player && STRATEGIC_POSITIONS.has(nodeId)) {
      score += SCORE.CENTER_CONTROL
    } else if (piecePlayer === opponent && STRATEGIC_POSITIONS.has(nodeId)) {
      score -= SCORE.CENTER_CONTROL
    }
  })

  // Blocked opponent pieces (pieces with no valid moves)
  score += countBlockedPieces(state.board, opponent) * SCORE.BLOCKED_OPPONENT
  score -= countBlockedPieces(state.board, player) * SCORE.BLOCKED_OPPONENT

  return score
}

/**
 * Counts potential mills (two pieces with empty third position)
 */
function countPotentialMills(board: Board, player: Player): number {
  let count = 0

  for (const pattern of MILL_PATTERNS) {
    let playerCount = 0
    let emptyCount = 0

    for (const nodeId of pattern) {
      const piece = board.get(nodeId)
      if (piece === player) playerCount++
      else if (piece === null) emptyCount++
    }

    if (playerCount === 2 && emptyCount === 1) {
      count++
    }
  }

  return count
}

/**
 * Counts blocked pieces (pieces that cannot move)
 */
function countBlockedPieces(board: Board, player: Player): number {
  let blocked = 0

  board.forEach((piecePlayer, nodeId) => {
    if (piecePlayer === player) {
      const adjacent = getAdjacentNodes(nodeId)
      const canMove = adjacent.some(adjId => board.get(adjId) === null)
      if (!canMove) blocked++
    }
  })

  return blocked
}

/**
 * Gets valid moves for a specific player (used for evaluation)
 */
function getValidMovesForPlayer(state: GameState, player: Player): ValidMove[] {
  // Create a temporary state with the specified player
  const tempState: GameState = {
    ...state,
    currentPlayer: player,
    mustRemovePiece: false,
  }
  return getAllValidMoves(tempState)
}

/**
 * Minimax with alpha-beta pruning
 */
function minimax(
  state: GameState,
  depth: number,
  alpha: number,
  beta: number,
  maximizingPlayer: boolean,
  player: Player,
  _difficulty: Difficulty
): { score: number; move: ValidMove | null } {
  const gameOver = checkGameOver(state)

  if (depth === 0 || gameOver.isOver) {
    return { score: evaluateBoard(state, player), move: null }
  }

  const validMoves = getAllValidMoves(state)

  if (validMoves.length === 0) {
    return { score: evaluateBoard(state, player), move: null }
  }

  let bestMove: ValidMove | null = null

  if (maximizingPlayer) {
    let maxScore = -Infinity

    for (const move of validMoves) {
      const newState = makeMove(state, move)
      const isStillMaximizing = newState.currentPlayer === player || newState.mustRemovePiece

      const { score } = minimax(
        newState,
        depth - 1,
        alpha,
        beta,
        isStillMaximizing,
        player,
        _difficulty
      )

      if (score > maxScore) {
        maxScore = score
        bestMove = move
      }

      alpha = Math.max(alpha, score)
      if (beta <= alpha) break
    }

    return { score: maxScore, move: bestMove }
  } else {
    let minScore = Infinity

    for (const move of validMoves) {
      const newState = makeMove(state, move)
      const isMaximizing = newState.currentPlayer === player && !newState.mustRemovePiece

      const { score } = minimax(
        newState,
        depth - 1,
        alpha,
        beta,
        isMaximizing,
        player,
        _difficulty
      )

      if (score < minScore) {
        minScore = score
        bestMove = move
      }

      beta = Math.min(beta, score)
      if (beta <= alpha) break
    }

    return { score: minScore, move: bestMove }
  }
}

/**
 * Evaluates a single move for quick heuristics
 */
function evaluateMove(state: GameState, move: ValidMove, player: Player): number {
  let score = 0

  // Check if this move forms a mill
  const testBoard = applyMove(state.board, move, player)
  if (checkMillFormed(testBoard, move.to, player)) {
    score += SCORE.MILL * 2 // High priority for mill-forming moves
  }

  // Check if this move blocks opponent's potential mill
  const opponent: Player = player === 1 ? 2 : 1
  for (const pattern of MILL_PATTERNS) {
    if (pattern.includes(move.to)) {
      let opponentCount = 0
      for (const nodeId of pattern) {
        if (state.board.get(nodeId) === opponent) opponentCount++
      }
      if (opponentCount === 2) {
        score += SCORE.POTENTIAL_MILL // Blocking move
      }
    }
  }

  // Prefer strategic positions
  if (STRATEGIC_POSITIONS.has(move.to)) {
    score += SCORE.CENTER_CONTROL
  }

  return score
}

/**
 * Gets the best move for the AI
 */
export function getAIMove(state: GameState, player: Player, difficulty: Difficulty): ValidMove | null {
  const validMoves = getAllValidMoves(state)

  if (validMoves.length === 0) return null
  if (validMoves.length === 1) return validMoves[0]

  // Random chance for easier difficulties
  if (Math.random() < RANDOM_MOVE_CHANCE[difficulty]) {
    return validMoves[Math.floor(Math.random() * validMoves.length)]
  }

  // For piece removal, use simple heuristics
  if (state.mustRemovePiece) {
    // Prefer removing pieces not in mills, or pieces that block our mills
    const opponent: Player = player === 1 ? 2 : 1
    const removable = getRemovablePieces(state.board, opponent)

    // Score each removable piece
    let bestRemove = removable[0]
    let bestScore = -Infinity

    for (const nodeId of removable) {
      let score = 0

      // Prefer pieces not in mills
      if (!isPieceInMill(state.board, nodeId)) {
        score += 100
      }

      // Prefer pieces in strategic positions
      if (STRATEGIC_POSITIONS.has(nodeId)) {
        score += 50
      }

      // Prefer pieces that block our potential mills
      for (const pattern of MILL_PATTERNS) {
        if (pattern.includes(nodeId)) {
          let playerCount = 0
          for (const id of pattern) {
            if (state.board.get(id) === player) playerCount++
          }
          if (playerCount === 2) {
            score += 200 // This piece blocks our mill
          }
        }
      }

      if (score > bestScore) {
        bestScore = score
        bestRemove = nodeId
      }
    }

    return { from: null, to: bestRemove }
  }

  // For easy mode, use simple heuristics instead of minimax
  if (difficulty === 'easy') {
    // Score moves by simple heuristics
    let bestMove = validMoves[0]
    let bestScore = -Infinity

    for (const move of validMoves) {
      const score = evaluateMove(state, move, player) + (Math.random() * 50) // Add randomness
      if (score > bestScore) {
        bestScore = score
        bestMove = move
      }
    }

    return bestMove
  }

  // Use minimax for medium and hard
  const depth = AI_DEPTH[difficulty]
  const { move } = minimax(state, depth, -Infinity, Infinity, true, player, difficulty)

  return move || validMoves[Math.floor(Math.random() * validMoves.length)]
}
