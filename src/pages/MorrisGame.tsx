/**
 * Nine Men's Morris Game Page
 * Main game interface
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { Board } from '@/components/Board'
import { PieceBank } from '@/components/PieceBank'
import { PhaseIndicator } from '@/components/PhaseIndicator'
import { GameControls } from '@/components/GameControls'
import { VictoryDialog } from '@/components/VictoryDialog'
import { LeaderboardDialog } from '@/components/LeaderboardDialog'
import { Button } from '@/components/ui/button'
import { useNineMensMorrisGame } from '@/hooks/useNineMensMorrisGame'
import { useLeaderboard } from '@/hooks/useLeaderboard'
import { useGameAudio } from '@/hooks/useGameAudio'
import { useCharacterSelection } from '@/hooks/useCharacterSelection'
import { useBentleyStats } from '@/hooks/useBentleyStats'
import { countMills } from '@/lib/morrisRules'

export function MorrisGame() {
  const {
    gameState,
    isAnimating,
    handleNodeClick,
    startNewGame,
    changeDifficulty,
    isHighlighted,
    isNodeSelected,
    isRemovable,
    isInLastMill,
  } = useNineMensMorrisGame()

  const { character, changeCharacter } = useCharacterSelection(gameState.difficulty)
  const {
    recordBentleyWin,
    recordBentleyLoss,
    recordBentleyDraw,
  } = useBentleyStats()
  const { stats, recordWin, recordLoss, recordDraw, updatePlayerName, resetStats } = useLeaderboard()
  const { playPlace, playMove, playMill, playRemove, playVictory, playDefeat, playDraw } = useGameAudio()

  const [showVictoryDialog, setShowVictoryDialog] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [prevStatus, setPrevStatus] = useState(gameState.status)
  const [prevMustRemove, setPrevMustRemove] = useState(gameState.mustRemovePiece)
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
          setTimeout(() => playMill(), 200)
        }
      }
    }
    prevMoveCountRef.current = currentMoveCount
  }, [gameState.moveHistory, playPlace, playMove, playMill])

  // Sound effect for piece removal
  // setState in effect is intentional - tracking previous state for comparison
  useEffect(() => {
    if (prevMustRemove && !gameState.mustRemovePiece) {
      playRemove()
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPrevMustRemove(gameState.mustRemovePiece)
  }, [gameState.mustRemovePiece, prevMustRemove, playRemove])

  // Detect game end
  useEffect(() => {
    if (prevStatus === 'playing' && gameState.status !== 'playing') {
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

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowVictoryDialog(true)
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPrevStatus(gameState.status)
  }, [
    gameState.status,
    gameState.winner,
    gameState.difficulty,
    gameState.player1PiecesOnBoard,
    gameState.player2PiecesOnBoard,
    gameState.moveHistory,
    gameState.board,
    prevStatus,
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

  const handleDifficultyChange = useCallback(
    (difficulty: 'easy' | 'medium' | 'hard') => {
      changeDifficulty(difficulty)
      changeCharacter(difficulty)
    },
    [changeDifficulty, changeCharacter]
  )

  return (
    <div className="flex min-h-screen flex-col items-center justify-start bg-gradient-to-br from-amber-50 to-orange-100 p-2 sm:p-4 sm:justify-center">
      {/* Return to Arcade Button */}
      <div className="w-full max-w-lg mb-3 sm:mb-4">
        <a href="/arcade" className="block">
          <Button
            variant="outline"
            className="w-full sm:w-auto h-10 sm:h-11 text-sm sm:text-base font-semibold border-2 hover:bg-amber-100 hover:border-amber-400"
          >
            &#8592; Return to Arcade
          </Button>
        </a>
      </div>

      {/* Character Info */}
      <div className="mb-3 sm:mb-4 flex items-center gap-3 sm:gap-4 rounded-lg bg-white p-3 sm:p-4 shadow-lg w-full max-w-md" role="region" aria-label="Current opponent">
        <img
          src={character.avatar}
          alt={`${character.name} avatar`}
          className="h-12 w-12 sm:h-16 sm:w-16 rounded-full border-2 border-amber-500"
        />
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-800">
            {character.name} {character.emoji}
          </h3>
          <p className="text-xs sm:text-sm text-gray-600">{character.playingStyle}</p>
        </div>
      </div>

      {/* Piece Banks */}
      <div className="mb-3 sm:mb-4 flex gap-4 sm:gap-8 w-full max-w-md justify-center" role="region" aria-label="Pieces in hand">
        <PieceBank
          player={1}
          piecesInHand={gameState.player1PiecesInHand}
          label="You"
          isCurrentPlayer={gameState.currentPlayer === 1 && !gameState.mustRemovePiece && gameState.phase === 'placement'}
        />
        <PieceBank
          player={2}
          piecesInHand={gameState.player2PiecesInHand}
          label={character.name}
          isCurrentPlayer={gameState.currentPlayer === 2 && !gameState.mustRemovePiece && gameState.phase === 'placement'}
        />
      </div>

      {/* Phase Indicator */}
      <div className="mb-3 sm:mb-4 w-full max-w-md">
        <PhaseIndicator
          phase={gameState.phase}
          currentPlayer={gameState.currentPlayer}
          mustRemovePiece={gameState.mustRemovePiece}
          characterName={character.name}
        />
      </div>

      {/* Board */}
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

      {/* Piece Counts on Board */}
      <div className="mt-3 sm:mt-4 flex gap-4 sm:gap-8 rounded-lg bg-white p-3 shadow-lg w-full max-w-md" role="region" aria-label="Piece count on board">
        <div className="text-center flex-1">
          <div className="text-xl sm:text-2xl font-bold text-gray-800">{gameState.player1PiecesOnBoard}</div>
          <div className="text-xs sm:text-sm text-gray-600">Your Pieces on Board</div>
        </div>
        <div className="border-l border-gray-300" />
        <div className="text-center flex-1">
          <div className="text-xl sm:text-2xl font-bold text-gray-800">{gameState.player2PiecesOnBoard}</div>
          <div className="text-xs sm:text-sm text-gray-600">{character.name}'s Pieces</div>
        </div>
      </div>

      {/* Game Controls */}
      <div className="mt-4 sm:mt-6 mb-4 w-full max-w-md px-2">
        <GameControls
          difficulty={gameState.difficulty}
          onDifficultyChange={handleDifficultyChange}
          onNewGame={handleNewGame}
          onShowLeaderboard={() => setShowLeaderboard(true)}
          character={character}
        />
      </div>

      {/* Victory Dialog */}
      {showVictoryDialog && (
        <VictoryDialog
          open={showVictoryDialog}
          winner={gameState.winner}
          character={character}
          onPlayAgain={handleNewGame}
          onClose={() => setShowVictoryDialog(false)}
          player1Pieces={gameState.player1PiecesOnBoard}
          player2Pieces={gameState.player2PiecesOnBoard}
        />
      )}

      {/* Leaderboard Dialog */}
      {showLeaderboard && (
        <LeaderboardDialog
          open={showLeaderboard}
          stats={stats}
          onClose={() => setShowLeaderboard(false)}
          onUpdatePlayerName={updatePlayerName}
          onResetStats={resetStats}
        />
      )}
    </div>
  )
}
