// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { activateApproveDefault } from '../../../../src/features/approve-default'
import { APPROVE_ACTIONS } from '../../../../src/settings/schema'
import type { ApproveAction } from '../../../../src/settings/schema'
import { installXuiStub } from '../../../e2e/xui-stub'
import { loadEditorFixture } from '../../helpers/fixture'

const PRIMARY_SELECTOR = '#ApproveAndEmailButton-approve-and-email'
const NOTICE_SELECTOR = '.bt-notice'
const DOT_SELECTOR = '.bt-approve-dot'
const APPROVE: ApproveAction = 'approve'
const DRAFT_ONLY: ApproveAction = 'approve-and-view-next'
const SUBMITTED_INVOICE_ACTIONS = APPROVE_ACTIONS.filter((action) => action !== DRAFT_ONLY)
const OPTION_TIMEOUT_MS = 1000
let deactivate = (): void => {}
let removeStub = (): void => {}

function primaryText(): string | null | undefined {
  return document.querySelector(PRIMARY_SELECTOR)?.textContent
}

beforeEach(async () => {
  vi.useFakeTimers()
  await loadEditorFixture()
})

afterEach(() => {
  deactivate()
  removeStub()
  vi.useRealTimers()
})

describe('activateApproveDefault', () => {
  it('relabels the Approve button', () => {
    removeStub = installXuiStub(APPROVE_ACTIONS)
    deactivate = activateApproveDefault(document.body, APPROVE)

    expect(primaryText()).toBe('Approve')
  })

  it('gives the button back to Xero and says so when the menu lacks the action', async () => {
    removeStub = installXuiStub(SUBMITTED_INVOICE_ACTIONS)
    deactivate = activateApproveDefault(document.body, DRAFT_ONLY)

    document.querySelector<HTMLElement>(PRIMARY_SELECTOR)?.click()
    await vi.advanceTimersByTimeAsync(OPTION_TIMEOUT_MS)

    expect(primaryText()).toBe('Approve & email')
    expect(document.querySelector(NOTICE_SELECTOR)?.textContent).toBe("Could not pick 'Approve & view next' — Xero's menu changed; the button is back to Approve & email.")
  })

  it('restores Xero\'s button when deactivated', () => {
    removeStub = installXuiStub(APPROVE_ACTIONS)
    activateApproveDefault(document.body, APPROVE)()

    expect(primaryText()).toBe('Approve & email')
    expect(document.querySelector(DOT_SELECTOR)).toBeNull()
  })

  it('removes its notice when deactivated', async () => {
    const stop = activateApproveDefault(document.body, DRAFT_ONLY)

    removeStub = installXuiStub(SUBMITTED_INVOICE_ACTIONS)
    document.querySelector<HTMLElement>(PRIMARY_SELECTOR)?.click()
    await vi.advanceTimersByTimeAsync(OPTION_TIMEOUT_MS)
    stop()

    expect(document.querySelector(NOTICE_SELECTOR)).toBeNull()
  })
})
