/**
 * Bentley Stats Hook
 * Track special stats when playing against Bentley (hard difficulty)
 */

import { useState, useCallback, useEffect } from 'react'

export interface BentleyStats {
  gamesPlayed: number
  gamesWon: number
  gamesLost: number
  perfectGames: number // Games where you beat Bentley decisively
  closeCalls: number // Games lost by small margin
  totalMills: number
  bestWinMoves: number // Quickest win against Bentley (0 if never won)
}

const STORAGE_KEY = 'nine-mens-morris-bentley-stats'

/**
 * Type guard to validate BentleyStats structure
 */
function isValidBentleyStats(data: unknown): data is BentleyStats {
  if (!data || typeof data !== 'object') {
    return false
  }

  const stats = data as Partial<BentleyStats>

  return (
    typeof stats.gamesPlayed === 'number' &&
    stats.gamesPlayed >= 0 &&
    typeof stats.gamesWon === 'number' &&
    stats.gamesWon >= 0 &&
    typeof stats.gamesLost === 'number' &&
    stats.gamesLost >= 0 &&
    typeof stats.perfectGames === 'number' &&
    stats.perfectGames >= 0 &&
    typeof stats.closeCalls === 'number' &&
    stats.closeCalls >= 0 &&
    typeof stats.totalMills === 'number' &&
    stats.totalMills >= 0 &&
    typeof stats.bestWinMoves === 'number' &&
    stats.bestWinMoves >= 0
  )
}

function loadStats(): BentleyStats {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const data = JSON.parse(stored)

      if (isValidBentleyStats(data)) {
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
    gamesPlayed: 0,
    gamesWon: 0,
    gamesLost: 0,
    perfectGames: 0,
    closeCalls: 0,
    totalMills: 0,
    bestWinMoves: 0,
  }
}

function saveStats(stats: BentleyStats): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats))
  } catch {
    // Silently fail
  }
}

export function useBentleyStats() {
  const [stats, setStats] = useState<BentleyStats>(loadStats)

  useEffect(() => {
    saveStats(stats)
  }, [stats])

  const recordBentleyWin = useCallback(
    (mills: number, isPerfect: boolean, moveCount: number) => {
      setStats(prev => ({
        ...prev,
        gamesPlayed: prev.gamesPlayed + 1,
        gamesWon: prev.gamesWon + 1,
        totalMills: prev.totalMills + mills,
        perfectGames: isPerfect ? prev.perfectGames + 1 : prev.perfectGames,
        bestWinMoves:
          prev.bestWinMoves === 0
            ? moveCount
            : Math.min(prev.bestWinMoves, moveCount),
      }))
    },
    []
  )

  const recordBentleyLoss = useCallback((mills: number, wasClose: boolean) => {
    setStats(prev => ({
      ...prev,
      gamesPlayed: prev.gamesPlayed + 1,
      gamesLost: prev.gamesLost + 1,
      totalMills: prev.totalMills + mills,
      closeCalls: wasClose ? prev.closeCalls + 1 : prev.closeCalls,
    }))
  }, [])

  const recordBentleyDraw = useCallback((mills: number) => {
    setStats(prev => ({
      ...prev,
      gamesPlayed: prev.gamesPlayed + 1,
      totalMills: prev.totalMills + mills,
    }))
  }, [])

  const resetBentleyStats = useCallback(() => {
    const emptyStats: BentleyStats = {
      gamesPlayed: 0,
      gamesWon: 0,
      gamesLost: 0,
      perfectGames: 0,
      closeCalls: 0,
      totalMills: 0,
      bestWinMoves: 0,
    }
    setStats(emptyStats)
  }, [])

  return {
    bentleyStats: stats,
    recordBentleyWin,
    recordBentleyLoss,
    recordBentleyDraw,
    resetBentleyStats,
  }
}
