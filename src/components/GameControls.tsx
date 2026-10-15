/**
 * Game Controls Component
 * One primary button, the rest outline
 */

import { memo } from 'react'
import { Button } from './ui/button'

interface GameControlsProps {
  onNewGame: () => void
  onShowLeaderboard: () => void
  onShowTutorial: () => void
  onUndo?: () => void
  canUndo?: boolean
  disabled?: boolean
}

export const GameControls = memo(function GameControls({
  onNewGame,
  onShowLeaderboard,
  onShowTutorial,
  onUndo,
  canUndo = false,
  disabled = false,
}: GameControlsProps) {
  return (
    <div className="arcade-controls">
      <Button onClick={onNewGame} disabled={disabled} className="h-11 px-5">
        New game
      </Button>

      {onUndo && (
        <Button
          onClick={onUndo}
          disabled={disabled || !canUndo}
          variant="outline"
          className="h-11 px-5"
          title="Undo (U)"
        >
          Undo
        </Button>
      )}

      <Button onClick={onShowLeaderboard} disabled={disabled} variant="outline" className="h-11 px-5">
        Stats
      </Button>

      <Button onClick={onShowTutorial} variant="outline" className="h-11 px-5">
        How to play
      </Button>
    </div>
  )
})
