import type { Page } from '@playwright/test'
import { installBillsStub } from './bills-stub'
import { installExtStub } from './ext-stub'
import { expect, test } from './extension'
import { openWithSwitchOff } from './settings-switch'

const CLASSIC_URL = 'https://go.xero.com/AccountsReceivable/Search.aspx'
const RECODE_URL = 'https://go.xero.com/Accounts/Recoding/Recode'
const BILLS_URL = 'https://go.xero.com/app/!demo0/bills/list/all'
const BAR_SELECTOR = 'nav.bt-pager'
const PAGE_PICKER = { name: 'Page', exact: true }
const SIZE_PICKER = { name: 'Items per page' }
const NEXT_BUTTON = { name: 'Next page' }
const PREVIOUS_BUTTON = { name: 'Previous page' }
const PAGE_ROOT_SELECTOR = 'html'
const NAVIGATED_ATTRIBUTE = 'data-bt-navigated'
const PERFORMED_ATTRIBUTE = 'data-bt-performed'
const CLASSIC_PLACE = 'div.action-bar > nav.bt-pager:first-child'
const RECODE_PLACE = '.x-toolbar.results-toolbar > nav.bt-pager:last-child'
const BILLS_PLACE = '.xui-u-flex-justify-end > nav.bt-pager'
const PICKING_SELECTOR = 'html.bt-picking'
const FEATURE_SWITCH_LABEL = 'Top pager'
const SECOND_PAGE = '2'
const THIRD_PAGE = '3'
const SMALLER_SIZE = '25'
const BIGGER_SIZE = '50'
const PICKER_ROLE = 'combobox'
const BUTTON_ROLE = 'button'
const NARROW_WINDOW = { width: 600, height: 800 }
// Short enough that Ext's paging toolbar under the results lies below the window's first screen
const SHORT_WINDOW = { width: 1280, height: 400 }
const SCROLLED_TOP = 150
const EXT_NEXT_SELECTOR = '.x-toolbar.x-paging .next-button a.x-btn-button'

function bar(page: Page): ReturnType<Page['locator']> {
  return page.locator(BAR_SELECTOR)
}

// The bar's page picker, focused in the short window
async function focusPagePicker(page: Page): Promise<ReturnType<Page['locator']>> {
  const picker = bar(page).getByRole(PICKER_ROLE, PAGE_PICKER)

  await page.setViewportSize(SHORT_WINDOW)
  await picker.focus()

  return picker
}

// Runs in the page: scrolls the window away from the bar, then Ext shows the next page by its own Next, as when its load
// ends after the user has scrolled
function scrollAndStepInExt(step: { selector: string, top: number }): void {
  window.scrollTo(0, step.top)
  document.querySelector<HTMLElement>(step.selector)?.click()
}

async function expectHiddenInNarrowWindow(page: Page, place: string): Promise<void> {
  await page.setViewportSize(NARROW_WINDOW)

  await expect(page.locator(place)).toHaveCount(1)
  await expect(bar(page)).toBeHidden()
}

test.describe('Top pager on the classic invoice list', () => {
  test('sits above the table and drives Xero\'s pickers', async ({ page }) => {
    await page.goto(CLASSIC_URL)

    await expect(page.locator(CLASSIC_PLACE)).toHaveCount(1)

    await bar(page).getByRole(PICKER_ROLE, PAGE_PICKER).selectOption(SECOND_PAGE)

    await expect(page.locator(PAGE_ROOT_SELECTOR)).toHaveAttribute(NAVIGATED_ATTRIBUTE, 'page 2')

    await bar(page).getByRole(PICKER_ROLE, SIZE_PICKER).selectOption(BIGGER_SIZE)

    await expect(page.locator(PAGE_ROOT_SELECTOR)).toHaveAttribute(NAVIGATED_ATTRIBUTE, 'size 50')
  })

  test('steps to the next page through Xero\'s page picker', async ({ page }) => {
    await page.goto(CLASSIC_URL)
    await bar(page).getByRole(BUTTON_ROLE, NEXT_BUTTON).click()

    await expect(page.locator(PAGE_ROOT_SELECTOR)).toHaveAttribute(NAVIGATED_ATTRIBUTE, 'page 2')
  })

  test('stays away while its switch is off', async ({ page }) => {
    await openWithSwitchOff(page, FEATURE_SWITCH_LABEL, CLASSIC_URL)

    await expect(bar(page)).toHaveCount(0)
  })
})

