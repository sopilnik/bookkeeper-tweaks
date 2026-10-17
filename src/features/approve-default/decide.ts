import { isApproveAction } from '../../settings/normalize'
import type { ApproveAction } from '../../settings/schema'
import { ACTION_LOOKS } from './actions'
import type { ActionLook } from './actions'

// Xero names each Approve button and option ApproveAndEmailButton-<action>
const BUTTON_ID_PREFIX = 'ApproveAndEmailButton-'
const MISSING_OPTION_MESSAGE = (label: string, xeroLabel: string): string =>
  `Could not pick '${label}' — Xero's menu changed; the button is back to ${xeroLabel}.`

export function actionOfButton(id: string): ApproveAction | null {
  const action = id.slice(BUTTON_ID_PREFIX.length)

  if (!id.startsWith(BUTTON_ID_PREFIX) || !isApproveAction(action)) {
    return null
  }

  return action
}

// What the primary button should show instead of Xero's text; null when the button is to be left as it is — it
// already does the chosen action, or its action is unknown
export function relabelFor(current: ApproveAction | null, chosen: ApproveAction): ActionLook | null {
  if (current === null || current === chosen) {
    return null
  }

  return ACTION_LOOKS[chosen]
}

// The notice shown when Xero's menu lacks the chosen action; xeroLabel is the button's own text again
export function missingOptionMessage(chosen: ApproveAction, xeroLabel: string): string {
  return MISSING_OPTION_MESSAGE(ACTION_LOOKS[chosen].label, xeroLabel)
}
