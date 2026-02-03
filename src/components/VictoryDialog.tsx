/**
 * Victory Dialog Component
 * Shows game result with Morris-themed personality messages
 */

import { useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { Button } from './ui/button'
import type { Player } from '@/types/morris.types'
import type { Character } from '@shared/characters'

interface VictoryDialogProps {
  open: boolean
  winner: Player | null
  player1Pieces: number
  player2Pieces: number
  onPlayAgain: () => void
  onClose: () => void
  character: Character
}

/**
 * Selects a random item from an array
 * Used inside useMemo to ensure consistent selection per render cycle
 */
function selectRandomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

export function VictoryDialog({
  open,
  winner,
  player1Pieces,
  player2Pieces,
  onPlayAgain,
  onClose,
  character,
}: VictoryDialogProps) {
  const isDraw = winner === null

  // Memoize the victory message to avoid re-randomizing on each render
  // The message should only change when the dialog opens with new game results
  const victoryMessage = useMemo(() => {
    if (isDraw) {
      const drawMessages = [
        `It's a draw! Both you and ${character.name} played well!`,
        `A stalemate! ${character.name} is impressed with your strategy!`,
        'Neither side could find a winning move. Rematch?',
        `Tied game! ${character.name} wants another round!`,
      ]
      return selectRandomItem(drawMessages)
    } else if (winner === 1) {
      return selectRandomItem(character.catchphrases.playerWins)
    } else {
      return selectRandomItem(character.catchphrases.characterWins)
    }
  }, [isDraw, winner, character.name, character.catchphrases.playerWins, character.catchphrases.characterWins])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">
            {isDraw ? 'Draw!' : winner === 1 ? `You Beat ${character.name}!` : `${character.name} Wins!`}
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            {victoryMessage}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          {/* Character Avatar */}
          <div className="flex items-center justify-center py-2">
            {winner === 1 ? (
              <img
                src={character.loseImage}
                alt={`${character.name} loses`}
                className="max-h-40 w-auto object-contain"
                onError={(e) => {
                  e.currentTarget.src = character.avatar
                }}
              />
            ) : winner === 2 ? (
              <img
                src={character.winImage}
                alt={`${character.name} wins`}
                className="max-h-40 w-auto object-contain"
                onError={(e) => {
                  e.currentTarget.src = character.avatar
                }}
              />
            ) : (
              <img
                src={character.playAgainImage}
                alt={`${character.name}`}
                className="max-h-40 w-auto object-contain"
                onError={(e) => {
                  e.currentTarget.src = character.avatar
                }}
              />
            )}
          </div>

          {/* Visual Result */}
          <div className="flex items-center justify-center gap-6 py-4">
            {winner === 1 ? (
              <>
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-gray-100 to-white border-4 border-yellow-400 shadow-2xl animate-pulse" />
                <div className="text-5xl" role="img" aria-label="Trophy">&#127942;</div>
              </>
            ) : winner === 2 ? (
              <>
                <div className="text-5xl opacity-50" role="img" aria-label="Crying face">&#128546;</div>
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-gray-800 to-black border-4 border-yellow-400 shadow-2xl animate-pulse" />
              </>
            ) : (
              <>
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-gray-100 to-white border-2 border-gray-300 shadow-lg" />
                <div className="text-4xl" role="img" aria-label="Handshake">&#129309;</div>
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-gray-800 to-black border-2 border-gray-600 shadow-lg" />
              </>
            )}
          </div>

          {/* Final Score */}
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-lg bg-muted p-3">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-full bg-gradient-to-br from-gray-100 to-white border border-gray-300 shadow-sm" />
                <span className="font-medium">You (White)</span>
              </div>
              <span className={`text-xl font-bold ${winner === 1 ? 'text-green-600' : ''}`}>
                {player1Pieces} pieces
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-muted p-3">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-full bg-gradient-to-br from-gray-800 to-black shadow-sm" />
                <span className="font-medium">{character.name} (Black)</span>
              </div>
              <span className={`text-xl font-bold ${winner === 2 ? 'text-green-600' : ''}`}>
                {player2Pieces} pieces
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button onClick={onPlayAgain} className="w-full sm:w-auto">
            Play Again
          </Button>
          <Button onClick={onClose} variant="outline" className="w-full sm:w-auto">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
