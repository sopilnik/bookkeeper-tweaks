import { waitForElement } from './wait-for-element'

export interface HiddenPick {
  trigger: HTMLElement
  optionSelector: string
  isOpen: () => boolean
  signal: AbortSignal
}

// The class that hides Xero's open lists (see hidden-picker.css)
const PICKING_CLASS = 'bt-picking'
const OPTION_TIMEOUT_MS = 1000
const OPTION_BODY_SELECTOR = 'button'

function setListsHidden(hidden: boolean): void {
  document.documentElement.classList.toggle(PICKING_CLASS, hidden)
}

function openUnlessOpen(pick: HiddenPick, wasOpen: boolean): void {
  if (wasOpen) {
    return
  }

  pick.trigger.click()
}

function closeIfOpenedHere(pick: HiddenPick, wasOpen: boolean): void {
  if (wasOpen || !pick.isOpen()) {
    return
  }

  pick.trigger.click()
}

function findOptionBody(option: Element): HTMLElement | null {
  const body = option.querySelector<HTMLElement>(OPTION_BODY_SELECTOR) ?? option

  return body instanceof HTMLElement ? body : null
}

// Opens a Xero picker with its list hidden and clicks the option the selector names; gives false when the option does
// not appear within a second or the pick is aborted, and then closes the list again if this call opened it
export async function pickHidden(pick: HiddenPick): Promise<boolean> {
  const wasOpen = pick.isOpen()

  setListsHidden(true)
  openUnlessOpen(pick, wasOpen)

  const option = await waitForElement(document.body, pick.optionSelector, { timeoutMs: OPTION_TIMEOUT_MS, signal: pick.signal })

  if (!option) {
    closeIfOpenedHere(pick, wasOpen)
    setListsHidden(false)

    return false
  }

  findOptionBody(option)?.click()
  setListsHidden(false)

  return true
}
