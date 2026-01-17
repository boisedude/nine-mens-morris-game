/**
 * Game Controls Component
 * Controls for difficulty selection, new game, leaderboard, etc.
 */

import { Button } from './ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import type { Difficulty } from '@/types/morris.types'
import type { Character } from '../../../shared/characters'

interface GameControlsProps {
  difficulty: Difficulty
  onDifficultyChange: (difficulty: Difficulty) => void
  onNewGame: () => void
  onShowLeaderboard: () => void
  onShowHelp?: () => void
  disabled?: boolean
  character: Character
}

export function GameControls({
  difficulty,
  onDifficultyChange,
  onNewGame,
  onShowLeaderboard,
  onShowHelp,
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
      <div className="flex gap-2 w-full justify-center">
        <Button
          onClick={onNewGame}
          disabled={disabled}
          variant="default"
          className="flex-1 sm:flex-none h-10 text-sm sm:text-base"
        >
          New Game
        </Button>

        <Button
          onClick={onShowLeaderboard}
          disabled={disabled}
          variant="outline"
          className="flex-1 sm:flex-none h-10 text-sm sm:text-base"
        >
          Stats
        </Button>

        {onShowHelp && (
          <Button
            onClick={onShowHelp}
            disabled={disabled}
            variant="outline"
            className="flex-1 sm:flex-none h-10 text-sm sm:text-base"
          >
            Help
          </Button>
        )}
      </div>
    </div>
  )
}
