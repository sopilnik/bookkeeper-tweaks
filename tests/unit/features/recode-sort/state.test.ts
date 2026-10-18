import { describe, expect, it } from 'vitest'
import { labelOf, nextDirection } from '../../../../src/features/recode-sort/state'

describe('nextDirection', () => {
  it('asks for A to Z first, then goes back and forth', () => {
    expect(nextDirection('unsorted')).toBe('asc')
    expect(nextDirection('asc')).toBe('desc')
    expect(nextDirection('desc')).toBe('asc')
    expect(nextDirection('unavailable')).toBe('asc')
  })
})

describe('labelOf', () => {
  it('names the order and says it is this page only', () => {
    expect(labelOf('unsorted')).toBe('Sort this page: Description')
    expect(labelOf('asc')).toBe('This page: Description A→Z')
    expect(labelOf('desc')).toBe('This page: Description Z→A')
    expect(labelOf('unavailable')).toBe('Sort not available on this page')
  })
})
