import { waitForElement } from './wait-for-element'

export interface HiddenPick {
  trigger: HTMLElement
  optionSelector: string
  isOpen: () => boolean
  signal: AbortSignal
}

// Where the user was when a pick began: the element with the focus and the window's scroll position
interface View {
  focused: Element | null
  left: number
  top: number
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

function rememberView(): View {
  return { focused: document.activeElement, left: window.scrollX, top: window.scrollY }
}

// Puts the focus and the window back where the pick found them: a picker may focus its own field, and the browser
// scrolls that field into view
function restoreView(view: View): void {
  if (view.focused instanceof HTMLElement) {
    view.focused.focus({ preventScroll: true })
  }

  window.scrollTo(view.left, view.top)
}

function findOptionBody(option: Element): HTMLElement | null {
  const body = option.querySelector<HTMLElement>(OPTION_BODY_SELECTOR) ?? option

  return body instanceof HTMLElement ? body : null
}

// Opens a Xero picker with its list hidden and clicks the option the selector names; gives false when the option does
// not appear within a second, has nothing to click or the pick is aborted, and then closes the list again if this call
// opened it. Either way the focus and the window end where they were
export async function pickHidden(pick: HiddenPick): Promise<boolean> {
  const wasOpen = pick.isOpen()
  const view = rememberView()

  setListsHidden(true)
  openUnlessOpen(pick, wasOpen)

  const option = await waitForElement(document.body, pick.optionSelector, { timeoutMs: OPTION_TIMEOUT_MS, signal: pick.signal })
  const body = option ? findOptionBody(option) : null

  if (!body) {
    closeIfOpenedHere(pick, wasOpen)
    setListsHidden(false)
    restoreView(view)

    return false
  }

  body.click()
  setListsHidden(false)
  restoreView(view)

  return true
}
