import type { Page } from '@playwright/test'
import { EXTENSION_ID, expect } from './extension'

const SETTINGS_URL = `chrome-extension://${EXTENSION_ID}/settings.html`
const VISIBLE_MARK_SELECTOR = '.bt-saved:not([hidden])'
const ACTIVE_MESSAGE = 'Bookkeeper Tweaks: active'
const CONSOLE_EVENT = 'console'

// Flips the setting with this label on the settings page and waits for it to be saved
export async function changeSetting(page: Page, label: string): Promise<void> {
  await page.goto(SETTINGS_URL)
  await page.getByLabel(label).click()
  await expect(page.locator(VISIBLE_MARK_SELECTOR)).toHaveText('Saved')
}

// Switches the feature off, then opens the page and waits until the extension reports itself active there
export async function openWithSwitchOff(page: Page, label: string, url: string): Promise<void> {
  await changeSetting(page, label)

  const active = page.waitForEvent(CONSOLE_EVENT, (message) => message.text() === ACTIVE_MESSAGE)

  await page.goto(url)

  await active
}
