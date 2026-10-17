import { isApproveAction } from '../../settings/normalize'
import type { ApproveAction } from '../../settings/schema'
import { ACTION_LOOKS } from './actions'
import type { ActionLook } from './actions'

// Xero names each Approve button and option ApproveAndEmailButton-<action>
const BUTTON_ID_PREFIX = 'ApproveAndEmailButton-'

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
