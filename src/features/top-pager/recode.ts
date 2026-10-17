import type { HiddenPick } from '../../shared/hidden-picker'
import type { PagerActions } from './bar'
import { appendTo, clickAt, pickUnseen } from './dom'
import type { PagerAdapter } from './keeper'
import type { PagerState } from './state'
import { firstNumber, parsePageOf } from './state'

// Find and recode (/Accounts/Recoding/Recode), as read on the demo company: the paging toolbar Ext docks under the
// results, with its two combos — whose lists Ext renders in <body>, with the combo's id plus "-boundlist" — and the
// results toolbar above the grid. Ext's ids are generated, so the elements are found by their classes
const PANEL_SELECTOR = '.x-panel.results-panel'
const PAGING_SELECTOR = `${PANEL_SELECTOR} .x-toolbar.x-paging`
const PAGE_COMBO_SELECTOR = `${PAGING_SELECTOR} table.page-number`
const SIZE_COMBO_SELECTOR = `${PAGING_SELECTOR} table.list-size`
const INPUT_SELECTOR = 'input'
const TRIGGER_SELECTOR = '.x-form-trigger'
const PREVIOUS_SELECTOR = `${PAGING_SELECTOR} .x-btn.back-button a.x-btn-button`
const NEXT_SELECTOR = `${PAGING_SELECTOR} .x-btn.next-button a.x-btn-button`
const PLACE_SELECTOR = `${PANEL_SELECTOR} .x-toolbar.results-toolbar`
const LIST_ID = (comboId: string): string => `${comboId}-boundlist`
const ITEM_SELECTOR = (comboId: string, position: number): string => `#${LIST_ID(comboId)} li.x-boundlist-item:nth-child(${position})`
// Ext hides a list either by its display or by one of these classes
const HIDDEN_DISPLAY = 'none'
const HIDDEN_CLASSES = ['x-hide-display', 'x-hide-offsets', 'x-hide-visibility']
// The sizes the results offer, in the order of their list (read on the demo company; Ext builds the list on opening)
const PAGE_SIZES = [10, 25, 50, 100, 200]
const FIRST_POSITION = 1

function inputText(root: ParentNode, comboSelector: string): string {
  return root.querySelector<HTMLInputElement>(`${comboSelector} ${INPUT_SELECTOR}`)?.value ?? ''
}

// The recode pager as it is: "Page 1 of 2" and "100 items per page" in its combos; null when either is missing
export function readRecodeState(root: ParentNode): PagerState | null {
  const position = parsePageOf(inputText(root, PAGE_COMBO_SELECTOR))
  const pageSize = firstNumber(inputText(root, SIZE_COMBO_SELECTOR))

  if (!position || pageSize === null) {
    return null
  }

  return { ...position, pageSize, pageSizes: PAGE_SIZES, canPickPage: true }
}

export function isListShown(comboId: string): boolean {
  const list = document.getElementById(LIST_ID(comboId))

  return list !== null && list.style.display !== HIDDEN_DISPLAY && !HIDDEN_CLASSES.some((name) => list.classList.contains(name))
}

// The pick of the item at the position in the combo's list; null without the combo or its trigger
function comboPick(combo: HTMLElement | null, position: number, signal: AbortSignal): HiddenPick | null {
  const trigger = combo?.querySelector<HTMLElement>(TRIGGER_SELECTOR)

  if (!combo || !trigger) {
    return null
  }

  return { trigger, optionSelector: ITEM_SELECTOR(combo.id, position), isOpen: () => isListShown(combo.id), signal }
}

// The bar's pickers choose in Ext's combos; Prev and Next click Ext's own buttons
export function recodeActions(root: ParentNode, signal: AbortSignal): PagerActions {
  return {
    goToPage: (page) => {
      pickUnseen(comboPick(root.querySelector(PAGE_COMBO_SELECTOR), page, signal))
    },
    setPageSize: (size) => {
      pickUnseen(comboPick(root.querySelector(SIZE_COMBO_SELECTOR), PAGE_SIZES.indexOf(size) + FIRST_POSITION, signal))
    },
    previous: () => {
      clickAt(root, PREVIOUS_SELECTOR)
    },
    next: () => {
      clickAt(root, NEXT_SELECTOR)
    },
  }
}

// Find and recode: the bar sits at the right of the results toolbar, which Ext positions itself, so the bar takes no
// room in Ext's layout (a block put between Ext's panels is moved by Ext's next layout)
export function recodeAdapter(root: ParentNode, signal: AbortSignal): PagerAdapter {
  return {
    look: 'ext',
    readState: () => readRecodeState(root),
    place: (bar) => appendTo(root.querySelector(PLACE_SELECTOR), bar),
    actions: recodeActions(root, signal),
  }
}
