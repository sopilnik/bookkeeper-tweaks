import { isDirection } from './messages'
import type { SortState } from './state'
import { labelOf } from './state'

// The extension's sort button in Find and recode's results toolbar (sheet variant B1, see recode-sort.css): Ext's
// toolbar look with the extension's dot; its label names the order and says that it sorts this page only
export interface SortControl {
  element: HTMLButtonElement
  state: SortState
}

const BUTTON_TAG = 'button'
const BUTTON_TYPE = 'button'
const BUTTON_CLASS = 'bt-sort'
const ACTIVE_CLASS = 'bt-sort--active'
const UNAVAILABLE_CLASS = 'bt-sort--unavailable'
const DOT_TAG = 'span'
const DOT_CLASS = 'bt-sort__dot'
const CLICK_EVENT = 'click'
const START: SortState = 'unsorted'

function dotOf(): HTMLElement {
  const dot = document.createElement(DOT_TAG)

  dot.className = DOT_CLASS

  return dot
}

export function showState(control: SortControl, state: SortState): void {
  control.state = state
  control.element.replaceChildren(labelOf(state), dotOf())
  control.element.classList.toggle(ACTIVE_CLASS, isDirection(state))
  control.element.classList.toggle(UNAVAILABLE_CLASS, state === 'unavailable')
}

export function createSortControl(onClick: () => void): SortControl {
  const element = document.createElement(BUTTON_TAG)
  const control = { element, state: START }

  element.type = BUTTON_TYPE
  element.className = BUTTON_CLASS
  element.addEventListener(CLICK_EVENT, onClick)
  showState(control, START)

  return control
}
