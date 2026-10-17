import { normalizeSettings } from './normalize'
import type { Settings } from './schema'

const SETTINGS_KEY = 'settings'

// The part of chrome.storage.local this module uses, so tests can pass a fake
export interface StorageAreaLike {
  get(key: string): Promise<Record<string, unknown>>
  set(items: Record<string, unknown>): Promise<void>
}

export async function loadSettings(area: StorageAreaLike): Promise<Settings> {
  const items = await area.get(SETTINGS_KEY)

  return normalizeSettings(items[SETTINGS_KEY])
}

export async function saveSettings(area: StorageAreaLike, settings: Settings): Promise<void> {
  await area.set({ [SETTINGS_KEY]: settings })
}
