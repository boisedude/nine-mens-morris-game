/**
 * useGameAudio Hook
 * Manages game sound effects using Web Audio API for Nine Men's Morris
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { STORAGE_KEYS } from '@/lib/storageKeys'

type SoundEffect = 'place' | 'move' | 'mill' | 'remove' | 'victory' | 'defeat' | 'draw' | 'click'

// Audio timing constants (in seconds)
const AUDIO_TIMING = {
  PLACE_DURATION: 0.1,
  MOVE_DURATION: 0.15,
  MILL_DURATION: 0.5,
  REMOVE_DURATION: 0.2,
  VICTORY_NOTE_DELAY: 0.15,
  VICTORY_NOTE_DURATION: 0.3,
  DEFEAT_DURATION: 0.5,
  DRAW_DURATION: 0.3,
  CLICK_DURATION: 0.05,
} as const

// Victory sound notes (C major chord)
const VICTORY_NOTES = [262, 330, 392, 523] as const

// Mill sound notes (triumphant arpeggio)
const MILL_NOTES = [392, 494, 587] as const

// Type declaration for webkit compatibility
type WebkitWindow = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext
  }

export function useGameAudio() {
  const [isMuted, setIsMuted] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.AUDIO_MUTED) === 'true'
  })

  const audioContextRef = useRef<AudioContext | null>(null)

  // Initialize Audio Context
  useEffect(() => {
    if (typeof window !== 'undefined' && !audioContextRef.current) {
      try {
        const AudioContextClass = window.AudioContext || (window as WebkitWindow).webkitAudioContext
        if (AudioContextClass) {
          audioContextRef.current = new AudioContextClass()
        }
      } catch {
        // Web Audio API not supported
      }
    }

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  // Toggle mute
  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const newValue = !prev
      localStorage.setItem(STORAGE_KEYS.AUDIO_MUTED, String(newValue))
      return newValue
    })
  }, [])

  // Play piece placement sound
  const playPlace = useCallback(() => {
    if (isMuted || !audioContextRef.current) return

    const ctx = audioContextRef.current
    const now = ctx.currentTime

    const osc = ctx.createOscillator()
    const gainNode = ctx.createGain()

    osc.connect(gainNode)
    gainNode.connect(ctx.destination)

    osc.frequency.setValueAtTime(400, now)
    osc.frequency.exponentialRampToValueAtTime(200, now + AUDIO_TIMING.PLACE_DURATION)

    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(0.15, now + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + AUDIO_TIMING.PLACE_DURATION)

    osc.type = 'sine'
    osc.start(now)
    osc.stop(now + AUDIO_TIMING.PLACE_DURATION)
  }, [isMuted])

  // Play piece movement sound
  const playMove = useCallback(() => {
    if (isMuted || !audioContextRef.current) return

    const ctx = audioContextRef.current
    const now = ctx.currentTime

    const osc = ctx.createOscillator()
    const gainNode = ctx.createGain()

    osc.connect(gainNode)
    gainNode.connect(ctx.destination)

    osc.frequency.setValueAtTime(300, now)
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.07)
    osc.frequency.exponentialRampToValueAtTime(250, now + AUDIO_TIMING.MOVE_DURATION)

    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(0.12, now + 0.02)
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + AUDIO_TIMING.MOVE_DURATION)

    osc.type = 'triangle'
    osc.start(now)
    osc.stop(now + AUDIO_TIMING.MOVE_DURATION)
  }, [isMuted])

  // Play mill formed sound
  const playMill = useCallback(() => {
    if (isMuted || !audioContextRef.current) return

    const ctx = audioContextRef.current
    const now = ctx.currentTime

    // Play ascending arpeggio
    MILL_NOTES.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gainNode = ctx.createGain()

      osc.connect(gainNode)
      gainNode.connect(ctx.destination)

      const startTime = now + i * 0.1
      osc.frequency.setValueAtTime(freq, startTime)

      gainNode.gain.setValueAtTime(0, startTime)
      gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.03)
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15)

      osc.type = 'triangle'
      osc.start(startTime)
      osc.stop(startTime + 0.15)
    })
  }, [isMuted])

  // Play piece removal sound
  const playRemove = useCallback(() => {
    if (isMuted || !audioContextRef.current) return

    const ctx = audioContextRef.current
    const now = ctx.currentTime

    const osc = ctx.createOscillator()
    const gainNode = ctx.createGain()

    osc.connect(gainNode)
    gainNode.connect(ctx.destination)

    osc.frequency.setValueAtTime(500, now)
    osc.frequency.exponentialRampToValueAtTime(150, now + AUDIO_TIMING.REMOVE_DURATION)

    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(0.2, now + 0.02)
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + AUDIO_TIMING.REMOVE_DURATION)

    osc.type = 'sawtooth'
    osc.start(now)
    osc.stop(now + AUDIO_TIMING.REMOVE_DURATION)
  }, [isMuted])

  // Play victory sound
  const playVictory = useCallback(() => {
    if (isMuted || !audioContextRef.current) return

    const ctx = audioContextRef.current
    const now = ctx.currentTime

    VICTORY_NOTES.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gainNode = ctx.createGain()

      osc.connect(gainNode)
      gainNode.connect(ctx.destination)

      const startTime = now + i * AUDIO_TIMING.VICTORY_NOTE_DELAY
      osc.frequency.setValueAtTime(freq, startTime)

      gainNode.gain.setValueAtTime(0, startTime)
      gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.05)
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + AUDIO_TIMING.VICTORY_NOTE_DURATION)

      osc.type = 'triangle'
      osc.start(startTime)
      osc.stop(startTime + AUDIO_TIMING.VICTORY_NOTE_DURATION)
    })
  }, [isMuted])

  // Play defeat sound
  const playDefeat = useCallback(() => {
    if (isMuted || !audioContextRef.current) return

    const ctx = audioContextRef.current
    const now = ctx.currentTime

    const osc = ctx.createOscillator()
    const gainNode = ctx.createGain()

    osc.connect(gainNode)
    gainNode.connect(ctx.destination)

    osc.frequency.setValueAtTime(300, now)
    osc.frequency.exponentialRampToValueAtTime(100, now + AUDIO_TIMING.DEFEAT_DURATION)

    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(0.2, now + 0.05)
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + AUDIO_TIMING.DEFEAT_DURATION)

    osc.type = 'sawtooth'
    osc.start(now)
    osc.stop(now + AUDIO_TIMING.DEFEAT_DURATION)
  }, [isMuted])

  // Play draw sound
  const playDraw = useCallback(() => {
    if (isMuted || !audioContextRef.current) return

    const ctx = audioContextRef.current
    const now = ctx.currentTime

    const frequencies = [220, 330]
    frequencies.forEach(freq => {
      const osc = ctx.createOscillator()
      const gainNode = ctx.createGain()

      osc.connect(gainNode)
      gainNode.connect(ctx.destination)

      osc.frequency.setValueAtTime(freq, now)

      gainNode.gain.setValueAtTime(0, now)
      gainNode.gain.linearRampToValueAtTime(0.15, now + 0.05)
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + AUDIO_TIMING.DRAW_DURATION)

      osc.type = 'sine'
      osc.start(now)
      osc.stop(now + AUDIO_TIMING.DRAW_DURATION)
    })
  }, [isMuted])

  // Play click sound
  const playClick = useCallback(() => {
    if (isMuted || !audioContextRef.current) return

    const ctx = audioContextRef.current
    const now = ctx.currentTime

    const osc = ctx.createOscillator()
    const gainNode = ctx.createGain()

    osc.connect(gainNode)
    gainNode.connect(ctx.destination)

    osc.frequency.setValueAtTime(800, now)
    osc.frequency.exponentialRampToValueAtTime(400, now + AUDIO_TIMING.CLICK_DURATION)

    gainNode.gain.setValueAtTime(0.1, now)
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + AUDIO_TIMING.CLICK_DURATION)

    osc.type = 'square'
    osc.start(now)
    osc.stop(now + AUDIO_TIMING.CLICK_DURATION)
  }, [isMuted])

  // Play any sound effect
  const playSound = useCallback(
    (effect: SoundEffect) => {
      switch (effect) {
        case 'place':
          playPlace()
          break
        case 'move':
          playMove()
          break
        case 'mill':
          playMill()
          break
        case 'remove':
          playRemove()
          break
        case 'victory':
          playVictory()
          break
        case 'defeat':
          playDefeat()
          break
        case 'draw':
          playDraw()
          break
        case 'click':
          playClick()
          break
      }
    },
    [playPlace, playMove, playMill, playRemove, playVictory, playDefeat, playDraw, playClick]
  )

  return {
    isMuted,
    toggleMute,
    playSound,
    playPlace,
    playMove,
    playMill,
    playRemove,
    playVictory,
    playDefeat,
    playDraw,
    playClick,
  }
}
