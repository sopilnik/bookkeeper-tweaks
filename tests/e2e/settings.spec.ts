import { EXTENSION_ID, expect, test } from './extension'

const SETTINGS_URL = `chrome-extension://${EXTENSION_ID}/settings.html`
const VISIBLE_MARK_SELECTOR = '.bt-saved:not([hidden])'

test('saves a switch as soon as it changes', async ({ page }) => {
  const printSwitch = page.getByRole('switch', { name: 'Direct print' })

  await page.goto(SETTINGS_URL)

  await expect(printSwitch).toBeChecked()

  await printSwitch.click()

  await expect(page.locator(VISIBLE_MARK_SELECTOR)).toHaveText('Saved')

  await page.reload()

  await expect(printSwitch).not.toBeChecked()
})

test('saves the Approve action as soon as it is picked', async ({ page }) => {
  const approveAction = page.getByRole('radio', { name: 'Approve', exact: true })
  const printAction = page.getByRole('radio', { name: /Approve & print PDF/ })

  await page.goto(SETTINGS_URL)

  await expect(approveAction).toBeChecked()

  await printAction.check()

  await expect(page.locator(VISIBLE_MARK_SELECTOR)).toHaveText('Saved')

  await page.reload()

  await expect(printAction).toBeChecked()
})
