/**
 * Nine Men's Morris Piece Component
 * Renders a game piece at a node
 */

import type { Player } from '@/types/morris.types'

interface PieceProps {
  player: Player
  isSelected: boolean
  isRemovable: boolean
  isInMill: boolean
}

export function Piece({ player, isSelected, isRemovable, isInMill }: PieceProps) {
  const baseClasses = `
    w-8 h-8 sm:w-10 sm:h-10 rounded-full
    transition-all duration-200
    shadow-lg
  `

  const playerClasses = player === 1
    ? 'bg-gradient-to-br from-gray-100 to-white border-2 border-gray-300'
    : 'bg-gradient-to-br from-gray-800 to-black border-2 border-gray-600'

  const selectedClasses = isSelected
    ? 'ring-4 ring-yellow-400 ring-offset-2 scale-110 z-10'
    : ''

  const removableClasses = isRemovable
    ? 'ring-4 ring-red-500 ring-offset-2 animate-pulse cursor-pointer hover:scale-110'
    : ''

  const millClasses = isInMill
    ? 'ring-2 ring-amber-400'
    : ''

  const pieceLabel = `${player === 1 ? 'White' : 'Black'} piece${isSelected ? ', selected' : ''}${isRemovable ? ', can be removed' : ''}${isInMill ? ', part of mill' : ''}`

  return (
    <div
      className={`${baseClasses} ${playerClasses} ${selectedClasses} ${removableClasses} ${millClasses}`}
      role="img"
      aria-label={pieceLabel}
    />
  )
}
