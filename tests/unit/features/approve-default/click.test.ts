// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { takeOverApproveClicks } from '../../../../src/features/approve-default/click'
import { APPROVE_ACTIONS } from '../../../../src/settings/schema'
import type { ApproveAction } from '../../../../src/settings/schema'
import { installXuiStub } from '../../../e2e/xui-stub'
import { loadEditorFixture } from '../../helpers/fixture'

const PRIMARY_SELECTOR = '#ApproveAndEmailButton-approve-and-email'
const APPROVE: ApproveAction = 'approve'
const XERO_ACTION: ApproveAction = 'approve-and-email'
const DRAFT_ONLY: ApproveAction = 'approve-and-view-next'
const SUBMITTED_INVOICE_ACTIONS = APPROVE_ACTIONS.filter((action) => action !== DRAFT_ONLY)
const OPTION_TIMEOUT_MS = 1000
const COOLDOWN_MS = 1500
const SEPARATOR = ' '
let stop = (): void => {}
let removeStub = (): void => {}

function clickPrimary(): void {
  document.querySelector<HTMLElement>(PRIMARY_SELECTOR)?.click()
}

function performed(): string[] {
  return (document.documentElement.dataset.btPerformed ?? '').split(SEPARATOR).filter(Boolean)
}

beforeEach(async () => {
  vi.useFakeTimers()
  await loadEditorFixture()
  delete document.documentElement.dataset.btPerformed
})

afterEach(() => {
  stop()
  removeStub()
  vi.useRealTimers()
})

describe('takeOverApproveClicks', () => {
  it('picks the chosen action instead of Xero\'s own', async () => {
    removeStub = installXuiStub(APPROVE_ACTIONS)
    stop = takeOverApproveClicks({ chosen: APPROVE, onMissing: vi.fn() })

    clickPrimary()
    await vi.runAllTimersAsync()

    expect(performed()).toEqual(['approve'])
  })

  it('swallows a second click while it picks', async () => {
    removeStub = installXuiStub(APPROVE_ACTIONS)
    stop = takeOverApproveClicks({ chosen: APPROVE, onMissing: vi.fn() })

    clickPrimary()
    clickPrimary()
    await vi.runAllTimersAsync()

    expect(performed()).toEqual(['approve'])
  })

  it('lets a button that already does the chosen action work as Xero\'s', async () => {
    removeStub = installXuiStub(APPROVE_ACTIONS)
    stop = takeOverApproveClicks({ chosen: XERO_ACTION, onMissing: vi.fn() })

    clickPrimary()
    await vi.runAllTimersAsync()

    expect(performed()).toEqual(['approve-and-email'])
  })

  it('reports a missing option, swallows clicks for the cooldown, then steps aside', async () => {
    const onMissing = vi.fn()

    removeStub = installXuiStub(SUBMITTED_INVOICE_ACTIONS)
    stop = takeOverApproveClicks({ chosen: DRAFT_ONLY, onMissing })

    clickPrimary()
    await vi.advanceTimersByTimeAsync(OPTION_TIMEOUT_MS)

    expect(onMissing).toHaveBeenCalledOnce()

    clickPrimary()
    await vi.advanceTimersByTimeAsync(COOLDOWN_MS)

    expect(performed()).toEqual([])

    clickPrimary()

    expect(performed()).toEqual(['approve-and-email'])
  })

  it('steps aside at once when stopped', () => {
    removeStub = installXuiStub(APPROVE_ACTIONS)
    takeOverApproveClicks({ chosen: APPROVE, onMissing: vi.fn() })()

    clickPrimary()

    expect(performed()).toEqual(['approve-and-email'])
  })

  it('aborts a waiting pick when stopped and reports nothing', async () => {
    const onMissing = vi.fn()

    removeStub = installXuiStub(SUBMITTED_INVOICE_ACTIONS)
    stop = takeOverApproveClicks({ chosen: DRAFT_ONLY, onMissing })

    clickPrimary()
    stop()
    await vi.runAllTimersAsync()

    expect(onMissing).not.toHaveBeenCalled()
  })
})
