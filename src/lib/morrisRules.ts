/**
 * Nine Men's Morris Game Rules and Logic
 * Implements standard Nine Men's Morris rules
 */

import type {
  Board,
  Player,
  NodeId,
  ValidMove,
  Move,
  GameState,
  GamePhase,
  MillPattern,
  Difficulty,
} from '@/types/morris.types'
import { PIECES_PER_PLAYER, MIN_PIECES_TO_LOSE, FLYING_THRESHOLD } from '@/types/morris.types'
import { NODES, MILL_PATTERNS, getAdjacentNodes, getAllNodeIds } from './boardLayout'

/**
 * Creates an empty board
 */
export function createEmptyBoard(): Board {
  const board = new Map<NodeId, Player | null>()
  NODES.forEach(node => {
    board.set(node.id, null)
  })
  return board
}

/**
 * Determines the current game phase based on pieces in hand and on board
 */
export function determinePhase(
  piecesInHand: number,
  piecesOnBoard: number
): GamePhase {
  if (piecesInHand > 0) {
    return 'placement'
  }
  if (piecesOnBoard <= FLYING_THRESHOLD) {
    return 'flying'
  }
  return 'movement'
}

/**
 * Gets the current phase for a specific player
 */
export function getPlayerPhase(state: GameState, player: Player): GamePhase {
  const piecesInHand = player === 1 ? state.player1PiecesInHand : state.player2PiecesInHand
  const piecesOnBoard = player === 1 ? state.player1PiecesOnBoard : state.player2PiecesOnBoard
  return determinePhase(piecesInHand, piecesOnBoard)
}

/**
 * Gets all mills that a player has formed
 */
export function getPlayerMills(board: Board, player: Player): MillPattern[] {
  return MILL_PATTERNS.filter(pattern =>
    pattern.every(nodeId => board.get(nodeId) === player)
  )
}

/**
 * Checks if placing/moving a piece to a node forms a new mill
 */
export function checkMillFormed(
  board: Board,
  nodeId: NodeId,
  player: Player
): MillPattern | null {
  // Find any mill pattern containing this node where all pieces are the player's
  for (const pattern of MILL_PATTERNS) {
    if (pattern.includes(nodeId)) {
      if (pattern.every(id => board.get(id) === player)) {
        return pattern
      }
    }
  }
  return null
}

/**
 * Checks if a piece is part of a mill
 */
export function isPieceInMill(board: Board, nodeId: NodeId): boolean {
  const player = board.get(nodeId)
  if (!player) return false

  return MILL_PATTERNS.some(pattern =>
    pattern.includes(nodeId) && pattern.every(id => board.get(id) === player)
  )
}

/**
 * Gets all removable pieces for the opponent
 * (pieces not in a mill, unless all pieces are in mills)
 */
export function getRemovablePieces(board: Board, opponent: Player): NodeId[] {
  const opponentPieces: NodeId[] = []
  const piecesNotInMill: NodeId[] = []

  board.forEach((player, nodeId) => {
    if (player === opponent) {
      opponentPieces.push(nodeId)
      if (!isPieceInMill(board, nodeId)) {
        piecesNotInMill.push(nodeId)
      }
    }
  })

  // If there are pieces not in mills, only those can be removed
  // Otherwise, any piece can be removed
  return piecesNotInMill.length > 0 ? piecesNotInMill : opponentPieces
}

/**
 * Gets all valid placement moves (empty nodes)
 */
export function getValidPlacements(board: Board): ValidMove[] {
  const moves: ValidMove[] = []

  board.forEach((player, nodeId) => {
    if (player === null) {
      moves.push({ from: null, to: nodeId })
    }
  })

  return moves
}

/**
 * Gets all valid movement moves for a player
 */
export function getValidMovements(board: Board, player: Player): ValidMove[] {
  const moves: ValidMove[] = []

  board.forEach((piecePlayer, nodeId) => {
    if (piecePlayer === player) {
      const adjacent = getAdjacentNodes(nodeId)
      adjacent.forEach(adjNodeId => {
        if (board.get(adjNodeId) === null) {
          moves.push({ from: nodeId, to: adjNodeId })
        }
      })
    }
  })

  return moves
}

