/**
 * Nine Men's Morris Piece Bank Component
 * Shows pieces waiting to be placed on the board
 */

import type { Player } from '@/types/morris.types'

interface PieceBankProps {
  player: Player
  piecesInHand: number
  label: string
  isCurrentPlayer: boolean
}

export function PieceBank({ player, piecesInHand, label, isCurrentPlayer }: PieceBankProps) {
  const pieceClasses = player === 1
    ? 'bg-gradient-to-br from-gray-100 to-white border-2 border-gray-300'
    : 'bg-gradient-to-br from-gray-800 to-black border-2 border-gray-600'

  return (
    <div
      className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-all ${
        isCurrentPlayer ? 'bg-amber-100 ring-2 ring-amber-400' : 'bg-gray-100'
      }`}
      role="region"
      aria-label={`${label}'s pieces in hand: ${piecesInHand}`}
    >
      <div className="text-sm font-medium text-gray-700">{label}</div>
      <div className="flex flex-wrap gap-1 justify-center max-w-24">
        {Array.from({ length: piecesInHand }).map((_, index) => (
          <div
            key={index}
            className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full ${pieceClasses} shadow-sm`}
            aria-hidden="true"
          />
        ))}
      </div>
      <div className="text-xs text-gray-500">{piecesInHand} left</div>
    </div>
  )
}
