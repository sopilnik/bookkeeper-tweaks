// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest'
import { directionOf, SORTED_EVENT } from '../../../../src/features/recode-sort/messages'

const SIDEWAYS = 'sideways'

describe('directionOf', () => {
  it('reads the direction an event carries, and nothing else', () => {
    expect(directionOf(new CustomEvent(SORTED_EVENT, { detail: 'desc' }))).toBe('desc')
    expect(directionOf(new CustomEvent(SORTED_EVENT, { detail: SIDEWAYS }))).toBeNull()
    expect(directionOf(new Event(SORTED_EVENT))).toBeNull()
  })
})