/**
 * Gets all valid flying moves for a player (can move to any empty node)
 */
export function getValidFlyingMoves(board: Board, player: Player): ValidMove[] {
  const moves: ValidMove[] = []
  const playerPieces: NodeId[] = []
  const emptyNodes: NodeId[] = []

  board.forEach((piecePlayer, nodeId) => {
    if (piecePlayer === player) {
      playerPieces.push(nodeId)
    } else if (piecePlayer === null) {
      emptyNodes.push(nodeId)
    }
  })

  playerPieces.forEach(from => {
    emptyNodes.forEach(to => {
      moves.push({ from, to })
    })
  })

  return moves
}

/**
 * Gets all valid moves for the current player based on game state
 */
export function getAllValidMoves(state: GameState): ValidMove[] {
  if (state.mustRemovePiece) {
    // Player must remove an opponent's piece
    const opponent: Player = state.currentPlayer === 1 ? 2 : 1
    const removable = getRemovablePieces(state.board, opponent)
    return removable.map(nodeId => ({ from: null, to: nodeId }))
  }

  const phase = getPlayerPhase(state, state.currentPlayer)

  switch (phase) {
    case 'placement':
      return getValidPlacements(state.board)
    case 'movement':
      return getValidMovements(state.board, state.currentPlayer)
    case 'flying':
      return getValidFlyingMoves(state.board, state.currentPlayer)
    default:
      return []
  }
}

/**
 * Applies a move to the board and returns the new board
 */
export function applyMove(board: Board, move: ValidMove, player: Player): Board {
  const newBoard = new Map(board)

  if (move.from !== null) {
    // Movement or flying - remove piece from original position
    newBoard.set(move.from, null)
  }

  newBoard.set(move.to, player)

  return newBoard
}

/**
 * Removes a piece from the board
 */
export function removePiece(board: Board, nodeId: NodeId): Board {
  const newBoard = new Map(board)
  newBoard.set(nodeId, null)
  return newBoard
}

/**
 * Counts pieces on the board for each player
 */
export function countPiecesOnBoard(board: Board): { player1: number; player2: number } {
  let player1 = 0
  let player2 = 0

  board.forEach(player => {
    if (player === 1) player1++
    else if (player === 2) player2++
  })

  return { player1, player2 }
}

/**
 * Checks if the game is over
 */
export function checkGameOver(state: GameState): {
  isOver: boolean
  winner: Player | null
} {
  // Game can only be over after placement phase for both players
  if (state.player1PiecesInHand > 0 || state.player2PiecesInHand > 0) {
    return { isOver: false, winner: null }
  }

  // Check if current player has less than minimum pieces
  const currentPieces = state.currentPlayer === 1
    ? state.player1PiecesOnBoard
    : state.player2PiecesOnBoard

  if (currentPieces < MIN_PIECES_TO_LOSE) {
    return { isOver: true, winner: state.currentPlayer === 1 ? 2 : 1 }
  }

  // Check if current player has no valid moves
  const validMoves = getAllValidMoves(state)
  if (validMoves.length === 0 && !state.mustRemovePiece) {
    return { isOver: true, winner: state.currentPlayer === 1 ? 2 : 1 }
  }

  return { isOver: false, winner: null }
}

/**
 * Creates initial game state
 */
export function createInitialGameState(
  mode: 'pvp' | 'pvc' = 'pvc',
  difficulty: Difficulty = 'medium'
): GameState {
  const board = createEmptyBoard()
  const validMoves = getValidPlacements(board)

  return {
    board,
    currentPlayer: 1,
    phase: 'placement',
    status: 'playing',
    winner: null,
    mode,
    difficulty,
    moveHistory: [],
    player1PiecesInHand: PIECES_PER_PLAYER,
    player2PiecesInHand: PIECES_PER_PLAYER,
    player1PiecesOnBoard: 0,
    player2PiecesOnBoard: 0,
    validMoves,
    mustRemovePiece: false,
  }
}

/**
 * Makes a move and returns the updated game state
 */
