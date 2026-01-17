/**
 * Nine Men's Morris Game Hook
 * Main game state management
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import type { GameState, Difficulty, NodeId, ValidMove } from '@/types/morris.types'
import {
  createInitialGameState,
  makeMove,
  isValidMove,
} from '@/lib/morrisRules'
import { getAIMove } from '@/lib/aiStrategies'

const AI_MOVE_DELAY = 800 // ms
const MOVE_ANIMATION_DELAY = 300 // ms

export function useNineMensMorrisGame(initialDifficulty: Difficulty = 'medium') {
  const [gameState, setGameState] = useState<GameState>(() =>
    createInitialGameState('pvc', initialDifficulty)
  )
  const [selectedNode, setSelectedNode] = useState<NodeId | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [highlightedNodes, setHighlightedNodes] = useState<NodeId[]>([])

  const aiMoveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const animationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const aiMoveScheduledRef = useRef(false)

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

      aiMoveTimeoutRef.current = setTimeout(() => {
        try {
          const aiMove = getAIMove(gameState, 2, gameState.difficulty)

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
              animationTimeoutRef.current = null
            }, MOVE_ANIMATION_DELAY)
          }
        } catch {
          setIsAnimating(false)
        } finally {
          aiMoveScheduledRef.current = false
        }
      }, AI_MOVE_DELAY)
    }

    return () => {
      if (aiMoveTimeoutRef.current) {
        clearTimeout(aiMoveTimeoutRef.current)
        aiMoveTimeoutRef.current = null
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
    gameState,
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

      // If we must remove an opponent's piece
      if (gameState.mustRemovePiece) {
        const move: ValidMove = { from: null, to: nodeId }
        if (isValidMove(gameState, move)) {
          setIsAnimating(true)
          setSelectedNode(null)
          setHighlightedNodes([])

          animationTimeoutRef.current = setTimeout(() => {
            setGameState(prevState => {
              try {
                return makeMove(prevState, move)
              } catch {
                return prevState
              }
            })
            setIsAnimating(false)
            animationTimeoutRef.current = null
          }, MOVE_ANIMATION_DELAY)
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

            animationTimeoutRef.current = setTimeout(() => {
              setGameState(prevState => {
                try {
                  return makeMove(prevState, move)
                } catch {
                  return prevState
                }
              })
              setIsAnimating(false)
              animationTimeoutRef.current = null
            }, MOVE_ANIMATION_DELAY)
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

          animationTimeoutRef.current = setTimeout(() => {
            setGameState(prevState => {
              try {
                return makeMove(prevState, move)
              } catch {
                return prevState
              }
            })
            setIsAnimating(false)
            animationTimeoutRef.current = null
          }, MOVE_ANIMATION_DELAY)
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
    setGameState(createInitialGameState('pvc', gameState.difficulty))
    setSelectedNode(null)
    setHighlightedNodes([])
    setIsAnimating(false)
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

  return {
    gameState,
    selectedNode,
    isAnimating,
    highlightedNodes,
    handleNodeClick,
    startNewGame,
    changeDifficulty,
    isHighlighted,
    isNodeSelected,
    isRemovable,
    isInLastMill,
  }
}
