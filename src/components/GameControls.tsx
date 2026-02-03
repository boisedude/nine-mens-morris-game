/**
 * Game Controls Component
 * Controls for difficulty selection, new game, leaderboard, undo, etc.
 */

import { Button } from './ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import type { Difficulty } from '@/types/morris.types'
import type { Character } from '@shared/characters'

interface GameControlsProps {
  difficulty: Difficulty
  onDifficultyChange: (difficulty: Difficulty) => void
  onNewGame: () => void
  onShowLeaderboard: () => void
  onShowHelp?: () => void
  onUndo?: () => void
  canUndo?: boolean
  disabled?: boolean
  character: Character
}

export function GameControls({
  difficulty,
  onDifficultyChange,
  onNewGame,
  onShowLeaderboard,
  onShowHelp,
  onUndo,
  canUndo = false,
  disabled = false,
  character,
}: GameControlsProps) {
  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      {/* Difficulty Selection */}
      <div className="flex flex-col sm:flex-row items-center gap-2 w-full">
        <label htmlFor="difficulty" className="text-xs sm:text-sm font-medium whitespace-nowrap">
          Your Opponent:
        </label>
        <Select
          value={difficulty}
          onValueChange={value => onDifficultyChange(value as Difficulty)}
        >
          <SelectTrigger id="difficulty" className="w-full sm:w-52 h-10 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="easy">{character.difficulty === 'easy' ? character.emoji : '🐕'} Bella - Playful Pup</SelectItem>
            <SelectItem value="medium">{character.difficulty === 'medium' ? character.emoji : '🎮'} Coop - Casual Challenger</SelectItem>
            <SelectItem value="hard">{character.difficulty === 'hard' ? character.emoji : '🐺'} Bentley - The Mastermind</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 w-full justify-center flex-wrap">
        <Button
          onClick={onNewGame}
          disabled={disabled}
          variant="default"
          className="flex-1 sm:flex-none h-10 text-sm sm:text-base min-w-[80px]"
        >
          New Game
        </Button>

        {onUndo && (
          <Button
            onClick={onUndo}
            disabled={disabled || !canUndo}
            variant="outline"
            className="flex-1 sm:flex-none h-10 text-sm sm:text-base min-w-[80px]"
            aria-label="Undo last move (U)"
            title="Undo (U)"
          >
            Undo
          </Button>
        )}

        <Button
          onClick={onShowLeaderboard}
          disabled={disabled}
          variant="outline"
          className="flex-1 sm:flex-none h-10 text-sm sm:text-base min-w-[80px]"
        >
          Stats
        </Button>

        {onShowHelp && (
          <Button
            onClick={onShowHelp}
            disabled={disabled}
            variant="outline"
            className="flex-1 sm:flex-none h-10 text-sm sm:text-base min-w-[80px]"
          >
            Help
          </Button>
        )}
      </div>
    </div>
  )
}
