import { describe, expect, it } from 'vitest'
import { normalizeSettings } from '../../../src/settings/normalize'
import { APPROVE_ACTIONS, DEFAULT_SETTINGS } from '../../../src/settings/schema'

const WRONG_TYPES = {
  approveDefault: { enabled: 'yes', action: 7 },
  topPager: 'on',
  directPrint: { enabled: 1 },
  recodeSort: [],
}
const UNKNOWN_ACTION = { approveDefault: { enabled: false, action: 'approve-and-archive' } }
const PARTIAL = { topPager: { enabled: false } }
const EXTRA_KEYS = {
  theme: 'dark',
  approveDefault: { enabled: true, action: 'approve-and-email', colour: 'red' },
}

describe('normalizeSettings', () => {
  it('gives the defaults for nothing stored', () => {
    expect(normalizeSettings(undefined)).toEqual(DEFAULT_SETTINGS)
    expect(normalizeSettings(null)).toEqual(DEFAULT_SETTINGS)
  })

  it('replaces every mistyped value with its default', () => {
    expect(normalizeSettings(WRONG_TYPES)).toEqual(DEFAULT_SETTINGS)
  })

  it('replaces an unknown action and keeps the rest of the feature', () => {
    expect(normalizeSettings(UNKNOWN_ACTION).approveDefault).toEqual({ enabled: false, action: 'approve' })
  })

  it('fills the missing features with their defaults', () => {
    expect(normalizeSettings(PARTIAL)).toEqual({ ...DEFAULT_SETTINGS, topPager: { enabled: false } })
  })

  it('drops keys it does not know', () => {
    expect(normalizeSettings(EXTRA_KEYS)).toEqual({
      ...DEFAULT_SETTINGS,
      approveDefault: { enabled: true, action: 'approve-and-email' },
    })
  })

  it.each(APPROVE_ACTIONS)('keeps the action %s', (action) => {
    expect(normalizeSettings({ approveDefault: { action } }).approveDefault.action).toBe(action)
  })
})
