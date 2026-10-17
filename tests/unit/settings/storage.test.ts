import { describe, expect, it, vi } from 'vitest'
import { DEFAULT_SETTINGS } from '../../../src/settings/schema'
import type { Settings } from '../../../src/settings/schema'
import { loadSettings, saveSettings } from '../../../src/settings/storage'

const STORED = { settings: { recodeSort: { enabled: false }, theme: 'dark' } }
const CHANGED: Settings = { ...DEFAULT_SETTINGS, directPrint: { enabled: false } }

function fakeArea(items: Record<string, unknown>) {
  return {
    get: vi.fn(() => Promise.resolve(items)),
    set: vi.fn(() => Promise.resolve()),
  }
}

describe('loadSettings', () => {
  it('gives the defaults when nothing is stored', async () => {
    const area = fakeArea({})

    expect(await loadSettings(area)).toEqual(DEFAULT_SETTINGS)
    expect(area.get).toHaveBeenCalledWith('settings')
  })

  it('normalizes the stored object', async () => {
    expect(await loadSettings(fakeArea(STORED))).toEqual({ ...DEFAULT_SETTINGS, recodeSort: { enabled: false } })
  })
})

describe('saveSettings', () => {
  it('writes one object under the settings key', async () => {
    const area = fakeArea({})

    await saveSettings(area, CHANGED)

    expect(area.set).toHaveBeenCalledWith({ settings: CHANGED })
  })
})
