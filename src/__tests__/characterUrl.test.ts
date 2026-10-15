import { getDifficultyFromUrl } from '@/hooks/useCharacterSelection'

function setSearch(search: string) {
  window.history.pushState({}, '', `/${search}`)
}

describe('?character= mapping', () => {
  afterEach(() => setSearch(''))

  it('maps bentley to hard', () => {
    setSearch('?character=bentley')
    expect(getDifficultyFromUrl()).toBe('hard')
  })
  it('maps bella to easy', () => {
    setSearch('?character=bella')
    expect(getDifficultyFromUrl()).toBe('easy')
  })
  it('maps coop to medium', () => {
    setSearch('?character=coop')
    expect(getDifficultyFromUrl()).toBe('medium')
  })
  it('defaults to medium with no or invalid parameter', () => {
    setSearch('')
    expect(getDifficultyFromUrl()).toBe('medium')
    setSearch('?character=nobody')
    expect(getDifficultyFromUrl()).toBe('medium')
  })
})
