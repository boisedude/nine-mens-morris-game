/**
 * Nine Men's Morris Phase Indicator Component
 * Shows the current game phase and instructions
 */

import type { GamePhase, Player } from '@/types/morris.types'

interface PhaseIndicatorProps {
  phase: GamePhase
  currentPlayer: Player
  mustRemovePiece: boolean
  characterName: string
}

export function PhaseIndicator({
  phase,
  currentPlayer,
  mustRemovePiece,
  characterName,
}: PhaseIndicatorProps) {
  const isPlayerTurn = currentPlayer === 1
  const playerName = isPlayerTurn ? 'Your' : `${characterName}'s`

  let instruction = ''
  let phaseLabel = ''

  if (mustRemovePiece) {
    instruction = isPlayerTurn
      ? 'Mill formed! Click an opponent piece to remove it.'
      : `${characterName} formed a mill and will remove a piece.`
    phaseLabel = 'Mill Formed!'
  } else {
    switch (phase) {
      case 'placement':
        instruction = isPlayerTurn
          ? 'Click an empty node to place a piece.'
          : `${characterName} is placing a piece.`
        phaseLabel = 'Placement Phase'
        break
      case 'movement':
        instruction = isPlayerTurn
          ? 'Select a piece, then click an adjacent empty node.'
          : `${characterName} is moving a piece.`
        phaseLabel = 'Movement Phase'
        break
      case 'flying':
        instruction = isPlayerTurn
          ? 'You have 3 pieces - you can move to any empty node!'
          : `${characterName} has 3 pieces and can fly anywhere!`
        phaseLabel = 'Flying Phase'
        break
    }
  }

  return (
    <div
      className={`text-center p-3 rounded-lg transition-all ${
        mustRemovePiece
          ? 'bg-red-100 border-2 border-red-400'
          : 'bg-white shadow-md'
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center justify-center gap-2 mb-1">
        <div
          className={`w-4 h-4 rounded-full ${
            currentPlayer === 1
              ? 'bg-gradient-to-br from-gray-100 to-white border border-gray-300'
              : 'bg-gradient-to-br from-gray-800 to-black'
          }`}
          aria-hidden="true"
        />
        <span className="font-semibold text-gray-800">
          {playerName} Turn
        </span>
      </div>
      <div
        className={`text-xs font-medium mb-1 ${
          mustRemovePiece ? 'text-red-600' : 'text-amber-600'
        }`}
      >
        {phaseLabel}
      </div>
      <p className="text-sm text-gray-600">{instruction}</p>
    </div>
  )
}
