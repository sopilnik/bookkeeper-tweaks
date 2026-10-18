import { describe, expect, it } from 'vitest'
import { compareDescriptions } from '../../../../src/features/recode-sort/compare'

const BANK_FEE = 'Bank fee'
const BANK_FEE_LOWER = 'bank fee'
const CAFE = 'Café'
const CAFE_PLAIN = 'cafe'
const TEAM_COFFEES = 'Team coffees'
const EMPTY = ''

describe('compareDescriptions', () => {
  it('orders from A to Z', () => {
    expect([TEAM_COFFEES, BANK_FEE].sort(compareDescriptions)).toEqual([BANK_FEE, TEAM_COFFEES])
  })

  it('ignores case and accents', () => {
    expect(compareDescriptions(BANK_FEE, BANK_FEE_LOWER)).toBe(0)
    expect(compareDescriptions(CAFE, CAFE_PLAIN)).toBe(0)
  })

  it('treats a missing description as empty, so it comes first', () => {
    expect([BANK_FEE, null].sort(compareDescriptions)).toEqual([null, BANK_FEE])
    expect(compareDescriptions(undefined, BANK_FEE)).toBeLessThan(0)
    expect(compareDescriptions(null, EMPTY)).toBe(0)
  })
})