test.describe('Top pager on Find and recode', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(installExtStub)
    await page.goto(RECODE_URL)
  })

  test('sits in the results toolbar and picks in Ext\'s combos unseen', async ({ page }) => {
    await expect(page.locator(RECODE_PLACE)).toHaveCount(1)

    await bar(page).getByRole(PICKER_ROLE, PAGE_PICKER).selectOption(SECOND_PAGE)

    await expect(page.locator(PAGE_ROOT_SELECTOR)).toHaveAttribute(PERFORMED_ATTRIBUTE, 'page 2')
    await expect(bar(page).getByRole(PICKER_ROLE, PAGE_PICKER)).toHaveValue('2')
    await expect(bar(page).getByRole(BUTTON_ROLE, NEXT_BUTTON)).toBeDisabled()
    await expect(page.locator(PICKING_SELECTOR)).toHaveCount(0)
  })

  test('hides itself in a narrow window, where it would cover Ext\'s toolbar', async ({ page }) => {
    await expectHiddenInNarrowWindow(page, RECODE_PLACE)
  })

  test('leaves the window at the top and the focus on its picker after a pick', async ({ page }) => {
    const picker = await focusPagePicker(page)

    await picker.selectOption(SECOND_PAGE)

    await expect(page.locator(PAGE_ROOT_SELECTOR)).toHaveAttribute(PERFORMED_ATTRIBUTE, 'page 2')
    expect(await page.evaluate(() => window.scrollY)).toBe(0)
    await expect(picker).toBeFocused()
  })

  test('keeps the focus on its picker without moving the window when Ext shows another page', async ({ page }) => {
    const picker = await focusPagePicker(page)

    await page.evaluate(scrollAndStepInExt, { selector: EXT_NEXT_SELECTOR, top: SCROLLED_TOP })

    await expect(page.locator(PAGE_ROOT_SELECTOR)).toHaveAttribute(PERFORMED_ATTRIBUTE, 'next')
    await expect(picker).toBeFocused()
    expect(await page.evaluate(() => window.scrollY)).toBe(SCROLLED_TOP)
  })

  test('clicks Ext\'s own Next and picks the size', async ({ page }) => {
    await bar(page).getByRole(BUTTON_ROLE, NEXT_BUTTON).click()
    await bar(page).getByRole(PICKER_ROLE, SIZE_PICKER).selectOption(SMALLER_SIZE)

    await expect(page.locator(PAGE_ROOT_SELECTOR)).toHaveAttribute(PERFORMED_ATTRIBUTE, 'next size 25')
  })
})

test.describe('Top pager on the Bills list', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(installBillsStub)
    await page.goto(BILLS_URL)
  })

  test('sits in the row above the table and comes back after React redraws it', async ({ page }) => {
    await expect(page.locator(BILLS_PLACE)).toHaveCount(1)

    await bar(page).getByRole(PICKER_ROLE, PAGE_PICKER).selectOption(THIRD_PAGE)

    await expect(page.locator(PAGE_ROOT_SELECTOR)).toHaveAttribute(PERFORMED_ATTRIBUTE, 'page 3')
    await expect(page.locator(BILLS_PLACE)).toHaveCount(1)
    await expect(bar(page).getByRole(PICKER_ROLE, PAGE_PICKER)).toHaveValue('3')
  })

  test('hides itself in a narrow window, where it would cover the count', async ({ page }) => {
    await expectHiddenInNarrowWindow(page, BILLS_PLACE)
  })

  test('picks the size and steps with Xero\'s arrows', async ({ page }) => {
    await bar(page).getByRole(PICKER_ROLE, SIZE_PICKER).selectOption(SMALLER_SIZE)
    await bar(page).getByRole(BUTTON_ROLE, NEXT_BUTTON).click()
    await bar(page).getByRole(BUTTON_ROLE, PREVIOUS_BUTTON).click()

    await expect(page.locator(PAGE_ROOT_SELECTOR)).toHaveAttribute(PERFORMED_ATTRIBUTE, 'size 25 next previous')
  })
})
