/**
 * Game constants for Nine Men's Morris
 * Centralized timing and magic number definitions
 */

/**
 * Timing constants in milliseconds
 */
export const TIMING = {
  /** Delay before AI makes its move */
  AI_MOVE_DELAY: 800,
  /** Animation delay for move transitions */
  MOVE_ANIMATION_DELAY: 300,
  /** Delay before playing mill formation sound */
  MILL_SOUND_DELAY: 200,
} as const
