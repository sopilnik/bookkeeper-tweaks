// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { loadFixture } from '../helpers/fixture'
import { queryRequired } from '../helpers/query'

// Read from the repository root, where Vitest runs
const PAGE_FILE = 'src/settings-page/settings.html'

const PAGE_MODULE = '../../../src/settings-page/settings'
const MANIFEST_VERSION = '1.0.0'
const CHROME_GLOBAL = 'chrome'
const FORM_SELECTOR = '#bt-settings-form'
const SWITCH_SELECTOR = '#bt-directPrint'
const VISIBLE_MARK_SELECTOR = '.bt-saved:not([hidden])'
const CHANGE_EVENT = 'change'
const STORED = { settings: { directPrint: { enabled: true } } }

interface SlowStorage {
  release: () => void
  set: ReturnType<typeof vi.fn>
}

// Installs a chrome.storage.local whose reads wait until release() is called
function installSlowStorage(): SlowStorage {
  let release = (): void => undefined
  const loaded = new Promise<void>((resolve) => {
    release = resolve
  })
  const set = vi.fn(() => Promise.resolve())
  const local = { get: () => loaded.then(() => STORED), set }

  vi.stubGlobal(CHROME_GLOBAL, { runtime: { getManifest: () => ({ version: MANIFEST_VERSION }) }, storage: { local } })

  return { release, set }
}

beforeEach(async () => {
  await loadFixture(PAGE_FILE)
  vi.resetModules()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('the settings page start-up', () => {
  it('keeps the form inert until the stored settings are shown, then saves a change', async () => {
    const storage = installSlowStorage()
    const form = queryRequired<HTMLFormElement>(document, FORM_SELECTOR)
    const directPrint = queryRequired<HTMLInputElement>(form, SWITCH_SELECTOR)

    await import(PAGE_MODULE)

    expect(form.inert).toBe(true)

    storage.release()
    await vi.waitFor(() => expect(form.inert).toBe(false))

    expect(directPrint.checked).toBe(true)

    directPrint.checked = false
    directPrint.dispatchEvent(new Event(CHANGE_EVENT, { bubbles: true }))
    await vi.waitFor(() => expect(document.querySelectorAll(VISIBLE_MARK_SELECTOR)).toHaveLength(1))

    expect(storage.set).toHaveBeenCalledTimes(1)
  })
})
