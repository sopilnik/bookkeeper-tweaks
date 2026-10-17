import { EXTENSION_ID, expect, test } from './extension'

const SETTINGS_URL = `chrome-extension://${EXTENSION_ID}/settings.html`
const APP_PAGE_URL = 'https://go.xero.com/app/!demo0/blank'
const MISSING_PAGE_URL = 'https://go.xero.com/app/!demo0/missing'
const OTHER_HOST_URL = 'https://example.com/'
const ACTIVE_MESSAGE = 'Bookkeeper Tweaks: active'

test('shows the settings page with the version', async ({ page }) => {
  await page.goto(SETTINGS_URL)

  await expect(page.getByRole('heading', { name: 'Bookkeeper Tweaks' })).toBeVisible()
  await expect(page.getByText('Version 0.1.0')).toBeVisible()
})

test('runs the content script on a Xero app page without host permissions', async ({ page }) => {
  const message = page.waitForEvent('console', (entry) => entry.text() === ACTIVE_MESSAGE)

  await page.goto(APP_PAGE_URL)

  expect((await message).type()).toBe('debug')
})

test('answers a Xero request without a fixture with a 404', async ({ page }) => {
  const response = await page.goto(MISSING_PAGE_URL)

  expect(response?.status()).toBe(404)
})

test('aborts every request to another host', async ({ page }) => {
  await expect(page.goto(OTHER_HOST_URL)).rejects.toThrow('net::ERR_FAILED')
})
