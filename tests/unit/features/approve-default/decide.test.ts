import { describe, expect, it } from 'vitest'
import { ACTION_LOOKS } from '../../../../src/features/approve-default/actions'
import { actionOfButton, missingOptionMessage, relabelFor } from '../../../../src/features/approve-default/decide'
import { APPROVE_ACTIONS } from '../../../../src/settings/schema'
import type { ApproveAction } from '../../../../src/settings/schema'

const XERO_BUTTON_ID = 'ApproveAndEmailButton-approve-and-email'
const APPROVE_BUTTON_ID = 'ApproveAndEmailButton-approve'
const OTHER_IDS = ['SaveAndCloseButton-save-and-close', 'ApproveAndEmailButton-approve-and-archive', '']
const APPROVE: ApproveAction = 'approve'
const XERO_ACTION: ApproveAction = 'approve-and-email'
const VIEW_NEXT: ApproveAction = 'approve-and-view-next'
const XERO_LABEL = 'Approve & email'

describe('actionOfButton', () => {
  it('reads the action from the id of an Approve button', () => {
    expect(actionOfButton(XERO_BUTTON_ID)).toBe('approve-and-email')
    expect(actionOfButton(APPROVE_BUTTON_ID)).toBe('approve')
  })

  it.each(OTHER_IDS)('knows no action for the id "%s"', (id) => {
    expect(actionOfButton(id)).toBeNull()
  })
})

describe('relabelFor', () => {
  it('gives the chosen action\'s label and shortcut', () => {
    expect(relabelFor(XERO_ACTION, APPROVE)).toEqual({ label: 'Approve', shortcut: 'Ctrl-Alt-A' })
  })

  it('gives an empty shortcut to an action that has none', () => {
    expect(relabelFor(XERO_ACTION, VIEW_NEXT)).toEqual({ label: 'Approve & view next', shortcut: '' })
  })

  it('leaves a button that already does the chosen action', () => {
    expect(relabelFor(XERO_ACTION, XERO_ACTION)).toBeNull()
  })

  it('leaves a button whose action is unknown', () => {
    expect(relabelFor(null, APPROVE)).toBeNull()
  })
})

describe('the action table', () => {
  it.each(APPROVE_ACTIONS)('labels %s', (action) => {
    expect(ACTION_LOOKS[action].label).toMatch(/^Approve/)
  })
})

describe('missingOptionMessage', () => {
  it('names the action that could not be picked and the label the button is back to', () => {
    expect(missingOptionMessage(APPROVE, XERO_LABEL)).toBe("Could not pick 'Approve' — Xero's menu changed; the button is back to Approve & email.")
  })
})
