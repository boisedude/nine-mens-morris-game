/**
 * Nine Men's Morris Piece Component
 * Renders premium game pieces with realistic stone/wood textures and animations
 */

import { memo, useEffect, useState } from 'react'
import type { Player } from '@/types/morris.types'
import { cn } from '@/lib/utils'
import { getPieceStyle } from '@/lib/pieceStyles'

interface PieceProps {
  player: Player
  isSelected: boolean
  isRemovable: boolean
  isInMill: boolean
}

export const Piece = memo(function Piece({ player, isSelected, isRemovable, isInMill }: PieceProps) {
  const [isNew, setIsNew] = useState(true)

  const pieceLabel = `${player === 1 ? 'White' : 'Black'} piece${isSelected ? ', selected' : ''}${isRemovable ? ', can be removed' : ''}${isInMill ? ', part of mill' : ''}`

  // Handle piece placement animation
  useEffect(() => {
    const timer = setTimeout(() => setIsNew(false), 400)
    return () => clearTimeout(timer)
  }, [])

  // Get shared piece style
  const pieceStyle = getPieceStyle(player)

  const selectedGlow = isSelected
    ? player === 1
      ? '0 0 0 4px rgba(250, 204, 21, 0.8), 0 0 20px rgba(250, 204, 21, 0.4)'
      : '0 0 0 4px rgba(250, 204, 21, 0.8), 0 0 20px rgba(250, 204, 21, 0.5)'
    : ''

  const millGlow = isInMill && !isSelected
    ? '0 0 0 3px rgba(251, 191, 36, 0.7), 0 0 15px rgba(251, 191, 36, 0.3)'
    : ''

  const removableGlow = isRemovable
    ? '0 0 0 4px rgba(239, 68, 68, 0.8), 0 0 20px rgba(239, 68, 68, 0.4)'
    : ''

  const combinedBoxShadow = [
    pieceStyle.boxShadow,
    selectedGlow,
    millGlow,
    removableGlow,
  ]
    .filter(Boolean)
    .join(', ')

  return (
    <div
      className={cn(
        // Base classes
        'w-8 h-8 sm:w-10 sm:h-10 rounded-full relative',
        // Animation classes
        isNew && 'animate-piece-drop',
        // Selected state with floating animation
        isSelected && 'z-10 animate-float-selected',
        // Removable state
        isRemovable && 'cursor-pointer animate-ring-pulse',
        // Mill celebration
        isInMill && !isSelected && !isRemovable && 'animate-mill-celebration'
      )}
      style={{
        ...pieceStyle,
        boxShadow: combinedBoxShadow,
        transform: isSelected ? 'scale(1.1)' : isRemovable ? 'scale(1.05)' : 'scale(1)',
        transition: 'transform 0.2s ease-out, box-shadow 0.2s ease-out',
      }}
      role="img"
      aria-label={pieceLabel}
    >
      {/* Subtle wood grain texture overlay for white pieces */}
      {player === 1 && (
        <div
          className="absolute inset-0 rounded-full opacity-10 pointer-events-none"
          style={{
            background: `
              repeating-linear-gradient(
                85deg,
                transparent 0px,
                transparent 3px,
                rgba(139, 90, 43, 0.15) 3px,
                rgba(139, 90, 43, 0.15) 4px
              )
            `,
          }}
        />
      )}

      {/* Subtle texture for black pieces */}
      {player === 2 && (
        <div
          className="absolute inset-0 rounded-full opacity-20 pointer-events-none"
          style={{
            background: `
              radial-gradient(
                circle at 20% 20%,
                rgba(255, 255, 255, 0.05) 0%,
                transparent 50%
              )
            `,
          }}
        />
      )}

      {/* Highlight shine spot */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          top: '15%',
          left: '20%',
          width: '30%',
          height: '20%',
          background: player === 1
            ? 'radial-gradient(ellipse, rgba(255,255,255,0.8) 0%, transparent 70%)'
            : 'radial-gradient(ellipse, rgba(255,255,255,0.15) 0%, transparent 70%)',
        }}
      />

      {/* X icon overlay for removable pieces - colorblind accessible indicator */}
      {isRemovable && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="rounded-full p-1"
            style={{
              background: 'rgba(239, 68, 68, 0.2)',
            }}
          >
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4 sm:w-5 sm:h-5"
              stroke={player === 1 ? '#b91c1c' : '#fca5a5'}
              strokeWidth={3.5}
              strokeLinecap="round"
              fill="none"
              style={{
                filter: player === 1
                  ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))'
                  : 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))',
              }}
            >
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="18" y1="6" x2="6" y2="18" />
            </svg>
          </div>
        </div>
      )}

      {/* Mill indicator star/sparkle */}
      {isInMill && !isRemovable && (
        <div
          className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, #fbbf24 0%, #f59e0b 50%, transparent 70%)',
            borderRadius: '50%',
            filter: 'drop-shadow(0 0 3px #fbbf24)',
            animation: 'mill-glow 1.5s ease-in-out infinite',
          }}
        />
      )}
    </div>
  )
})
