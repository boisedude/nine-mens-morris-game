/**
 * Nine Men's Morris Game Page
 * Main game interface
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { Board } from '@/components/Board'
import { GameControls } from '@/components/GameControls'
import { VictoryDialog } from '@/components/VictoryDialog'
import { LeaderboardDialog } from '@/components/LeaderboardDialog'
import { Tutorial } from '@/components/Tutorial'
import { OpponentChip } from '@/components/OpponentChip'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { getCharacterById } from '@shared/characters'
import { useNineMensMorrisGame } from '@/hooks/useNineMensMorrisGame'
import { useLeaderboard } from '@/hooks/useLeaderboard'
import { useGameAudio } from '@/hooks/useGameAudio'
import { useCharacterSelection, getDifficultyFromUrl } from '@/hooks/useCharacterSelection'
import { useBentleyStats } from '@/hooks/useBentleyStats'
import { ArrowLeftIcon, VolumeIcon, VolumeOffIcon, HelpIcon } from '@shared/icons'
import { countMills } from '@/lib/morrisRules'
import { TIMING } from '@/lib/constants'
import type { Difficulty, GameStatus } from '@/types/morris.types'

// Resolved once: ?character= is the single source of truth for the starting opponent
const initialDifficulty = getDifficultyFromUrl('medium')

const DIFFICULTY_TO_ID = { easy: 'bella', medium: 'coop', hard: 'bentley' } as const

export function MorrisGame() {
  const {
    gameState,
    isAnimating,
    isAIThinking,
    handleNodeClick,
    startNewGame,
    isHighlighted,
    isNodeSelected,
    isRemovable,
    isInLastMill,
    canUndo,
    undoMove,
  } = useNineMensMorrisGame(initialDifficulty)

  const { character, changeCharacter } = useCharacterSelection(initialDifficulty)
  const {
    recordBentleyWin,
    recordBentleyLoss,
    recordBentleyDraw,
  } = useBentleyStats()
  const { stats, recordWin, recordLoss, recordDraw, updatePlayerName, resetStats } = useLeaderboard()
  const { playPlace, playMove, playMill, playRemove, playVictory, playDefeat, playDraw, isMuted, toggleMute } =
    useGameAudio()

  const [showVictoryDialog, setShowVictoryDialog] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [showTutorial, setShowTutorial] = useState(false)

  // Use refs for tracking previous state to avoid cascading renders
  const prevStatusRef = useRef<GameStatus>(gameState.status)
  const prevMustRemoveRef = useRef(gameState.mustRemovePiece)
  const prevMoveCountRef = useRef(gameState.moveHistory.length)

  // Sound effects for moves
  useEffect(() => {
    const currentMoveCount = gameState.moveHistory.length
    if (currentMoveCount > prevMoveCountRef.current) {
      const lastMove = gameState.moveHistory[gameState.moveHistory.length - 1]
      if (lastMove) {
        if (lastMove.from === null) {
          playPlace()
        } else {
          playMove()
        }
        if (lastMove.formedMill) {
          setTimeout(() => playMill(), TIMING.MILL_SOUND_DELAY)
        }
      }
    }
    prevMoveCountRef.current = currentMoveCount
  }, [gameState.moveHistory, playPlace, playMove, playMill])

  // Sound effect for piece removal
  useEffect(() => {
    if (prevMustRemoveRef.current && !gameState.mustRemovePiece) {
      playRemove()
    }
    prevMustRemoveRef.current = gameState.mustRemovePiece
  }, [gameState.mustRemovePiece, playRemove])

  // Detect game end
  useEffect(() => {
    if (prevStatusRef.current === 'playing' && gameState.status !== 'playing') {
      // Calculate stats
      const playerMills = countMills(gameState.board, 1)
      const piecesRemoved = gameState.moveHistory.filter(
        m => m.removedPiece && m.player === 1
      ).length
      const moveCount = gameState.moveHistory.length
      const isPerfect = gameState.winner === 1 && gameState.player2PiecesOnBoard <= 2

      if (gameState.status === 'won') {
        if (gameState.winner === 1) {
          // Player wins
          playVictory()
          recordWin(playerMills, piecesRemoved, isPerfect, moveCount)

          if (gameState.difficulty === 'hard') {
            recordBentleyWin(playerMills, isPerfect, moveCount)
          }
        } else if (gameState.winner === 2) {
          // AI wins
          playDefeat()
          recordLoss(playerMills, piecesRemoved)

          if (gameState.difficulty === 'hard') {
            const wasClose = gameState.player1PiecesOnBoard >= 3
            recordBentleyLoss(playerMills, wasClose)
          }
        }
      } else if (gameState.status === 'draw') {
        playDraw()
        recordDraw(playerMills, piecesRemoved)

        if (gameState.difficulty === 'hard') {
          recordBentleyDraw(playerMills)
        }
      }

      // Use setTimeout to avoid cascading renders from direct setState in effect
      setTimeout(() => setShowVictoryDialog(true), 0)
    }

    prevStatusRef.current = gameState.status
  }, [
    gameState.status,
    gameState.winner,
    gameState.difficulty,
    gameState.player1PiecesOnBoard,
    gameState.player2PiecesOnBoard,
    gameState.moveHistory,
    gameState.board,
    playVictory,
    playDefeat,
    playDraw,
    recordWin,
    recordLoss,
    recordDraw,
    recordBentleyWin,
    recordBentleyLoss,
    recordBentleyDraw,
  ])

  const handleNewGame = useCallback(() => {
    setShowVictoryDialog(false)
    startNewGame()
  }, [startNewGame])

  // Changing opponent always starts a fresh game, so a game cannot be
  // finished against a different opponent than it began with.
  const [pendingDifficulty, setPendingDifficulty] = useState<Difficulty | null>(null)
  const switchOpponent = useCallback(
    (difficulty: Difficulty) => {
      setShowVictoryDialog(false)
      changeCharacter(difficulty)
      startNewGame(difficulty)
    },
    [changeCharacter, startNewGame]
  )
  const gameInProgress = gameState.status === 'playing' && gameState.moveHistory.length > 0
  const handleDifficultyChange = useCallback(
    (difficulty: Difficulty) => {
      if (difficulty === gameState.difficulty) return
      if (gameInProgress) {
        setPendingDifficulty(difficulty)
        return
      }
      switchOpponent(difficulty)
    },
    [gameState.difficulty, gameInProgress, switchOpponent]
  )

  // Keyboard shortcut for Undo (U key)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't interfere with typing in inputs
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return
      }

      // Handle 'U' key for undo
      if ((event.key === 'u' || event.key === 'U') && canUndo()) {
        event.preventDefault()
        undoMove()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [canUndo, undoMove])

  const opponent = character.name
  const inPlacement = gameState.phase === 'placement'
  const turnText =
    gameState.status === 'won'
      ? gameState.winner === 1
        ? 'You won'
        : `${opponent} won`
      : gameState.status === 'draw'
        ? 'Draw'
        : gameState.currentPlayer === 2
          ? `${opponent} is thinking`
          : gameState.mustRemovePiece
            ? 'Mill! Remove a piece'
            : inPlacement
              ? 'Your turn: place a piece'
              : 'Your turn: move a piece'
  const turnActive =
    gameState.status !== 'playing' ? 'over' : gameState.currentPlayer === 1 ? 'you' : 'opponent'
  const showHand = gameState.status === 'playing' && inPlacement

  return (
    <div className="arcade-page">
      <a
        href="#game-board"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-card focus:px-4 focus:py-2 focus:text-sm focus:text-foreground"
      >
        Skip to game board
      </a>

      <header className="arcade-topbar">
        <div className="flex flex-1 items-center">
          <a
            href="https://www.mcooper.com/arcade/"
            className="inline-flex min-h-11 items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeftIcon size={18} />
            Arcade
          </a>
        </div>
        <h1 className="arcade-display sr-only text-xl sm:not-sr-only">Nine Men's Morris</h1>
        <div className="flex flex-1 items-center justify-end gap-1">
          <OpponentChip
            character={character}
            difficulty={gameState.difficulty}
            onDifficultyChange={handleDifficultyChange}
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11 shrink-0"
            onClick={toggleMute}
            aria-label={isMuted ? 'Unmute sound effects' : 'Mute sound effects'}
          >
            {isMuted ? <VolumeOffIcon /> : <VolumeIcon />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11 shrink-0"
            onClick={() => setShowTutorial(true)}
            aria-label="How to play"
          >
            <HelpIcon />
          </Button>
        </div>
      </header>

      <main className="arcade-stage">
        <div className="arcade-score" aria-live="polite">
          <div>
            <strong>{gameState.player1PiecesOnBoard}</strong>
            You
            {showHand && <span className="block text-xs">{gameState.player1PiecesInHand} in hand</span>}
          </div>
          <div className="arcade-turn" data-active={turnActive}>
            {turnText}
          </div>
          <div>
            <strong>{gameState.player2PiecesOnBoard}</strong>
            {opponent}
            {showHand && <span className="block text-xs">{gameState.player2PiecesInHand} in hand</span>}
          </div>
        </div>

        <div id="game-board" className="flex w-full justify-center">
          <Board
            board={gameState.board}
            onNodeClick={handleNodeClick}
            isHighlighted={isHighlighted}
            isNodeSelected={isNodeSelected}
            isRemovable={isRemovable}
            isInLastMill={isInLastMill}
            lastFormedMill={gameState.lastFormedMill}
            disabled={isAnimating || gameState.status !== 'playing'}
          />
        </div>

        <GameControls
          onNewGame={handleNewGame}
          onShowLeaderboard={() => setShowLeaderboard(true)}
          onShowTutorial={() => setShowTutorial(true)}
          onUndo={undoMove}
          canUndo={canUndo()}
          disabled={isAnimating || isAIThinking}
        />
      </main>

      {pendingDifficulty && (
        <Dialog open onOpenChange={(o) => !o && setPendingDifficulty(null)}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>
                Play {getCharacterById(DIFFICULTY_TO_ID[pendingDifficulty]).name} instead?
              </DialogTitle>
              <DialogDescription>
                This ends the current game and starts a new one. It will not count toward any record.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:justify-end">
              <Button
                className="h-11"
                onClick={() => {
                  const d = pendingDifficulty
                  setPendingDifficulty(null)
                  switchOpponent(d)
                }}
              >
                New game
              </Button>
              <Button className="h-11" variant="ghost" onClick={() => setPendingDifficulty(null)}>
                Keep playing
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {showVictoryDialog && (
        <VictoryDialog
          open={showVictoryDialog}
          winner={gameState.winner}
          character={character}
          stats={stats}
          onPlayAgain={handleNewGame}
          onClose={() => setShowVictoryDialog(false)}
        />
      )}

      {showLeaderboard && (
        <LeaderboardDialog
          open={showLeaderboard}
          stats={stats}
          onClose={() => setShowLeaderboard(false)}
          onUpdatePlayerName={updatePlayerName}
          onResetStats={resetStats}
        />
      )}

      {showTutorial && (
        <Tutorial open={showTutorial} opponentName={opponent} onClose={() => setShowTutorial(false)} />
      )}
    </div>
  )
}
