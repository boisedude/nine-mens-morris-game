/**
 * Leaderboard Hook
 * Manages player statistics and leaderboard for Nine Men's Morris
 */

import { useState, useEffect, useCallback } from 'react'
import type { LeaderboardEntry } from '@/types/morris.types'

const STORAGE_KEY = 'nine-mens-morris-leaderboard'
const DEFAULT_PLAYER_NAME = 'Player'

/**
 * Type guard to validate LeaderboardEntry structure
 */
function isValidLeaderboard(data: unknown): data is LeaderboardEntry {
  if (!data || typeof data !== 'object') {
    return false
  }

  const entry = data as Partial<LeaderboardEntry>

  return (
    typeof entry.playerName === 'string' &&
    typeof entry.wins === 'number' &&
    entry.wins >= 0 &&
    typeof entry.losses === 'number' &&
    entry.losses >= 0 &&
    typeof entry.draws === 'number' &&
    entry.draws >= 0 &&
    typeof entry.winStreak === 'number' &&
    entry.winStreak >= 0 &&
    typeof entry.longestWinStreak === 'number' &&
    entry.longestWinStreak >= 0 &&
    typeof entry.millsFormed === 'number' &&
    entry.millsFormed >= 0 &&
    typeof entry.piecesRemoved === 'number' &&
    entry.piecesRemoved >= 0 &&
    typeof entry.perfectGames === 'number' &&
    entry.perfectGames >= 0 &&
    typeof entry.totalGames === 'number' &&
    entry.totalGames >= 0 &&
    typeof entry.quickestWin === 'number' &&
    entry.quickestWin >= 0
  )
}

function getInitialLeaderboard(): LeaderboardEntry {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const data = JSON.parse(stored)

      if (isValidLeaderboard(data)) {
        return data
      } else {
        localStorage.removeItem(STORAGE_KEY)
      }
    }
  } catch {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // Ignore errors when trying to clear
    }
  }

  return {
    playerName: DEFAULT_PLAYER_NAME,
    wins: 0,
    losses: 0,
    draws: 0,
    winStreak: 0,
    longestWinStreak: 0,
    millsFormed: 0,
    piecesRemoved: 0,
    perfectGames: 0,
    totalGames: 0,
    quickestWin: 0,
  }
}

export function useLeaderboard() {
  const [stats, setStats] = useState<LeaderboardEntry>(getInitialLeaderboard)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stats))
    } catch {
      // Failed to save - stats will be lost but game continues
    }
  }, [stats])

  const recordWin = useCallback(
    (millsFormed: number, piecesRemoved: number, isPerfect: boolean, moveCount: number) => {
      setStats(prev => {
        const newWinStreak = prev.winStreak + 1
        const newLongestStreak = Math.max(newWinStreak, prev.longestWinStreak)
        const newQuickestWin =
          prev.quickestWin === 0
            ? moveCount
            : Math.min(prev.quickestWin, moveCount)

        return {
          ...prev,
          wins: prev.wins + 1,
          winStreak: newWinStreak,
          longestWinStreak: newLongestStreak,
          millsFormed: prev.millsFormed + millsFormed,
          piecesRemoved: prev.piecesRemoved + piecesRemoved,
          perfectGames: isPerfect ? prev.perfectGames + 1 : prev.perfectGames,
          totalGames: prev.totalGames + 1,
          quickestWin: newQuickestWin,
        }
      })
    },
    []
  )

  const recordLoss = useCallback((millsFormed: number, piecesRemoved: number) => {
    setStats(prev => ({
      ...prev,
      losses: prev.losses + 1,
      winStreak: 0,
      millsFormed: prev.millsFormed + millsFormed,
      piecesRemoved: prev.piecesRemoved + piecesRemoved,
      totalGames: prev.totalGames + 1,
    }))
  }, [])

  const recordDraw = useCallback((millsFormed: number, piecesRemoved: number) => {
    setStats(prev => ({
      ...prev,
      draws: prev.draws + 1,
      winStreak: 0,
      millsFormed: prev.millsFormed + millsFormed,
      piecesRemoved: prev.piecesRemoved + piecesRemoved,
      totalGames: prev.totalGames + 1,
    }))
  }, [])

  const updatePlayerName = useCallback((name: string) => {
    setStats(prev => ({
      ...prev,
      playerName: name || DEFAULT_PLAYER_NAME,
    }))
  }, [])

  const resetStats = useCallback(() => {
    setStats(prev => ({
      playerName: prev.playerName,
      wins: 0,
      losses: 0,
      draws: 0,
      winStreak: 0,
      longestWinStreak: 0,
      millsFormed: 0,
      piecesRemoved: 0,
      perfectGames: 0,
      totalGames: 0,
      quickestWin: 0,
    }))
  }, [])

  return {
    stats,
    recordWin,
    recordLoss,
    recordDraw,
    updatePlayerName,
    resetStats,
  }
}
