import { pickHidden } from '../../shared/hidden-picker'
import type { ApproveAction } from '../../settings/schema'
import { actionOfButton, relabelFor } from './decide'
import { GROUP_SELECTOR, OPEN_MENU_SELECTOR, OPTION_SELECTOR_PREFIX, PRIMARY_SELECTOR, TRIGGER_SELECTOR } from './selectors'

export interface ClickTakeover {
  chosen: ApproveAction
  // Called with the group whose menu lacked the chosen action; the takeover then swallows clicks for a cooldown and
  // ends, so the next click is Xero's own
  onMissing: (group: Element) => void
}

const CLICK_EVENT = 'click'
const CAPTURE = true
const COOLDOWN_MS = 1500

function isMenuOpen(): boolean {
  return document.querySelector(OPEN_MENU_SELECTOR) !== null
}

// The group of the relabelled primary button a click landed on, or null for any other click
function takenOverGroup(event: Event, chosen: ApproveAction): Element | null {
  const primary = event.target instanceof Element ? event.target.closest(PRIMARY_SELECTOR) : null
  const relabelled = primary !== null && relabelFor(actionOfButton(primary.id), chosen) !== null

  return relabelled ? primary.closest(GROUP_SELECTOR) : null
}

function swallow(event: Event): void {
  event.preventDefault()
  event.stopImmediatePropagation()
}

async function pickChosen(group: Element, chosen: ApproveAction, signal: AbortSignal): Promise<boolean> {
  const trigger = group.querySelector<HTMLElement>(TRIGGER_SELECTOR)

  if (!trigger) {
    return false
  }

  return pickHidden({ trigger, optionSelector: OPTION_SELECTOR_PREFIX + chosen, isOpen: isMenuOpen, signal })
}

// Takes over clicks on relabelled Approve buttons before Xero sees them: each one picks the chosen action from Xero's
// own menu, opened with its list hidden; clicks that come while a pick runs are swallowed. The returned function
// stops, aborting a pick that is still waiting
export function takeOverApproveClicks(takeover: ClickTakeover): () => void {
  const controller = new AbortController()
  let busy = false
  const stop = (): void => {
    controller.abort()
    document.removeEventListener(CLICK_EVENT, onClick, CAPTURE)
  }
  const pick = async (group: Element): Promise<void> => {
    busy = true

    const picked = await pickChosen(group, takeover.chosen, controller.signal)

    if (picked || controller.signal.aborted) {
      busy = false

      return
    }

    takeover.onMissing(group)
    setTimeout(stop, COOLDOWN_MS)
  }
  const onClick = (event: Event): void => {
    const group = takenOverGroup(event, takeover.chosen)

    if (!group) {
      return
    }

    swallow(event)

    if (busy) {
      return
    }

    void pick(group)
  }

  document.addEventListener(CLICK_EVENT, onClick, CAPTURE)

  return stop
}
