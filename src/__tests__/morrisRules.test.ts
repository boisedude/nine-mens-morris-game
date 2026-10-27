// Unit tests for Nine Men's Morris game rules engine

import {
  createEmptyBoard,
  createInitialGameState,
  determinePhase,
  getPlayerPhase,
  getPlayerMills,
  checkMillFormed,
  isPieceInMill,
  getRemovablePieces,
  getValidPlacements,
  getValidMovements,
  getValidFlyingMoves,
  getAllValidMoves,
  applyMove,
  removePiece,
  countPiecesOnBoard,
  checkGameOver,
  makeMove,
  countMills,
  isValidMove,
  getAllNodeIds,
} from '@/lib/morrisRules'
import { NODES, MILL_PATTERNS, getAdjacentNodes } from '@/lib/boardLayout'
import type { ValidMove } from '@/types/morris.types'
import { PIECES_PER_PLAYER, MIN_PIECES_TO_LOSE, FLYING_THRESHOLD } from '@/types/morris.types'

describe('morrisRules', () => {
  describe('constants', () => {
    it('should have correct pieces per player', () => {
      expect(PIECES_PER_PLAYER).toBe(9)
    })

    it('should have correct minimum pieces to lose', () => {
      expect(MIN_PIECES_TO_LOSE).toBe(2)
    })

    it('should have correct flying threshold', () => {
      expect(FLYING_THRESHOLD).toBe(3)
    })
  })

  describe('createEmptyBoard', () => {
    it('should create a board with 24 empty nodes', () => {
      const board = createEmptyBoard()
      expect(board.size).toBe(24)
    })

    it('should have all nodes set to null (empty)', () => {
      const board = createEmptyBoard()
      board.forEach((value) => {
        expect(value).toBeNull()
      })
    })

    it('should contain all expected node IDs', () => {
      const board = createEmptyBoard()
      const nodeIds = getAllNodeIds()
      nodeIds.forEach((id) => {
        expect(board.has(id)).toBe(true)
      })
    })
  })

  describe('createInitialGameState', () => {
    it('should create initial state with empty board', () => {
      const state = createInitialGameState()
      state.board.forEach((value) => {
        expect(value).toBeNull()
      })
    })

    it('should start in placement phase', () => {
      const state = createInitialGameState()
      expect(state.phase).toBe('placement')
    })

    it('should start with player 1', () => {
      const state = createInitialGameState()
      expect(state.currentPlayer).toBe(1)
    })

    it('should have 9 pieces in hand for each player', () => {
      const state = createInitialGameState()
      expect(state.player1PiecesInHand).toBe(9)
      expect(state.player2PiecesInHand).toBe(9)
    })

    it('should have 0 pieces on board for each player', () => {
      const state = createInitialGameState()
      expect(state.player1PiecesOnBoard).toBe(0)
      expect(state.player2PiecesOnBoard).toBe(0)
    })

    it('should have playing status', () => {
      const state = createInitialGameState()
      expect(state.status).toBe('playing')
    })

    it('should have no winner', () => {
      const state = createInitialGameState()
      expect(state.winner).toBeNull()
    })

    it('should have all nodes as valid placements initially', () => {
      const state = createInitialGameState()
      expect(state.validMoves.length).toBe(24)
      state.validMoves.forEach((move) => {
        expect(move.from).toBeNull()
      })
    })

    it('should accept game mode parameter', () => {
      const pvpState = createInitialGameState('pvp')
      const pvcState = createInitialGameState('pvc')
      expect(pvpState.mode).toBe('pvp')
      expect(pvcState.mode).toBe('pvc')
    })

    it('should accept difficulty parameter', () => {
      const easyState = createInitialGameState('pvc', 'easy')
      const hardState = createInitialGameState('pvc', 'hard')
      expect(easyState.difficulty).toBe('easy')
      expect(hardState.difficulty).toBe('hard')
    })
  })

  describe('determinePhase', () => {
    it('should return placement when pieces in hand > 0', () => {
      expect(determinePhase(5, 4)).toBe('placement')
    })

    it('should return movement when no pieces in hand and more than 3 on board', () => {
      expect(determinePhase(0, 5)).toBe('movement')
    })

    it('should return flying when no pieces in hand and 3 or fewer on board', () => {
      expect(determinePhase(0, 3)).toBe('flying')
      expect(determinePhase(0, 2)).toBe('flying')
    })
  })

  describe('getPlayerPhase', () => {
    it('should return correct phase for player 1', () => {
      const state = createInitialGameState()
      state.player1PiecesInHand = 3
      state.player1PiecesOnBoard = 6
      expect(getPlayerPhase(state, 1)).toBe('placement')
    })

    it('should return correct phase for player 2', () => {
      const state = createInitialGameState()
      state.player2PiecesInHand = 0
      state.player2PiecesOnBoard = 5
      expect(getPlayerPhase(state, 2)).toBe('movement')
    })

    it('should return flying for player with 3 pieces on board and none in hand', () => {
      const state = createInitialGameState()
      state.player1PiecesInHand = 0
      state.player1PiecesOnBoard = 3
      expect(getPlayerPhase(state, 1)).toBe('flying')
    })
  })

  describe('checkMillFormed', () => {
    it('should detect horizontal mill on outer ring', () => {
      const board = createEmptyBoard()
      board.set('a7', 1)
      board.set('d7', 1)
      board.set('g7', 1)

      const mill = checkMillFormed(board, 'a7', 1)
      expect(mill).not.toBeNull()
      expect(mill).toContain('a7')
      expect(mill).toContain('d7')
      expect(mill).toContain('g7')
    })

    it('should detect vertical mill on outer ring', () => {
      const board = createEmptyBoard()
      board.set('a7', 2)
      board.set('a4', 2)
      board.set('a1', 2)

      const mill = checkMillFormed(board, 'a4', 2)
      expect(mill).not.toBeNull()
    })

    it('should detect mill on middle ring', () => {
      const board = createEmptyBoard()
      board.set('b6', 1)
      board.set('d6', 1)
      board.set('f6', 1)

      const mill = checkMillFormed(board, 'd6', 1)
      expect(mill).not.toBeNull()
    })

    it('should detect mill on inner ring', () => {
      const board = createEmptyBoard()
      board.set('c5', 1)
      board.set('d5', 1)
      board.set('e5', 1)

      const mill = checkMillFormed(board, 'e5', 1)
      expect(mill).not.toBeNull()
    })

    it('should detect cross mill (connecting rings)', () => {
      const board = createEmptyBoard()
      board.set('d7', 1)
      board.set('d6', 1)
      board.set('d5', 1)

      const mill = checkMillFormed(board, 'd6', 1)
      expect(mill).not.toBeNull()
    })

    it('should not detect mill with mixed player pieces', () => {
      const board = createEmptyBoard()
      board.set('a7', 1)
      board.set('d7', 2)
      board.set('g7', 1)

      const mill = checkMillFormed(board, 'a7', 1)
      expect(mill).toBeNull()
    })

    it('should not detect mill with incomplete line', () => {
      const board = createEmptyBoard()
      board.set('a7', 1)
      board.set('d7', 1)
      // g7 is empty

      const mill = checkMillFormed(board, 'a7', 1)
      expect(mill).toBeNull()
    })

    it('should return null for node not in any mill', () => {
      const board = createEmptyBoard()
      board.set('a7', 1)

      const mill = checkMillFormed(board, 'a7', 1)
      expect(mill).toBeNull()
    })
  })

  describe('isPieceInMill', () => {
    it('should return true for piece in a mill', () => {
      const board = createEmptyBoard()
      board.set('a7', 1)
      board.set('d7', 1)
      board.set('g7', 1)

      expect(isPieceInMill(board, 'a7')).toBe(true)
      expect(isPieceInMill(board, 'd7')).toBe(true)
      expect(isPieceInMill(board, 'g7')).toBe(true)
    })

    it('should return false for piece not in a mill', () => {
      const board = createEmptyBoard()
      board.set('a7', 1)
      board.set('d7', 1)
      // g7 empty

      expect(isPieceInMill(board, 'a7')).toBe(false)
    })

    it('should return false for empty node', () => {
      const board = createEmptyBoard()
      expect(isPieceInMill(board, 'a7')).toBe(false)
    })

    it('should detect piece in multiple mills', () => {
      const board = createEmptyBoard()
      // Create two mills intersecting at d7
      board.set('a7', 1)
      board.set('d7', 1)
      board.set('g7', 1)
      board.set('d6', 1)
      board.set('d5', 1)

      expect(isPieceInMill(board, 'd7')).toBe(true)
    })
  })

  describe('getPlayerMills', () => {
    it('should return empty array when no mills exist', () => {
      const board = createEmptyBoard()
      board.set('a7', 1)
      board.set('d7', 1)

      const mills = getPlayerMills(board, 1)
      expect(mills).toHaveLength(0)
    })

    it('should return all mills for a player', () => {
      const board = createEmptyBoard()
      // Create two mills for player 1
      board.set('a7', 1)
      board.set('d7', 1)
      board.set('g7', 1)
      board.set('b6', 1)
      board.set('d6', 1)
      board.set('f6', 1)

      const mills = getPlayerMills(board, 1)
      expect(mills.length).toBe(2)
    })

    it('should not include opponent mills', () => {
      const board = createEmptyBoard()
      board.set('a7', 1)
      board.set('d7', 1)
      board.set('g7', 1)
      board.set('a1', 2)
      board.set('d1', 2)
      board.set('g1', 2)

      const player1Mills = getPlayerMills(board, 1)
      const player2Mills = getPlayerMills(board, 2)

      expect(player1Mills.length).toBe(1)
      expect(player2Mills.length).toBe(1)
    })
  })

  describe('getRemovablePieces', () => {
    it('should return all opponent pieces when none are in mills', () => {
      const board = createEmptyBoard()
      board.set('a7', 2)
      board.set('b6', 2)
      board.set('c5', 2)

      const removable = getRemovablePieces(board, 2)
      expect(removable).toHaveLength(3)
      expect(removable).toContain('a7')
      expect(removable).toContain('b6')
      expect(removable).toContain('c5')
    })

    it('should exclude pieces in mills when others are available', () => {
      const board = createEmptyBoard()
      // Mill
      board.set('a7', 2)
      board.set('d7', 2)
      board.set('g7', 2)
      // Non-mill piece
      board.set('c5', 2)

      const removable = getRemovablePieces(board, 2)
      expect(removable).toHaveLength(1)
      expect(removable).toContain('c5')
      expect(removable).not.toContain('a7')
      expect(removable).not.toContain('d7')
      expect(removable).not.toContain('g7')
    })

    it('should allow removing any piece when all are in mills', () => {
      const board = createEmptyBoard()
      // All pieces in mills
      board.set('a7', 2)
      board.set('d7', 2)
      board.set('g7', 2)
      board.set('a1', 2)
      board.set('d1', 2)
      board.set('g1', 2)

      const removable = getRemovablePieces(board, 2)
      expect(removable).toHaveLength(6)
    })

    it('should not include player 1 pieces when getting removable for player 2', () => {
      const board = createEmptyBoard()
      board.set('a7', 1)
      board.set('b6', 2)

      const removable = getRemovablePieces(board, 2)
      expect(removable).toHaveLength(1)
      expect(removable).toContain('b6')
      expect(removable).not.toContain('a7')
    })
  })

  describe('getValidPlacements', () => {
    it('should return all nodes on empty board', () => {
      const board = createEmptyBoard()
      const placements = getValidPlacements(board)
      expect(placements).toHaveLength(24)
    })

    it('should exclude occupied nodes', () => {
      const board = createEmptyBoard()
      board.set('a7', 1)
      board.set('d7', 2)

      const placements = getValidPlacements(board)
      expect(placements).toHaveLength(22)
      expect(placements.every((m) => m.to !== 'a7' && m.to !== 'd7')).toBe(true)
    })

    it('should have null as from for all placement moves', () => {
      const board = createEmptyBoard()
      const placements = getValidPlacements(board)
      expect(placements.every((m) => m.from === null)).toBe(true)
    })
  })

  describe('getValidMovements', () => {
    it('should return adjacent empty nodes for player pieces', () => {
      const board = createEmptyBoard()
      board.set('a7', 1)

      const movements = getValidMovements(board, 1)

      // a7 is adjacent to d7 and a4
      expect(movements).toHaveLength(2)
      expect(movements.some((m) => m.from === 'a7' && m.to === 'd7')).toBe(true)
      expect(movements.some((m) => m.from === 'a7' && m.to === 'a4')).toBe(true)
    })

    it('should not include non-adjacent nodes', () => {
      const board = createEmptyBoard()
      board.set('a7', 1)

      const movements = getValidMovements(board, 1)

      // g7 is not adjacent to a7
      expect(movements.every((m) => m.to !== 'g7')).toBe(true)
    })

    it('should not move to occupied nodes', () => {
      const board = createEmptyBoard()
      board.set('a7', 1)
      board.set('d7', 2) // Block one adjacent node

      const movements = getValidMovements(board, 1)
      expect(movements).toHaveLength(1)
      expect(movements[0].to).toBe('a4')
    })

    it('should return empty array when all adjacent nodes are occupied', () => {
      const board = createEmptyBoard()
      board.set('a7', 1)
      board.set('d7', 2)
      board.set('a4', 2)

      const movements = getValidMovements(board, 1)
      expect(movements).toHaveLength(0)
    })

    it('should only include movements for the specified player', () => {
      const board = createEmptyBoard()
      board.set('a7', 1)
      board.set('g7', 2)

      const player1Movements = getValidMovements(board, 1)
      const player2Movements = getValidMovements(board, 2)

      expect(player1Movements.every((m) => m.from === 'a7')).toBe(true)
      expect(player2Movements.every((m) => m.from === 'g7')).toBe(true)
    })
  })

  describe('getValidFlyingMoves', () => {
    it('should allow flying to any empty node', () => {
      const board = createEmptyBoard()
      board.set('a7', 1)
      board.set('d7', 2)
      board.set('g7', 2)

      const flyingMoves = getValidFlyingMoves(board, 1)

      // Player 1 has one piece, can fly to 21 empty nodes
      expect(flyingMoves).toHaveLength(21)
      expect(flyingMoves.every((m) => m.from === 'a7')).toBe(true)
    })

    it('should include non-adjacent nodes', () => {
      const board = createEmptyBoard()
      board.set('a7', 1)

      const flyingMoves = getValidFlyingMoves(board, 1)

      // g1 is not adjacent to a7 but should be valid for flying
      expect(flyingMoves.some((m) => m.to === 'g1')).toBe(true)
    })

    it('should handle multiple pieces', () => {
      const board = createEmptyBoard()
      board.set('a7', 1)
      board.set('a4', 1)
      board.set('a1', 1)

      const flyingMoves = getValidFlyingMoves(board, 1)

      // 3 pieces, each can fly to 21 empty nodes
      expect(flyingMoves).toHaveLength(3 * 21)
    })
  })

  describe('getAllValidMoves', () => {
    it('should return placements during placement phase', () => {
      const state = createInitialGameState()

      const moves = getAllValidMoves(state)

      expect(moves).toHaveLength(24)
      expect(moves.every((m) => m.from === null)).toBe(true)
    })

    it('should return movements during movement phase', () => {
      const state = createInitialGameState()
      state.player1PiecesInHand = 0
      state.player1PiecesOnBoard = 5
      state.board.set('a7', 1)

      const moves = getAllValidMoves(state)

      // Should be movement moves (from is not null)
      expect(moves.every((m) => m.from !== null)).toBe(true)
    })

    it('should return flying moves during flying phase', () => {
      const state = createInitialGameState()
      state.player1PiecesInHand = 0
      state.player1PiecesOnBoard = 3
      state.board.set('a7', 1)
      state.board.set('d7', 1)
      state.board.set('g7', 1)

      const moves = getAllValidMoves(state)

      // 3 pieces can fly to 21 empty nodes each
      expect(moves).toHaveLength(3 * 21)
    })

    it('should return removal moves when mustRemovePiece is true', () => {
      const state = createInitialGameState()
      state.mustRemovePiece = true
      state.board.set('a7', 2) // Opponent piece to remove
      state.board.set('d7', 2)

      const moves = getAllValidMoves(state)

      expect(moves).toHaveLength(2)
      expect(moves.every((m) => m.from === null)).toBe(true)
      expect(moves.some((m) => m.to === 'a7')).toBe(true)
      expect(moves.some((m) => m.to === 'd7')).toBe(true)
    })
  })

  describe('applyMove', () => {
    it('should place a piece on empty node (placement)', () => {
      const board = createEmptyBoard()
      const move: ValidMove = { from: null, to: 'a7' }

      const newBoard = applyMove(board, move, 1)

      expect(newBoard.get('a7')).toBe(1)
    })

    it('should move a piece (movement)', () => {
      const board = createEmptyBoard()
      board.set('a7', 1)
      const move: ValidMove = { from: 'a7', to: 'd7' }

      const newBoard = applyMove(board, move, 1)

      expect(newBoard.get('a7')).toBeNull()
      expect(newBoard.get('d7')).toBe(1)
    })

    it('should not mutate the original board', () => {
      const board = createEmptyBoard()
      const move: ValidMove = { from: null, to: 'a7' }

      const newBoard = applyMove(board, move, 1)

      expect(board.get('a7')).toBeNull()
      expect(newBoard.get('a7')).toBe(1)
    })
  })

  describe('removePiece', () => {
    it('should remove a piece from the board', () => {
      const board = createEmptyBoard()
      board.set('a7', 1)

      const newBoard = removePiece(board, 'a7')

      expect(newBoard.get('a7')).toBeNull()
    })

    it('should not mutate the original board', () => {
      const board = createEmptyBoard()
      board.set('a7', 1)

      const newBoard = removePiece(board, 'a7')

      expect(board.get('a7')).toBe(1)
      expect(newBoard.get('a7')).toBeNull()
    })
  })

  describe('countPiecesOnBoard', () => {
    it('should count zero pieces on empty board', () => {
      const board = createEmptyBoard()

      const count = countPiecesOnBoard(board)

      expect(count.player1).toBe(0)
      expect(count.player2).toBe(0)
    })

    it('should correctly count pieces for each player', () => {
      const board = createEmptyBoard()
      board.set('a7', 1)
      board.set('d7', 1)
      board.set('g7', 2)
      board.set('a4', 2)
      board.set('g4', 2)

      const count = countPiecesOnBoard(board)

      expect(count.player1).toBe(2)
      expect(count.player2).toBe(3)
    })
  })

  describe('checkGameOver', () => {
    it('should not be over during placement phase', () => {
      const state = createInitialGameState()
      state.player1PiecesInHand = 1

      const result = checkGameOver(state)

      expect(result.isOver).toBe(false)
    })

    it('should be over when player has fewer than MIN_PIECES_TO_LOSE pieces after placement', () => {
      const state = createInitialGameState()
      state.player1PiecesInHand = 0
      state.player2PiecesInHand = 0
      state.player1PiecesOnBoard = 1 // At or below MIN_PIECES_TO_LOSE (2)

      const result = checkGameOver(state)

      expect(result.isOver).toBe(true)
      expect(result.winner).toBe(2)
    })

    it('should be over when current player has no valid moves', () => {
      const state = createInitialGameState()
      state.player1PiecesInHand = 0
      state.player2PiecesInHand = 0
      state.player1PiecesOnBoard = 4
      state.player2PiecesOnBoard = 9
      state.mustRemovePiece = false

      // Block all of player 1's pieces
      state.board.set('a7', 1)
      state.board.set('d7', 2)
      state.board.set('a4', 2)

      state.board.set('b6', 1)
      state.board.set('d6', 2)
      state.board.set('b4', 2)

      state.board.set('c5', 1)
      state.board.set('d5', 2)
      state.board.set('c4', 2)

      state.board.set('g7', 1)
      state.board.set('g4', 2)

      // Recalculate valid moves
      state.validMoves = getAllValidMoves(state)

      const result = checkGameOver(state)

      expect(result.isOver).toBe(true)
      expect(result.winner).toBe(2)
    })

    it('should not be over when player still has valid moves', () => {
      const state = createInitialGameState()
      state.player1PiecesInHand = 0
      state.player2PiecesInHand = 0
      state.player1PiecesOnBoard = 4
      state.player2PiecesOnBoard = 5
      state.board.set('a7', 1)
      state.validMoves = getAllValidMoves(state)

      const result = checkGameOver(state)

      expect(result.isOver).toBe(false)
    })
  })

  describe('makeMove', () => {
    describe('placement moves', () => {
      it('should place a piece on the board', () => {
        const state = createInitialGameState()
        const move: ValidMove = { from: null, to: 'a7' }

        const newState = makeMove(state, move)

        expect(newState.board.get('a7')).toBe(1)
      })

      it('should decrement pieces in hand', () => {
        const state = createInitialGameState()
        const move: ValidMove = { from: null, to: 'a7' }

        const newState = makeMove(state, move)

        expect(newState.player1PiecesInHand).toBe(8)
      })

      it('should increment pieces on board', () => {
        const state = createInitialGameState()
        const move: ValidMove = { from: null, to: 'a7' }

        const newState = makeMove(state, move)

        expect(newState.player1PiecesOnBoard).toBe(1)
      })

      it('should switch to opponent', () => {
        const state = createInitialGameState()
        const move: ValidMove = { from: null, to: 'a7' }

        const newState = makeMove(state, move)

        expect(newState.currentPlayer).toBe(2)
      })
    })

    describe('movement moves', () => {
      it('should move a piece', () => {
        const state = createInitialGameState()
        state.player1PiecesInHand = 0
        state.player1PiecesOnBoard = 4
        state.player2PiecesInHand = 0
        state.player2PiecesOnBoard = 4
        state.board.set('a7', 1)
        state.board.set('g7', 1)
        state.board.set('a4', 1)
        state.board.set('b6', 1)
        state.validMoves = [{ from: 'a7', to: 'd7' }]

        const move: ValidMove = { from: 'a7', to: 'd7' }
        const newState = makeMove(state, move)

        expect(newState.board.get('a7')).toBeNull()
        expect(newState.board.get('d7')).toBe(1)
      })

      it('should not change piece counts for movement', () => {
        const state = createInitialGameState()
        state.player1PiecesInHand = 0
        state.player1PiecesOnBoard = 4
        state.player2PiecesInHand = 0
        state.player2PiecesOnBoard = 4
        state.board.set('a7', 1)
        state.board.set('g7', 1)
        state.board.set('a4', 1)
        state.board.set('b6', 1)
        state.validMoves = [{ from: 'a7', to: 'd7' }]

        const move: ValidMove = { from: 'a7', to: 'd7' }
        const newState = makeMove(state, move)

        expect(newState.player1PiecesInHand).toBe(0)
        // countPiecesOnBoard recalculates from the board
        expect(newState.player1PiecesOnBoard).toBe(4)
      })
    })

    describe('mill formation', () => {
      it('should set mustRemovePiece when mill is formed', () => {
        const state = createInitialGameState()
        state.board.set('a7', 1)
        state.board.set('d7', 1)
        // g7 is empty, placing there will form a mill
        state.board.set('a4', 2) // Opponent piece to remove

        const move: ValidMove = { from: null, to: 'g7' }
        const newState = makeMove(state, move)

        expect(newState.mustRemovePiece).toBe(true)
      })

      it('should store the formed mill pattern', () => {
        const state = createInitialGameState()
        state.board.set('a7', 1)
        state.board.set('d7', 1)
        state.board.set('a4', 2)

        const move: ValidMove = { from: null, to: 'g7' }
        const newState = makeMove(state, move)

        expect(newState.lastFormedMill).toBeDefined()
        expect(newState.lastFormedMill).toContain('a7')
        expect(newState.lastFormedMill).toContain('d7')
        expect(newState.lastFormedMill).toContain('g7')
      })

      it('should provide valid removal moves', () => {
        const state = createInitialGameState()
        state.board.set('a7', 1)
        state.board.set('d7', 1)
        state.board.set('a4', 2)
        state.board.set('g4', 2)

        const move: ValidMove = { from: null, to: 'g7' }
        const newState = makeMove(state, move)

        expect(newState.validMoves).toHaveLength(2)
        expect(newState.validMoves.some((m) => m.to === 'a4')).toBe(true)
        expect(newState.validMoves.some((m) => m.to === 'g4')).toBe(true)
      })

      it('should not switch player when mill is formed', () => {
        const state = createInitialGameState()
        state.board.set('a7', 1)
        state.board.set('d7', 1)
        state.board.set('a4', 2)

        const move: ValidMove = { from: null, to: 'g7' }
        const newState = makeMove(state, move)

        // Player 1 should still be current (to remove a piece)
        expect(newState.currentPlayer).toBe(1)
      })
    })

    describe('piece removal', () => {
      it('should remove opponent piece', () => {
        const state = createInitialGameState()
        state.mustRemovePiece = true
        state.board.set('a4', 2)
        state.validMoves = [{ from: null, to: 'a4' }]

        const move: ValidMove = { from: null, to: 'a4' }
        const newState = makeMove(state, move)

        expect(newState.board.get('a4')).toBeNull()
      })

      it('should decrement opponent pieces on board after removal', () => {
        const state = createInitialGameState()
        state.mustRemovePiece = true
        state.player1PiecesInHand = 0
        state.player2PiecesInHand = 0
        state.player2PiecesOnBoard = 5
        // Add 5 player 2 pieces to board
        state.board.set('a4', 2)
        state.board.set('d4', 2)
        state.board.set('g4', 2)
        state.board.set('b6', 2)
        state.board.set('d6', 2)
        state.validMoves = [{ from: null, to: 'a4' }]

        const move: ValidMove = { from: null, to: 'a4' }
        const newState = makeMove(state, move)

        // countPiecesOnBoard recalculates from the board
        expect(newState.player2PiecesOnBoard).toBe(4)
      })

      it('should switch to opponent after removal', () => {
        const state = createInitialGameState()
        state.mustRemovePiece = true
        state.currentPlayer = 1
        state.board.set('a4', 2)
        state.validMoves = [{ from: null, to: 'a4' }]

        const move: ValidMove = { from: null, to: 'a4' }
        const newState = makeMove(state, move)

        expect(newState.currentPlayer).toBe(2)
      })

      it('should clear mustRemovePiece after removal', () => {
        const state = createInitialGameState()
        state.mustRemovePiece = true
        state.board.set('a4', 2)
        state.validMoves = [{ from: null, to: 'a4' }]

        const move: ValidMove = { from: null, to: 'a4' }
        const newState = makeMove(state, move)

        expect(newState.mustRemovePiece).toBe(false)
      })
    })

    describe('phase transitions', () => {
      it('should transition from placement to movement when all pieces placed', () => {
        const state = createInitialGameState()
        state.player1PiecesInHand = 1
        state.player2PiecesInHand = 0
        state.player1PiecesOnBoard = 8
        state.player2PiecesOnBoard = 9

        // Add player 1 pieces (8 on board, placing 1 more)
        state.board.set('d7', 1)
        state.board.set('g7', 1)
        state.board.set('a4', 1)
        state.board.set('g4', 1)
        state.board.set('a1', 1)
        state.board.set('d1', 1)
        state.board.set('g1', 1)
        state.board.set('b6', 1)

        // Add player 2 pieces (9 on board - already placed all)
        state.board.set('d6', 2)
        state.board.set('f6', 2)
        state.board.set('b4', 2)
        state.board.set('f4', 2)
        state.board.set('b2', 2)
        state.board.set('d2', 2)
        state.board.set('f2', 2)
        state.board.set('c5', 2)
        state.board.set('d5', 2)

        // Update validMoves to include placement for player 1
        state.validMoves = getValidPlacements(state.board)

        // Place player 1's last piece at a7 (avoiding mill with d7-g7)
        const move: ValidMove = { from: null, to: 'c4' }
        const newState = makeMove(state, move)

        // After placement:
        // - Player 1 now has 9 pieces on board, 0 in hand
        // - Player 2 already had 0 in hand
        // - Player 2 becomes current player with 9 pieces on board, 0 in hand
        // - Player 2's phase should be 'movement'
        expect(newState.player1PiecesInHand).toBe(0)
        expect(newState.player2PiecesInHand).toBe(0)
        expect(newState.currentPlayer).toBe(2)
        expect(newState.phase).toBe('movement')
      })

      it('should transition to flying when player has 3 pieces', () => {
        const state = createInitialGameState()
        state.mustRemovePiece = true
        state.currentPlayer = 2
        state.player1PiecesInHand = 0
        state.player2PiecesInHand = 0
        state.player1PiecesOnBoard = 4
        state.player2PiecesOnBoard = 5
        state.board.set('a7', 1)
        state.board.set('d7', 1)
        state.board.set('g7', 1)
        state.board.set('a1', 1)
        state.board.set('b6', 2)
        state.validMoves = [{ from: null, to: 'a1' }]

        // Player 2 removes a player 1 piece
        const move: ValidMove = { from: null, to: 'a1' }
        const newState = makeMove(state, move)

        // Player 1 now has 3 pieces and should be in flying phase
        expect(newState.player1PiecesOnBoard).toBe(3)
        expect(getPlayerPhase(newState, 1)).toBe('flying')
      })
    })

    describe('game over detection', () => {
      it('should detect game over when opponent has fewer than MIN_PIECES_TO_LOSE pieces', () => {
        // A player reduced to MIN_PIECES_TO_LOSE (2) pieces loses

        const state = createInitialGameState()
        state.mustRemovePiece = true
        state.currentPlayer = 1
        state.player1PiecesInHand = 0
        state.player2PiecesInHand = 0
        state.player1PiecesOnBoard = 5
        state.player2PiecesOnBoard = 2 // Player 2 has exactly 2 pieces

        // Add player 1 pieces to match count
        state.board.set('a4', 1)
        state.board.set('b4', 1)
        state.board.set('c4', 1)
        state.board.set('d5', 1)
        state.board.set('e5', 1)

        // Add player 2 pieces (only 2, will go to 1 after removal)
        state.board.set('a7', 2)
        state.board.set('d7', 2)

        state.validMoves = [{ from: null, to: 'a7' }]

        const move: ValidMove = { from: null, to: 'a7' }
        const newState = makeMove(state, move)

        // After removal: player 2 has 1 piece
        expect(newState.player2PiecesOnBoard).toBe(1)
        expect(newState.status).toBe('won')
        expect(newState.winner).toBe(1)
      })

      it('ends the game when a capture leaves the opponent with exactly 2 pieces', () => {
        const state = createInitialGameState()
        state.mustRemovePiece = true
        state.currentPlayer = 1
        state.player1PiecesInHand = 0
        state.player2PiecesInHand = 0
        state.player1PiecesOnBoard = 5
        state.player2PiecesOnBoard = 3
        ;['a4', 'b4', 'c4', 'd5', 'e5'].forEach(n => state.board.set(n, 1))
        ;['a7', 'd7', 'g7'].forEach(n => state.board.set(n, 2))
        state.validMoves = [{ from: null, to: 'a7' }]

        const newState = makeMove(state, { from: null, to: 'a7' })

        expect(newState.player2PiecesOnBoard).toBe(2)
        expect(newState.status).toBe('won')
        expect(newState.winner).toBe(1)
      })

      it('keeps the game going at 3 pieces (flying phase)', () => {
        const state = createInitialGameState()
        state.mustRemovePiece = true
        state.currentPlayer = 1
        state.player1PiecesInHand = 0
        state.player2PiecesInHand = 0
        state.player1PiecesOnBoard = 5
        state.player2PiecesOnBoard = 4
        ;['a4', 'b4', 'c4', 'd5', 'e5'].forEach(n => state.board.set(n, 1))
        ;['a7', 'd7', 'g7', 'g1'].forEach(n => state.board.set(n, 2))
        state.validMoves = [{ from: null, to: 'a7' }]

        const newState = makeMove(state, { from: null, to: 'a7' })

        expect(newState.status).toBe('playing')
        expect(newState.phase).toBe('flying')
      })
    })

    describe('threefold repetition', () => {
      function shuffleState() {
        const state = createInitialGameState()
        state.player1PiecesInHand = 0
        state.player2PiecesInHand = 0
        state.player1PiecesOnBoard = 4
        state.player2PiecesOnBoard = 4
        ;['a1', 'g1', 'a7', 'g7'].forEach(n => state.board.set(n, 1))
        ;['b2', 'b6', 'f2', 'f6'].forEach(n => state.board.set(n, 2))
        state.phase = 'movement'
        state.validMoves = getAllValidMoves(state)
        return state
      }

      it('declares a draw when a position occurs three times', () => {
        let state = shuffleState()
        const cycle: ValidMove[] = [
          { from: 'a1', to: 'd1' },
          { from: 'b2', to: 'd2' },
          { from: 'd1', to: 'a1' },
          { from: 'd2', to: 'b2' },
        ]
        let plies = 0
        while (state.status === 'playing' && plies < 40) {
          state = makeMove(state, cycle[plies % 4])
          plies++
        }
        expect(state.status).toBe('draw')
        expect(state.winner).toBeNull()
        expect(plies).toBe(9) // the position after ply 1 recurs at plies 5 and 9
      })

      it('does not call a draw after only two occurrences', () => {
        let state = shuffleState()
        const cycle: ValidMove[] = [
          { from: 'a1', to: 'd1' },
          { from: 'b2', to: 'd2' },
          { from: 'd1', to: 'a1' },
          { from: 'd2', to: 'b2' },
        ]
        for (let i = 0; i < 8; i++) state = makeMove(state, cycle[i % 4])
        expect(state.status).toBe('playing')
      })
    })

    describe('move history', () => {
      it('should add move to history', () => {
        const state = createInitialGameState()
        const move: ValidMove = { from: null, to: 'a7' }

        const newState = makeMove(state, move)

        expect(newState.moveHistory).toHaveLength(1)
        expect(newState.moveHistory[0].to).toBe('a7')
        expect(newState.moveHistory[0].player).toBe(1)
      })

      it('should record if mill was formed', () => {
        const state = createInitialGameState()
        state.board.set('a7', 1)
        state.board.set('d7', 1)
        state.board.set('a4', 2)

        const move: ValidMove = { from: null, to: 'g7' }
        const newState = makeMove(state, move)

        expect(newState.moveHistory[0].formedMill).toBe(true)
      })

      it('should record removed piece in move history', () => {
        const state = createInitialGameState()
        state.mustRemovePiece = true
        state.board.set('a4', 2)
        state.moveHistory = [{ from: null, to: 'g7', player: 1, formedMill: true }]
        state.validMoves = [{ from: null, to: 'a4' }]

        const move: ValidMove = { from: null, to: 'a4' }
        const newState = makeMove(state, move)

        expect(newState.moveHistory[0].removedPiece).toBe('a4')
      })
    })
  })

  describe('countMills', () => {
    it('should return 0 for no mills', () => {
      const board = createEmptyBoard()
      board.set('a7', 1)
      board.set('d7', 1)

      expect(countMills(board, 1)).toBe(0)
    })

    it('should count single mill', () => {
      const board = createEmptyBoard()
      board.set('a7', 1)
      board.set('d7', 1)
      board.set('g7', 1)

      expect(countMills(board, 1)).toBe(1)
    })

    it('should count multiple mills', () => {
      const board = createEmptyBoard()
      // First mill
      board.set('a7', 1)
      board.set('d7', 1)
      board.set('g7', 1)
      // Second mill
      board.set('a4', 1)
      board.set('a1', 1)

      expect(countMills(board, 1)).toBe(2)
    })
  })

  describe('isValidMove', () => {
    it('should return true for valid move in validMoves', () => {
      const state = createInitialGameState()
      const move: ValidMove = { from: null, to: 'a7' }

      expect(isValidMove(state, move)).toBe(true)
    })

    it('should return false for move not in validMoves', () => {
      const state = createInitialGameState()
      state.validMoves = [{ from: null, to: 'a7' }]
      const move: ValidMove = { from: null, to: 'd7' }

      expect(isValidMove(state, move)).toBe(false)
    })
  })

  describe('integration: full game sequence', () => {
    it('should maintain board integrity through placement phase', () => {
      let state = createInitialGameState()

      // Place all 18 pieces (9 per player)
      const placements = [
        'a7', 'g7', 'd7', 'a4', 'g4', 'a1', 'd1', 'g1', 'b6',
        'd6', 'f6', 'b4', 'f4', 'b2', 'd2', 'f2', 'c5', 'd5'
      ]

      placements.forEach((nodeId, index) => {
        const move: ValidMove = { from: null, to: nodeId }
        state = makeMove(state, move)

        // If mill was formed, skip removal for this test
        if (state.mustRemovePiece && index < placements.length - 1) {
          // Pick first available removal
          const removalMove = state.validMoves[0]
          state = makeMove(state, removalMove)
        }
      })

      // Verify piece counts
      const totalPiecesOnBoard = state.player1PiecesOnBoard + state.player2PiecesOnBoard
      const totalPiecesInHand = state.player1PiecesInHand + state.player2PiecesInHand
      const removedPieces = state.moveHistory.filter(m => m.removedPiece).length

      expect(totalPiecesOnBoard + removedPieces + totalPiecesInHand).toBe(18)
    })

    it('should handle complete mill-removal sequence', () => {
      let state = createInitialGameState()

      // Player 1 places pieces to form a mill
      state = makeMove(state, { from: null, to: 'a7' }) // P1
      state = makeMove(state, { from: null, to: 'c5' }) // P2
      state = makeMove(state, { from: null, to: 'd7' }) // P1
      state = makeMove(state, { from: null, to: 'd5' }) // P2
      state = makeMove(state, { from: null, to: 'g7' }) // P1 - forms mill!

      expect(state.mustRemovePiece).toBe(true)
      expect(state.currentPlayer).toBe(1)

      // Player 1 removes opponent piece
      const removalMove = state.validMoves[0]
      state = makeMove(state, removalMove)

      expect(state.mustRemovePiece).toBe(false)
      expect(state.currentPlayer).toBe(2)
    })
  })

  describe('edge cases', () => {
    it('should handle all 16 possible mills', () => {
      MILL_PATTERNS.forEach((pattern) => {
        const board = createEmptyBoard()
        pattern.forEach((nodeId) => board.set(nodeId, 1))

        const mill = checkMillFormed(board, pattern[0], 1)
        expect(mill).not.toBeNull()
        expect(mill).toEqual(pattern)
      })
    })

    it('should correctly identify adjacent nodes', () => {
      // Test a few known adjacencies
      const a7Adjacent = getAdjacentNodes('a7')
      expect(a7Adjacent).toContain('d7')
      expect(a7Adjacent).toContain('a4')
      expect(a7Adjacent).not.toContain('g7')

      const d6Adjacent = getAdjacentNodes('d6')
      expect(d6Adjacent).toContain('b6')
      expect(d6Adjacent).toContain('f6')
      expect(d6Adjacent).toContain('d7')
      expect(d6Adjacent).toContain('d5')
    })

    it('should have 24 total nodes', () => {
      expect(NODES).toHaveLength(24)
      expect(getAllNodeIds()).toHaveLength(24)
    })

    it('should have 16 mill patterns', () => {
      expect(MILL_PATTERNS).toHaveLength(16)
    })
  })
})
