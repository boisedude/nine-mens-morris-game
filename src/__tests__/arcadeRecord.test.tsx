import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { createInitialGameState } from '@/lib/morrisRules'
import type { Difficulty, GameState } from '@/types/morris.types'

const mockPlayerBeat = jest.fn()
const mockBentleyBeat = jest.fn()
jest.mock('@shared/arcadeRecord', () => ({
  recordPlayerBeatBentley: () => mockPlayerBeat(),
  recordBentleyBeatPlayer: () => mockBentleyBeat(),
}))

let mockState: GameState
jest.mock('@/hooks/useNineMensMorrisGame', () => ({
  useNineMensMorrisGame: () => ({
    gameState: mockState,
    isAnimating: false,
    isAIThinking: false,
    handleNodeClick: jest.fn(),
    startNewGame: jest.fn(),
    changeDifficulty: jest.fn(),
    isHighlighted: () => false,
    isNodeSelected: () => false,
    isRemovable: () => false,
    isInLastMill: () => false,
    canUndo: () => false,
    undoMove: jest.fn(),
  }),
}))
jest.mock('@/hooks/useGameAudio', () => {
  const f = jest.fn()
  return {
    useGameAudio: () => ({
      playPlace: f, playMove: f, playMill: f, playRemove: f,
      playVictory: f, playDefeat: f, playDraw: f,
    }),
  }
})

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

import { MorrisGame } from '@/pages/MorrisGame'

function base(difficulty: Difficulty): GameState {
  return createInitialGameState('pvc', difficulty)
}

function finish(difficulty: Difficulty, status: 'won' | 'draw', winner: 1 | 2 | null) {
  mockState = base(difficulty)
  const container = document.createElement('div')
  const root = createRoot(container)
  act(() => root.render(<MorrisGame />))
  mockState = { ...mockState, status, winner }
  act(() => root.render(<MorrisGame />))
  // re-render again: effect must not post twice
  act(() => root.render(<MorrisGame />))
  act(() => root.unmount())
}

describe('arcade record wiring', () => {
  beforeEach(() => {
    mockPlayerBeat.mockClear()
    mockBentleyBeat.mockClear()
    localStorage.clear()
  })

  it('posts a player win once when the player beats Bentley', () => {
    finish('hard', 'won', 1)
    expect(mockPlayerBeat).toHaveBeenCalledTimes(1)
    expect(mockBentleyBeat).not.toHaveBeenCalled()
  })
  it('posts a Bentley win once when Bentley beats the player', () => {
    finish('hard', 'won', 2)
    expect(mockBentleyBeat).toHaveBeenCalledTimes(1)
    expect(mockPlayerBeat).not.toHaveBeenCalled()
  })
  it('does not post for draws against Bentley', () => {
    finish('hard', 'draw', null)
    expect(mockPlayerBeat).not.toHaveBeenCalled()
    expect(mockBentleyBeat).not.toHaveBeenCalled()
  })
  it('does not post against Bella or Coop', () => {
    finish('easy', 'won', 1)
    finish('medium', 'won', 2)
    expect(mockPlayerBeat).not.toHaveBeenCalled()
    expect(mockBentleyBeat).not.toHaveBeenCalled()
  })
})
