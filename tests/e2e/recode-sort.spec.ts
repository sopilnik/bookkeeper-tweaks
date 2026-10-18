import type { Page } from '@playwright/test'
import { installExtStub } from './ext-stub'
import { installExtStore } from './ext-store-stub'
import { EXTENSION_ID, expect, test } from './extension'

const SETTINGS_URL = `chrome-extension://${EXTENSION_ID}/settings.html`
const RECODE_URL = 'https://go.xero.com/Accounts/Recoding/Recode'
const ROWS_SELECTOR = '.x-grid-view tbody td'
const PLACE_SELECTOR = '.x-toolbar.results-toolbar > button.bt-sort + nav.bt-pager'
const SORT_SELECTOR = 'button.bt-sort'
const PAGER_SELECTOR = 'nav.bt-pager'
const PAGE_ROOT_SELECTOR = 'html'
const SENT_SORTERS_ATTRIBUTE = 'data-bt-sent-sorters'
const FEATURE_SWITCH_LABEL = 'Recode sort'
const VISIBLE_MARK_SELECTOR = '.bt-saved:not([hidden])'
const ACTIVE_MESSAGE = 'Bookkeeper Tweaks: active'
const CONSOLE_EVENT = 'console'
const ASCENDING_LABEL = 'This page: Description A→Z'

async function openResults(page: Page): Promise<void> {
  await page.addInitScript(installExtStub)
  await page.addInitScript(installExtStore)
  await page.goto(RECODE_URL)
}

async function sortAscending(page: Page): Promise<void> {
  await openResults(page)
  await page.locator(SORT_SELECTOR).click()

  await expect(page.locator(SORT_SELECTOR)).toHaveText(ASCENDING_LABEL)
}

// Runs in the page: Ext loads rows, as after Next
function loadRows(): void {
  const EXT_GLOBAL = 'Ext'
  const RESULTS_XTYPE = 'resultspanel'
  const ext = Reflect.get(window, EXT_GLOBAL)

  ext.ComponentQuery.query(RESULTS_XTYPE)[0].getStore().load()
}

test.describe('Recode sort', () => {
  test('sits in the results toolbar, left of the top pager', async ({ page }) => {
    await openResults(page)

    await expect(page.locator(PLACE_SELECTOR)).toHaveCount(1)

    const sort = await page.locator(SORT_SELECTOR).boundingBox()
    const pager = await page.locator(PAGER_SELECTOR).boundingBox()

    expect((sort?.x ?? 0) + (sort?.width ?? 0)).toBeLessThan(pager?.x ?? 0)
  })

  test('sorts the loaded page from A to Z, then from Z to A', async ({ page }) => {
    await sortAscending(page)

    await expect(page.locator(ROWS_SELECTOR)).toHaveText(['', 'Bank fee', 'Misc stationery', 'Team coffees'])

    await page.locator(SORT_SELECTOR).click()

    await expect(page.locator(SORT_SELECTOR)).toHaveText('This page: Description Z→A')
    await expect(page.locator(ROWS_SELECTOR)).toHaveText(['Team coffees', 'Misc stationery', 'Bank fee', ''])
  })

  test('shows the page unsorted again after Ext loads rows, which ask with Xero\'s own sort', async ({ page }) => {
    await sortAscending(page)

    await page.evaluate(loadRows)

    await expect(page.locator(SORT_SELECTOR)).toHaveText('Sort this page: Description')
    await expect(page.locator(ROWS_SELECTOR)).toHaveText(['Team coffees', 'Bank fee', '', 'Misc stationery'])
    await expect(page.locator(PAGE_ROOT_SELECTOR)).toHaveAttribute(SENT_SORTERS_ATTRIBUTE, 'InvoiceDate')
  })

  test('says the sort is not available when the page has no results store', async ({ page }) => {
    await page.goto(RECODE_URL)
    await page.locator(SORT_SELECTOR).click()

    await expect(page.locator(SORT_SELECTOR)).toHaveText('Sort not available on this page')
  })

  test('stays away while its switch is off', async ({ page }) => {
    await page.goto(SETTINGS_URL)
    await page.getByLabel(FEATURE_SWITCH_LABEL).click()

    await expect(page.locator(VISIBLE_MARK_SELECTOR)).toHaveText('Saved')

    const active = page.waitForEvent(CONSOLE_EVENT, (message) => message.text() === ACTIVE_MESSAGE)

    await page.goto(RECODE_URL)

    await active

    await expect(page.locator(SORT_SELECTOR)).toHaveCount(0)
  })
})
