import { createInitialGameState, makeMove, getAllValidMoves, isValidMove } from '@/lib/morrisRules'
import { getAIMove } from '@/lib/aiStrategies'
import type { GameState } from '@/types/morris.types'

describe('hard AI', () => {
  it('does not always give the same reply to the same position', () => {
    // The player opens; Bentley's first placement should vary between games
    const opened = makeMove(createInitialGameState('pvc', 'hard'), { from: null, to: 'a1' })
    const replies = new Set<string>()
    for (let i = 0; i < 12; i++) {
      replies.add(getAIMove(opened, 2, 'hard')!.to)
    }
    expect(replies.size).toBeGreaterThan(1)
  }, 60000)

  it('answers within a few seconds in every placement position, and legally', () => {
    let s: GameState = createInitialGameState('pvc', 'hard')
    let worst = 0
    let plies = 0
    while (s.status === 'playing' && plies < 24) {
      let move
      if (s.currentPlayer === 2) {
        const t = Date.now()
        move = getAIMove(s, 2, 'hard')!
        worst = Math.max(worst, Date.now() - t)
        expect(isValidMove(s, move)).toBe(true)
      } else {
        const all = getAllValidMoves(s)
        move = all[Math.floor(Math.random() * all.length)]
      }
      s = makeMove(s, move)
      plies++
    }
    expect(worst).toBeLessThan(2500)
  }, 60000)

  it('still takes a mill that wins material when one is available', () => {
    const s = createInitialGameState('pvc', 'hard')
    ;['a1', 'a4'].forEach(n => s.board.set(n, 2))
    ;['g1', 'g7', 'd1'].forEach(n => s.board.set(n, 1))
    s.currentPlayer = 2
    s.player1PiecesInHand = 6
    s.player2PiecesInHand = 7
    s.player1PiecesOnBoard = 3
    s.player2PiecesOnBoard = 2
    s.validMoves = getAllValidMoves(s)
    for (let i = 0; i < 5; i++) {
      expect(getAIMove(s, 2, 'hard')!.to).toBe('a7')
    }
  })
})