export function makeMove(
  state: GameState,
  move: ValidMove
): GameState {
  const currentPlayer = state.currentPlayer
  const opponent: Player = currentPlayer === 1 ? 2 : 1

  // Handle piece removal after forming a mill
  if (state.mustRemovePiece) {
    const newBoard = removePiece(state.board, move.to)
    const pieces = countPiecesOnBoard(newBoard)

    // Update the last move with the removed piece
    const updatedHistory = [...state.moveHistory]
    if (updatedHistory.length > 0) {
      updatedHistory[updatedHistory.length - 1] = {
        ...updatedHistory[updatedHistory.length - 1],
        removedPiece: move.to,
      }
    }

    const newState: GameState = {
      ...state,
      board: newBoard,
      currentPlayer: opponent,
      player1PiecesOnBoard: pieces.player1,
      player2PiecesOnBoard: pieces.player2,
      mustRemovePiece: false,
      lastFormedMill: undefined,
      moveHistory: updatedHistory,
    }

    // Check for game over
    const gameOver = checkGameOver(newState)
    if (gameOver.isOver) {
      return {
        ...newState,
        status: 'won',
        winner: gameOver.winner,
        validMoves: [],
      }
    }

    // Calculate valid moves for next player
    const validMoves = getAllValidMoves({
      ...newState,
      currentPlayer: opponent,
    })

    // Determine phase for next player
    const phase = getPlayerPhase(newState, opponent)

    return {
      ...newState,
      phase,
      validMoves,
    }
  }

  // Regular move (placement or movement)
  const newBoard = applyMove(state.board, move, currentPlayer)
  const pieces = countPiecesOnBoard(newBoard)

  // Update piece counts
  let player1PiecesInHand = state.player1PiecesInHand
  let player2PiecesInHand = state.player2PiecesInHand

  // If this was a placement, decrement pieces in hand
  if (move.from === null) {
    if (currentPlayer === 1) {
      player1PiecesInHand--
    } else {
      player2PiecesInHand--
    }
  }

  // Check if a mill was formed
  const formedMill = checkMillFormed(newBoard, move.to, currentPlayer)

  const newMove: Move = {
    from: move.from,
    to: move.to,
    player: currentPlayer,
    formedMill: formedMill !== null,
  }

  let newState: GameState = {
    ...state,
    board: newBoard,
    player1PiecesInHand,
    player2PiecesInHand,
    player1PiecesOnBoard: pieces.player1,
    player2PiecesOnBoard: pieces.player2,
    moveHistory: [...state.moveHistory, newMove],
    lastMove: newMove,
    selectedNode: undefined,
  }

  // If a mill was formed, player must remove an opponent's piece
  if (formedMill !== null) {
    const removable = getRemovablePieces(newBoard, opponent)

    // If opponent has removable pieces, player must remove one
    if (removable.length > 0) {
      const validMoves = removable.map(nodeId => ({ from: null, to: nodeId }))
      return {
        ...newState,
        mustRemovePiece: true,
        lastFormedMill: formedMill,
        validMoves,
      }
    }
  }

  // No mill formed or no pieces to remove - switch to opponent
  newState = {
    ...newState,
    currentPlayer: opponent,
    mustRemovePiece: false,
    lastFormedMill: undefined,
  }

  // Check for game over
  const gameOver = checkGameOver(newState)
  if (gameOver.isOver) {
    return {
      ...newState,
      status: 'won',
      winner: gameOver.winner,
      validMoves: [],
    }
  }

  // Calculate valid moves for opponent
  const validMoves = getAllValidMoves({
    ...newState,
    currentPlayer: opponent,
  })

  // Determine phase for opponent
  const phase = getPlayerPhase(newState, opponent)

  // Check if opponent has no moves (they lose)
  if (validMoves.length === 0) {
    return {
      ...newState,
      phase,
      status: 'won',
      winner: currentPlayer,
      validMoves: [],
    }
  }

  return {
    ...newState,
    phase,
    validMoves,
  }
}

/**
 * Gets the count of mills formed by a player
 */
export function countMills(board: Board, player: Player): number {
  return getPlayerMills(board, player).length
}

/**
 * Checks if a move is valid
 */
export function isValidMove(state: GameState, move: ValidMove): boolean {
  return state.validMoves.some(
    vm => vm.from === move.from && vm.to === move.to
  )
}

/**
 * Gets all node IDs
 */
export { getAllNodeIds }
