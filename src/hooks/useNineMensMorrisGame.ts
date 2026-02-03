/**
 * Nine Men's Morris Game Hook
 * Main game state management
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import type { GameState, Difficulty, NodeId, ValidMove, GameStateSnapshot } from '@/types/morris.types'
import {
  createInitialGameState,
  makeMove,
  isValidMove,
} from '@/lib/morrisRules'
import { getAIMove } from '@/lib/aiStrategies'
import { TIMING } from '@/lib/constants'

/**
 * Creates a snapshot of the current game state for undo functionality
 */
function createSnapshot(state: GameState): GameStateSnapshot {
  return {
    board: new Map(state.board),
    currentPlayer: state.currentPlayer,
    phase: state.phase,
    status: state.status,
    winner: state.winner,
    moveHistory: [...state.moveHistory],
    lastMove: state.lastMove,
    player1PiecesInHand: state.player1PiecesInHand,
    player2PiecesInHand: state.player2PiecesInHand,
    player1PiecesOnBoard: state.player1PiecesOnBoard,
    player2PiecesOnBoard: state.player2PiecesOnBoard,
    validMoves: [...state.validMoves],
    mustRemovePiece: state.mustRemovePiece,
    lastFormedMill: state.lastFormedMill,
  }
}

export function useNineMensMorrisGame(initialDifficulty: Difficulty = 'medium') {
  const [gameState, setGameState] = useState<GameState>(() =>
    createInitialGameState('pvc', initialDifficulty)
  )
  const [selectedNode, setSelectedNode] = useState<NodeId | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [highlightedNodes, setHighlightedNodes] = useState<NodeId[]>([])
  const [isAIThinking, setIsAIThinking] = useState(false)

  const aiMoveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const animationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const aiMoveScheduledRef = useRef(false)
  const gameStateRef = useRef(gameState)
  // Track if we should save undo state (for multi-step player moves like mill+remove)
  const pendingUndoSnapshotRef = useRef<GameStateSnapshot | null>(null)

  // Keep gameStateRef in sync with gameState
  useEffect(() => {
    gameStateRef.current = gameState
  }, [gameState])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (aiMoveTimeoutRef.current) {
        clearTimeout(aiMoveTimeoutRef.current)
      }
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current)
      }
    }
  }, [])

  // Handle AI move when it's AI's turn (Player 2)
  useEffect(() => {
    if (
      gameState.currentPlayer === 2 &&
      gameState.status === 'playing' &&
      gameState.mode === 'pvc' &&
      !isAnimating &&
      !aiMoveScheduledRef.current
    ) {
      aiMoveScheduledRef.current = true
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsAIThinking(true)

      aiMoveTimeoutRef.current = setTimeout(() => {
        try {
          // Use ref to get current game state to avoid stale closure
          const currentGameState = gameStateRef.current
          const aiMove = getAIMove(currentGameState, 2, currentGameState.difficulty)

          if (aiMove) {
            setIsAnimating(true)

            animationTimeoutRef.current = setTimeout(() => {
              setGameState(prevState => {
                try {
                  return makeMove(prevState, aiMove)
                } catch {
                  return prevState
                }
              })
              setIsAnimating(false)
              setIsAIThinking(false)
              animationTimeoutRef.current = null
              aiMoveScheduledRef.current = false
            }, TIMING.MOVE_ANIMATION_DELAY)
          } else {
            setIsAIThinking(false)
            aiMoveScheduledRef.current = false
          }
        } catch {
          setIsAnimating(false)
          setIsAIThinking(false)
          aiMoveScheduledRef.current = false
        }
      }, TIMING.AI_MOVE_DELAY)
    }

    return () => {
      if (aiMoveTimeoutRef.current) {
        clearTimeout(aiMoveTimeoutRef.current)
        aiMoveTimeoutRef.current = null
        setIsAIThinking(false)
      }
    }
  }, [
    gameState.currentPlayer,
    gameState.status,
    gameState.mode,
    gameState.board,
    gameState.difficulty,
    gameState.mustRemovePiece,
    isAnimating,
  ])

  /**
   * Handles clicking on a node
   */
  const handleNodeClick = useCallback(
    (nodeId: NodeId) => {
      if (isAnimating || gameState.status !== 'playing' || gameState.currentPlayer !== 1) {
        return
      }

      const piece = gameState.board.get(nodeId)

      // If we must remove an opponent's piece (part of a mill action)
      if (gameState.mustRemovePiece) {
        const move: ValidMove = { from: null, to: nodeId }
        if (isValidMove(gameState, move)) {
          setIsAnimating(true)
          setSelectedNode(null)
          setHighlightedNodes([])

          animationTimeoutRef.current = setTimeout(() => {
            setGameState(prevState => {
              try {
                // Use the pending snapshot that was saved before the placement/movement
                const snapshot = pendingUndoSnapshotRef.current
                pendingUndoSnapshotRef.current = null
                const newState = makeMove(prevState, move)
                // Add snapshot to undo history if we have one
                if (snapshot) {
                  return {
                    ...newState,
                    undoHistory: [...prevState.undoHistory, snapshot],
                  }
                }
                return newState
              } catch {
                pendingUndoSnapshotRef.current = null
                return prevState
              }
            })
            setIsAnimating(false)
            animationTimeoutRef.current = null
          }, TIMING.MOVE_ANIMATION_DELAY)
        }
        return
      }

      // Placement phase - click on empty node to place
      if (gameState.phase === 'placement') {
        if (piece === null) {
          const move: ValidMove = { from: null, to: nodeId }
          if (isValidMove(gameState, move)) {
            setIsAnimating(true)
            setSelectedNode(null)
            setHighlightedNodes([])

            // Save snapshot before the move
            const snapshot = createSnapshot(gameState)

            animationTimeoutRef.current = setTimeout(() => {
              setGameState(prevState => {
                try {
                  const newState = makeMove(prevState, move)
                  // If this move requires piece removal (mill formed), save snapshot for later
                  if (newState.mustRemovePiece) {
                    pendingUndoSnapshotRef.current = snapshot
                    return newState
                  }
                  // Otherwise, add to undo history now
                  return {
                    ...newState,
                    undoHistory: [...prevState.undoHistory, snapshot],
                  }
                } catch {
                  return prevState
                }
              })
              setIsAnimating(false)
              animationTimeoutRef.current = null
            }, TIMING.MOVE_ANIMATION_DELAY)
          }
        }
        return
      }

      // Movement/Flying phase
      // If clicking on own piece, select it
      if (piece === 1) {
        // Find valid moves from this piece
        const movesFromNode = gameState.validMoves.filter(m => m.from === nodeId)

        if (movesFromNode.length > 0) {
          setSelectedNode(nodeId)
          setHighlightedNodes(movesFromNode.map(m => m.to))
        }
        return
      }

      // If a piece is selected and clicking on a valid destination
      if (selectedNode !== null && piece === null) {
        const move: ValidMove = { from: selectedNode, to: nodeId }

        if (isValidMove(gameState, move)) {
          setIsAnimating(true)
          setSelectedNode(null)
          setHighlightedNodes([])

          // Save snapshot before the move
          const snapshot = createSnapshot(gameState)

          animationTimeoutRef.current = setTimeout(() => {
            setGameState(prevState => {
              try {
                const newState = makeMove(prevState, move)
                // If this move requires piece removal (mill formed), save snapshot for later
                if (newState.mustRemovePiece) {
                  pendingUndoSnapshotRef.current = snapshot
                  return newState
                }
                // Otherwise, add to undo history now
                return {
                  ...newState,
                  undoHistory: [...prevState.undoHistory, snapshot],
                }
              } catch {
                return prevState
              }
            })
            setIsAnimating(false)
            animationTimeoutRef.current = null
          }, TIMING.MOVE_ANIMATION_DELAY)
        } else {
          // Invalid move, deselect
          setSelectedNode(null)
          setHighlightedNodes([])
        }
      }
    },
    [
      gameState,
      selectedNode,
      isAnimating,
    ]
  )

  /**
   * Starts a new game
   */
  const startNewGame = useCallback(() => {
    // Clear any pending AI moves
    if (aiMoveTimeoutRef.current) {
      clearTimeout(aiMoveTimeoutRef.current)
      aiMoveTimeoutRef.current = null
    }
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current)
      animationTimeoutRef.current = null
    }
    aiMoveScheduledRef.current = false
    pendingUndoSnapshotRef.current = null

    setGameState(createInitialGameState('pvc', gameState.difficulty))
    setSelectedNode(null)
    setHighlightedNodes([])
    setIsAnimating(false)
    setIsAIThinking(false)
  }, [gameState.difficulty])

  /**
   * Changes difficulty level
   */
  const changeDifficulty = useCallback((newDifficulty: Difficulty) => {
    setGameState(prevState => ({
      ...prevState,
      difficulty: newDifficulty,
    }))
  }, [])

  /**
   * Checks if a node is highlighted (valid move destination)
   */
  const isHighlighted = useCallback(
    (nodeId: NodeId): boolean => {
      return highlightedNodes.includes(nodeId)
    },
    [highlightedNodes]
  )

  /**
   * Checks if a node is selected
   */
  const isNodeSelected = useCallback(
    (nodeId: NodeId): boolean => {
      return selectedNode === nodeId
    },
    [selectedNode]
  )

  /**
   * Checks if a node is removable (opponent piece after mill)
   */
  const isRemovable = useCallback(
    (nodeId: NodeId): boolean => {
      if (!gameState.mustRemovePiece || gameState.currentPlayer !== 1) {
        return false
      }
      return gameState.validMoves.some(m => m.to === nodeId)
    },
    [gameState.mustRemovePiece, gameState.currentPlayer, gameState.validMoves]
  )

  /**
   * Checks if a node is part of the last formed mill
   */
  const isInLastMill = useCallback(
    (nodeId: NodeId): boolean => {
      if (!gameState.lastFormedMill) return false
      return gameState.lastFormedMill.includes(nodeId)
    },
    [gameState.lastFormedMill]
  )

  /**
   * Check if undo is available
   * In VS AI mode: can undo when it's player 1's turn and there's history
   * In PvP mode: can undo when there's history
   */
  const canUndo = useCallback((): boolean => {
    // Cannot undo during animation or AI thinking
    if (isAnimating || isAIThinking) return false
    // Cannot undo if game is not playing
    if (gameState.status !== 'playing') return false
    // Cannot undo if in the middle of removing a piece (must complete the action)
    if (gameState.mustRemovePiece) return false
    // Need history to undo
    if (gameState.undoHistory.length === 0) return false
    // In VS AI mode, can only undo when it's player's turn
    if (gameState.mode === 'pvc' && gameState.currentPlayer !== 1) return false

    return true
  }, [
    isAnimating,
    isAIThinking,
    gameState.status,
    gameState.mustRemovePiece,
    gameState.undoHistory.length,
    gameState.mode,
    gameState.currentPlayer,
  ])

  /**
   * Undo the last move(s)
   * In VS AI mode: undoes both player's move and AI's response
   * In PvP mode: undoes single move
   */
  const undoMove = useCallback(() => {
    if (!canUndo()) return

    // Clear any pending state
    setSelectedNode(null)
    setHighlightedNodes([])
    pendingUndoSnapshotRef.current = null

    setGameState(prevState => {
      const history = prevState.undoHistory
      if (history.length === 0) return prevState

      if (prevState.mode === 'pvc') {
        // In VS AI mode, we need to restore to the state before player's move
        // The last snapshot is from before the player moved, which is what we want
        const snapshot = history[history.length - 1]
        return {
          ...prevState,
          board: new Map(snapshot.board),
          currentPlayer: snapshot.currentPlayer,
          phase: snapshot.phase,
          status: snapshot.status,
          winner: snapshot.winner,
          moveHistory: [...snapshot.moveHistory],
          lastMove: snapshot.lastMove,
          player1PiecesInHand: snapshot.player1PiecesInHand,
          player2PiecesInHand: snapshot.player2PiecesInHand,
          player1PiecesOnBoard: snapshot.player1PiecesOnBoard,
          player2PiecesOnBoard: snapshot.player2PiecesOnBoard,
          validMoves: [...snapshot.validMoves],
          mustRemovePiece: snapshot.mustRemovePiece,
          lastFormedMill: snapshot.lastFormedMill,
          undoHistory: history.slice(0, -1),
        }
      } else {
        // In PvP mode, undo single move
        const snapshot = history[history.length - 1]
        return {
          ...prevState,
          board: new Map(snapshot.board),
          currentPlayer: snapshot.currentPlayer,
          phase: snapshot.phase,
          status: snapshot.status,
          winner: snapshot.winner,
          moveHistory: [...snapshot.moveHistory],
          lastMove: snapshot.lastMove,
          player1PiecesInHand: snapshot.player1PiecesInHand,
          player2PiecesInHand: snapshot.player2PiecesInHand,
          player1PiecesOnBoard: snapshot.player1PiecesOnBoard,
          player2PiecesOnBoard: snapshot.player2PiecesOnBoard,
          validMoves: [...snapshot.validMoves],
          mustRemovePiece: snapshot.mustRemovePiece,
          lastFormedMill: snapshot.lastFormedMill,
          undoHistory: history.slice(0, -1),
        }
      }
    })
  }, [canUndo])

  return {
    gameState,
    selectedNode,
    isAnimating,
    isAIThinking,
    highlightedNodes,
    handleNodeClick,
    startNewGame,
    changeDifficulty,
    isHighlighted,
    isNodeSelected,
    isRemovable,
    isInLastMill,
    canUndo,
    undoMove,
  }
}
