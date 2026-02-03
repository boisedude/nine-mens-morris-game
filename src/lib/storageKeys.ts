/**
 * LocalStorage keys for Nine Men's Morris
 * Centralized storage key definitions to avoid magic strings
 */

export const STORAGE_KEYS = {
  /** Player leaderboard and statistics */
  LEADERBOARD: 'nine-mens-morris-leaderboard',
  /** Bentley (hard AI) specific statistics */
  BENTLEY_STATS: 'nine-mens-morris-bentley-stats',
  /** Audio muted preference */
  AUDIO_MUTED: 'nine-mens-morris-audio-muted',
} as const

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS]
