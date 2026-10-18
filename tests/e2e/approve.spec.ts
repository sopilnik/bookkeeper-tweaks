import type { Page } from '@playwright/test'
import { APPROVE_ACTIONS } from '../../src/settings/schema'
import { EXTENSION_ID, expect, test } from './extension'
import { installXuiStub } from './xui-stub'

const SETTINGS_URL = `chrome-extension://${EXTENSION_ID}/settings.html`
const EDITOR_URL = 'https://go.xero.com/app/!demo0/invoicing/edit/00000000-0000-0000-0000-000000000000'
const EDITOR_PATH = '/app/!demo0/invoicing/edit/00000000-0000-0000-0000-000000000000'
const OTHER_PATH = '/app/!demo0/sales/overview'
const PRIMARY_SELECTOR = '#ApproveAndEmailButton-approve-and-email'
const DOT_SELECTOR = '.bt-approve-dot'
const NOTICE_SELECTOR = '.bt-notice'
const PERFORMED_ATTRIBUTE = 'data-bt-performed'
const TITLE_ATTRIBUTE = 'title'
const PAGE_ROOT_SELECTOR = 'html'
const VISIBLE_MARK_SELECTOR = '.bt-saved:not([hidden])'
const DRAFT_ONLY = 'approve-and-view-next'
const FEATURE_SWITCH_LABEL = 'Approve default'
const DRAFT_ONLY_LABEL = 'Approve & view next'
const PRINT_PDF_LABEL = 'Approve & print PDF'
const SUBMITTED_ACTIONS = APPROVE_ACTIONS.filter((action) => action !== DRAFT_ONLY)
// The takeover steps aside 1.5 s after the notice; wait a little longer
const AFTER_COOLDOWN_MS = 2000
// Xero's page header as read on the demo company: the Approve group passes white-space: nowrap on to what it holds,
// and every box is sized border-box
const XERO_HEADER_STYLE = '.ApproveAndEmailButton { white-space: nowrap } *, *::before, *::after { box-sizing: border-box }'

async function openEditor(page: Page, actions: readonly string[]): Promise<void> {
  await page.addInitScript(installXuiStub, actions)
  await page.goto(EDITOR_URL)
}

async function changeSetting(page: Page, label: string): Promise<void> {
  await page.goto(SETTINGS_URL)
  await page.getByLabel(label).click()
  await expect(page.locator(VISIBLE_MARK_SELECTOR)).toHaveText('Saved')
}

// Chooses an action a submitted invoice's menu lacks and clicks Approve on one, so the click ends in the notice
async function clickWithoutTheAction(page: Page): Promise<void> {
  await changeSetting(page, DRAFT_ONLY_LABEL)
  await openEditor(page, SUBMITTED_ACTIONS)
  await page.locator(PRIMARY_SELECTOR).click()
}

// How far an element's content runs past its box, in pixels; runs in the page
function overflowOf(element: Element): number {
  return element.scrollWidth - element.clientWidth
}

// Moves the page to another route the way the new app does: the path changes, then the page. Runs in the page, so its
// constant lives inside it
function followRoute(path: string): void {
  const CHANGE_TAG = 'main'

  history.pushState(null, '', path)
  document.body.append(document.createElement(CHANGE_TAG))
}

test.describe('Approve default', () => {
  test('relabels the button and approves without emailing', async ({ page }) => {
    await openEditor(page, APPROVE_ACTIONS)

    await expect(page.locator(PRIMARY_SELECTOR)).toHaveText('Approve')
    await expect(page.locator(DOT_SELECTOR)).toHaveAttribute(TITLE_ATTRIBUTE, 'Set by Bookkeeper Tweaks')

    await page.locator(PRIMARY_SELECTOR).click()

    await expect(page.locator(PAGE_ROOT_SELECTOR)).toHaveAttribute(PERFORMED_ATTRIBUTE, 'approve')
  })

  test('gives the button back to Xero when its menu lacks the action', async ({ page }) => {
    await clickWithoutTheAction(page)

    await expect(page.locator(NOTICE_SELECTOR)).toContainText("Could not pick 'Approve & view next'")
    await expect(page.locator(PRIMARY_SELECTOR)).toHaveText('Approve & email')

    await page.waitForTimeout(AFTER_COOLDOWN_MS)
    await page.locator(PRIMARY_SELECTOR).click()

    await expect(page.locator(PAGE_ROOT_SELECTOR)).toHaveAttribute(PERFORMED_ATTRIBUTE, 'approve-and-email')
  })

  test("keeps the notice's text inside its box under Xero's header", async ({ page }) => {
    await clickWithoutTheAction(page)
    await page.addStyleTag({ content: XERO_HEADER_STYLE })

    expect(await page.locator(NOTICE_SELECTOR).evaluate(overflowOf)).toBe(0)
  })

  test('steps aside when the user leaves the invoice', async ({ page }) => {
    await openEditor(page, APPROVE_ACTIONS)

    await expect(page.locator(PRIMARY_SELECTOR)).toHaveText('Approve')

    await page.evaluate(followRoute, OTHER_PATH)

    await expect(page.locator(PRIMARY_SELECTOR)).toHaveText('Approve & email')
    await expect(page.locator(DOT_SELECTOR)).toHaveCount(0)
  })

  test('follows its switch in the settings', async ({ page }) => {
    await openEditor(page, APPROVE_ACTIONS)

    await expect(page.locator(PRIMARY_SELECTOR)).toHaveText('Approve')

    await changeSetting(page, FEATURE_SWITCH_LABEL)
    await page.goto(EDITOR_URL)

    await expect(page.locator(PRIMARY_SELECTOR)).toHaveText('Approve & email')

    await page.locator(PRIMARY_SELECTOR).click()

    await expect(page.locator(PAGE_ROOT_SELECTOR)).toHaveAttribute(PERFORMED_ATTRIBUTE, 'approve-and-email')
    await expect(page.locator(DOT_SELECTOR)).toHaveCount(0)
  })

  test('takes a settings change to the next page without a reload', async ({ page, context }) => {
    const settings = await context.newPage()

    await openEditor(page, APPROVE_ACTIONS)

    await expect(page.locator(PRIMARY_SELECTOR)).toHaveText('Approve')

    await changeSetting(settings, PRINT_PDF_LABEL)
    await settings.close()
    await page.evaluate(followRoute, OTHER_PATH)
    await page.evaluate(followRoute, EDITOR_PATH)

    await expect(page.locator(PRIMARY_SELECTOR)).toHaveText('Approve & print PDF')
  })
})
