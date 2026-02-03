/**
 * Nine Men's Morris Piece Bank Component
 * Shows pieces waiting to be placed on the board with premium styling
 */

import { memo } from 'react'
import type { Player } from '@/types/morris.types'
import { PIECES_PER_PLAYER } from '@/types/morris.types'
import { getPieceBankStyle } from '@/lib/pieceStyles'

interface PieceBankProps {
  player: Player
  piecesInHand: number
  label: string
  isCurrentPlayer: boolean
}

export const PieceBank = memo(function PieceBank({ player, piecesInHand, label, isCurrentPlayer }: PieceBankProps) {
  // Get shared piece bank style
  const pieceStyle = getPieceBankStyle(player)

  return (
    <div
      className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-300 ${
        isCurrentPlayer
          ? 'bg-gradient-to-b from-amber-50 to-amber-100 ring-2 ring-amber-400 shadow-lg'
          : 'bg-gradient-to-b from-gray-50 to-gray-100 shadow-md'
      }`}
      style={{
        boxShadow: isCurrentPlayer
          ? '0 4px 12px rgba(251, 191, 36, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
          : '0 2px 8px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
      }}
      role="region"
      aria-label={`${label}'s pieces in hand: ${piecesInHand}`}
    >
      <div
        className={`text-sm font-semibold ${
          isCurrentPlayer ? 'text-amber-800' : 'text-gray-600'
        }`}
      >
        {label}
      </div>
      <div className="flex flex-wrap gap-1.5 justify-center max-w-24">
        {Array.from({ length: piecesInHand }).map((_, index) => (
          <div
            key={index}
            className="w-4 h-4 sm:w-5 sm:h-5 rounded-full"
            style={pieceStyle}
            aria-hidden="true"
          />
        ))}
        {/* Show empty slots for pieces already placed */}
        {Array.from({ length: PIECES_PER_PLAYER - piecesInHand }).map((_, index) => (
          <div
            key={`empty-${index}`}
            className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-dashed opacity-20"
            style={{
              borderColor: player === 1 ? '#a0a0a0' : '#404040',
            }}
            aria-hidden="true"
          />
        ))}
      </div>
      <div
        className={`text-xs font-medium ${
          isCurrentPlayer ? 'text-amber-700' : 'text-gray-400'
        }`}
      >
        {piecesInHand} remaining
      </div>
    </div>
  )
})
