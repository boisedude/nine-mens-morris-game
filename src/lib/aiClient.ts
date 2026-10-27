/**
 * Promise API over the AI web worker. Falls back to a synchronous call when
 * Workers are unavailable or the worker fails.
 */
import type { GameState, Difficulty, Player, ValidMove } from '@/types/morris.types'
import { getAIMove } from '@/lib/aiStrategies'

export type AIRequest = {
  id: number
  kind: 'getAIMove'
  args: [GameState, Player, Difficulty]
}

export type AIResponse = { id: number; result?: ValidMove | null; error?: string }

type Pending = { resolve: (m: ValidMove | null) => void; fallback: () => ValidMove | null }

let worker: Worker | null = null
let workerBroken = false
let nextId = 1
const pending = new Map<number, Pending>()

function failAll() {
  workerBroken = true
  worker?.terminate()
  worker = null
  const all = [...pending.values()]
  pending.clear()
  for (const p of all) {
    try {
      p.resolve(p.fallback())
    } catch {
      p.resolve(null)
    }
  }
}

function getWorker(): Worker | null {
  if (workerBroken || typeof Worker === 'undefined') return null
  if (worker) return worker
  try {
    const w = new Worker(new URL('../workers/ai.worker.ts', import.meta.url), { type: 'module' })
    w.onmessage = (e: MessageEvent<AIResponse>) => {
      const p = pending.get(e.data.id)
      if (!p) return
      pending.delete(e.data.id)
      if (e.data.error !== undefined) {
        try {
          p.resolve(p.fallback())
        } catch {
          p.resolve(null)
        }
      } else {
        p.resolve(e.data.result ?? null)
      }
    }
    w.onerror = failAll
    w.onmessageerror = failAll
    worker = w
    return w
  } catch {
    workerBroken = true
    return null
  }
}

export function requestAIMove(state: GameState, player: Player, difficulty: Difficulty): Promise<ValidMove | null> {
  const fallback = () => getAIMove(state, player, difficulty)
  const w = getWorker()
  if (!w) {
    try {
      return Promise.resolve(fallback())
    } catch (e) {
      return Promise.reject(e)
    }
  }
  return new Promise((resolve, reject) => {
    const id = nextId++
    pending.set(id, {
      resolve,
      fallback,
    })
    try {
      // History is not needed by the search and is the heaviest part to clone
      const req: AIRequest = { id, kind: 'getAIMove', args: [{ ...state, undoHistory: [] }, player, difficulty] }
      w.postMessage(req)
    } catch (e) {
      pending.delete(id)
      workerBroken = true
      try {
        resolve(fallback())
      } catch {
        reject(e)
      }
    }
  })
}
