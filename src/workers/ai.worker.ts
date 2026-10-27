/**
 * Runs the AI search off the main thread.
 * Request: { id, kind, args }  Response: { id, result } (or { id, error }).
 */
import { getAIMove } from '@/lib/aiStrategies'
import type { AIRequest, AIResponse } from '@/lib/aiClient'

const ctx = self as unknown as {
  onmessage: ((e: MessageEvent<AIRequest>) => void) | null
  postMessage: (msg: AIResponse) => void
}

ctx.onmessage = (e: MessageEvent<AIRequest>) => {
  const { id, kind, args } = e.data
  try {
    if (kind === 'getAIMove') {
      ctx.postMessage({ id, result: getAIMove(args[0], args[1], args[2]) })
    } else {
      ctx.postMessage({ id, error: `unknown kind ${String(kind)}` })
    }
  } catch (err) {
    ctx.postMessage({ id, error: err instanceof Error ? err.message : String(err) })
  }
}
