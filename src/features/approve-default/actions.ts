import type { ApproveAction } from '../../settings/schema'

export interface ActionLook {
  label: string
  // The keyboard shortcut Xero shows in the button's tooltip; '' when the action has none
  shortcut: string
}

// Xero's labels and shortcuts for the six actions, as read on the demo company
export const ACTION_LOOKS: Record<ApproveAction, ActionLook> = {
  'approve': { label: 'Approve', shortcut: 'Ctrl-Alt-A' },
  'approve-and-email': { label: 'Approve & email', shortcut: 'Ctrl-Alt-E' },
  'approve-and-add-another': { label: 'Approve & add another', shortcut: 'Ctrl-Alt-O' },
  'approve-and-view-next': { label: 'Approve & view next', shortcut: '' },
  'approve-and-get-link': { label: 'Approve & get link', shortcut: '' },
  'approve-and-print-pdf': { label: 'Approve & print PDF', shortcut: 'Ctrl-Alt-R' },
}
