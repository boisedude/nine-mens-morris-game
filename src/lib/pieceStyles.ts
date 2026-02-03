/**
 * Shared piece styling for Nine Men's Morris
 * Premium piece appearance with realistic stone/wood textures
 */

export interface PieceStyle {
  background: string
  boxShadow: string
  border: string
}

/**
 * Full-size piece style for board pieces (Piece.tsx)
 */
export const whitePieceStyle: PieceStyle = {
  background: `
    radial-gradient(ellipse 80% 50% at 35% 25%, rgba(255, 255, 255, 0.95) 0%, transparent 50%),
    radial-gradient(ellipse 120% 100% at 50% 100%, rgba(180, 180, 180, 0.4) 0%, transparent 60%),
    radial-gradient(circle at 50% 50%, #f8f8f8 0%, #e8e8e8 40%, #d8d8d8 70%, #c8c8c8 100%)
  `,
  boxShadow: `
    inset 0 -6px 12px rgba(0, 0, 0, 0.15),
    inset 0 3px 6px rgba(255, 255, 255, 0.9),
    inset 2px 0 4px rgba(255, 255, 255, 0.3),
    inset -2px 0 4px rgba(0, 0, 0, 0.05),
    0 6px 12px rgba(0, 0, 0, 0.35),
    0 3px 6px rgba(0, 0, 0, 0.25),
    0 1px 2px rgba(0, 0, 0, 0.2)
  `,
  border: '1px solid rgba(200, 200, 200, 0.8)',
}

/**
 * Full-size piece style for board pieces (Piece.tsx)
 */
export const blackPieceStyle: PieceStyle = {
  background: `
    radial-gradient(ellipse 80% 50% at 35% 25%, rgba(100, 100, 100, 0.6) 0%, transparent 50%),
    radial-gradient(ellipse 120% 100% at 50% 100%, rgba(0, 0, 0, 0.5) 0%, transparent 60%),
    radial-gradient(circle at 50% 50%, #3a3a3a 0%, #252525 40%, #1a1a1a 70%, #0a0a0a 100%)
  `,
  boxShadow: `
    inset 0 -6px 12px rgba(0, 0, 0, 0.5),
    inset 0 3px 6px rgba(255, 255, 255, 0.12),
    inset 2px 0 4px rgba(255, 255, 255, 0.08),
    inset -2px 0 4px rgba(0, 0, 0, 0.3),
    0 6px 12px rgba(0, 0, 0, 0.5),
    0 3px 6px rgba(0, 0, 0, 0.35),
    0 1px 2px rgba(0, 0, 0, 0.3)
  `,
  border: '1px solid rgba(60, 60, 60, 0.8)',
}

/**
 * Smaller piece style for piece bank display (PieceBank.tsx)
 */
export const whitePieceBankStyle: PieceStyle = {
  background: `
    radial-gradient(ellipse 80% 50% at 35% 25%, rgba(255, 255, 255, 0.9) 0%, transparent 50%),
    radial-gradient(circle at 50% 50%, #f8f8f8 0%, #e8e8e8 40%, #d8d8d8 70%, #c8c8c8 100%)
  `,
  boxShadow: `
    inset 0 -2px 4px rgba(0, 0, 0, 0.12),
    inset 0 1px 2px rgba(255, 255, 255, 0.8),
    0 2px 4px rgba(0, 0, 0, 0.25),
    0 1px 2px rgba(0, 0, 0, 0.15)
  `,
  border: '1px solid rgba(200, 200, 200, 0.7)',
}

/**
 * Smaller piece style for piece bank display (PieceBank.tsx)
 */
export const blackPieceBankStyle: PieceStyle = {
  background: `
    radial-gradient(ellipse 80% 50% at 35% 25%, rgba(100, 100, 100, 0.5) 0%, transparent 50%),
    radial-gradient(circle at 50% 50%, #3a3a3a 0%, #252525 40%, #1a1a1a 70%, #0a0a0a 100%)
  `,
  boxShadow: `
    inset 0 -2px 4px rgba(0, 0, 0, 0.4),
    inset 0 1px 2px rgba(255, 255, 255, 0.1),
    0 2px 4px rgba(0, 0, 0, 0.35),
    0 1px 2px rgba(0, 0, 0, 0.25)
  `,
  border: '1px solid rgba(60, 60, 60, 0.7)',
}

/**
 * Get piece style based on player
 */
export function getPieceStyle(player: 1 | 2): PieceStyle {
  return player === 1 ? whitePieceStyle : blackPieceStyle
}

/**
 * Get piece bank style based on player
 */
export function getPieceBankStyle(player: 1 | 2): PieceStyle {
  return player === 1 ? whitePieceBankStyle : blackPieceBankStyle
}
