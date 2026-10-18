import type { Page } from '@playwright/test'
import { expect, test } from './extension'
import { openWithSwitchOff } from './settings-switch'

const VIEW_URL = 'https://go.xero.com/app/!demo0/invoicing/view/00000000-0000-0000-0000-000000000000'
const PDF_ROUTE = 'https://go.xero.com/api/invoicing/invoice/00000000-0000-0000-0000-000000000000/pdf'
const SESSION_TEXT = JSON.stringify({ access_token: 'e2e-token' })
const PDF_ANSWER = { status: 200, contentType: 'application/pdf', body: '%PDF-1.4\n%%EOF\n' }
const REFUSED_ANSWER = { status: 401, body: '' }
const PLACE_SELECTOR = '.PageHeaderActions > .bt-print + .PrintDropdown-group'
const CONTROL_SELECTOR = '.bt-print'
const PDF_FRAME_SELECTOR = 'iframe[src^="blob:"]'
const NOTE_SELECTOR = '.bt-print__note'
const NOTICE_SELECTOR = '.bt-notice'
const PRINT_BUTTON = { name: 'Print', exact: true }
const BUTTON_ROLE = 'button'
const FEATURE_SWITCH_LABEL = 'Direct print'

// Runs in the page before Xero's code would: the session the new app keeps, with a token of the test's own
function storeSession(session: string): void {
  const SESSION_KEY = 'oidc.user:https://identity.xero.com:xero_business_go'

  sessionStorage.setItem(SESSION_KEY, session)
}

// Opens the invoice with a session in place; Xero's PDF answers as given
async function openInvoice(page: Page, answer: object): Promise<void> {
  await page.route(PDF_ROUTE, (route) => route.fulfill(answer))
  await page.addInitScript(storeSession, SESSION_TEXT)
  await page.goto(VIEW_URL)
}

test.describe('Direct print', () => {
  test('puts its Print button right before Xero\'s print group', async ({ page }) => {
    await openInvoice(page, PDF_ANSWER)

    await expect(page.locator(PLACE_SELECTOR)).toHaveCount(1)
  })

  test('asks for the PDF the way Xero does and prints it in a hidden frame', async ({ page }) => {
    await openInvoice(page, PDF_ANSWER)

    const asked = page.waitForRequest(PDF_ROUTE)

    await page.getByRole(BUTTON_ROLE, PRINT_BUTTON).click()

    const headers = (await asked).headers()

    expect(headers.authorization).toBe('Bearer e2e-token')
    expect(headers['xero-tenant-shortcode']).toBe('!demo0')
    expect(headers['x-client']).toBe('xero-secure-fetch')
    expect(headers['xero-shell-app-name']).toBe('Invoicing')

    await expect(page.locator(PDF_FRAME_SELECTOR)).toHaveCount(1)
    await expect(page.locator(NOTE_SELECTOR)).toHaveText('No print dialog? Open PDF')
  })

  test('says so when Xero refuses the PDF', async ({ page }) => {
    await openInvoice(page, REFUSED_ANSWER)
    await page.getByRole(BUTTON_ROLE, PRINT_BUTTON).click()

    await expect(page.locator(NOTICE_SELECTOR)).toHaveText('Could not load the PDF — use Print PDF.')
    await expect(page.locator(PDF_FRAME_SELECTOR)).toHaveCount(0)
  })

  test('stays away while its switch is off', async ({ page }) => {
    await openWithSwitchOff(page, FEATURE_SWITCH_LABEL, VIEW_URL)

    await expect(page.locator(CONTROL_SELECTOR)).toHaveCount(0)
  })
})
