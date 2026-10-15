/**
 * Character Selection Hook
 * Maps difficulty levels to characters and manages character state
 * Reads ?character= URL parameter for arcade integration
 */

import { useState, useCallback } from 'react'
import { getCharacterById } from '@shared/characters'
import type { Character, CharacterId } from '@shared/characters'
import type { Difficulty } from '@/types/morris.types'

// Map Morris difficulty to character IDs
const difficultyToCharacter: Record<Difficulty, CharacterId> = {
  easy: 'bella',
  medium: 'coop',
  hard: 'bentley',
}

// Map character IDs to difficulty levels
const characterToDifficulty: Record<CharacterId, Difficulty> = {
  bella: 'easy',
  coop: 'medium',
  bentley: 'hard',
}

// Valid character IDs
const validCharacters: CharacterId[] = ['bella', 'coop', 'bentley']

// Read character from URL parameter
export function getCharacterFromUrl(): CharacterId | null {
  const params = new URLSearchParams(window.location.search)
  const urlCharacter = params.get('character')
  if (urlCharacter && validCharacters.includes(urlCharacter as CharacterId)) {
    return urlCharacter as CharacterId
  }
  return null
}

/** Difficulty implied by ?character=, or the fallback when absent/invalid. */
export function getDifficultyFromUrl(fallback: Difficulty = 'medium'): Difficulty {
  const urlCharacter = getCharacterFromUrl()
  return urlCharacter ? characterToDifficulty[urlCharacter] : fallback
}

/** True when the page was opened with a valid ?character= parameter. */
export function hasCharacterParam(): boolean {
  return getCharacterFromUrl() !== null
}

export function useCharacterSelection(initialDifficulty: Difficulty = 'medium') {
  const [difficulty, setDifficulty] = useState<Difficulty>(() => {
    // Priority: URL parameter > initial difficulty
    const urlCharacter = getCharacterFromUrl()
    if (urlCharacter) {
      return characterToDifficulty[urlCharacter]
    }
    return initialDifficulty
  })
  const [character, setCharacter] = useState<Character>(() => {
    const urlCharacter = getCharacterFromUrl()
    if (urlCharacter) {
      return getCharacterById(urlCharacter)
    }
    return getCharacterById(difficultyToCharacter[initialDifficulty])
  })

  const changeCharacter = useCallback((newDifficulty: Difficulty) => {
    setDifficulty(newDifficulty)
    const characterId = difficultyToCharacter[newDifficulty]
    setCharacter(getCharacterById(characterId))
  }, [])

  const getCharacterForDifficulty = useCallback((diff: Difficulty): Character => {
    const characterId = difficultyToCharacter[diff]
    return getCharacterById(characterId)
  }, [])

  return {
    character,
    difficulty,
    changeCharacter,
    getCharacterForDifficulty,
  }
}
