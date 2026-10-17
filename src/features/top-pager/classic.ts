import type { PagerActions } from './bar'
import { prependTo } from './dom'
import type { PagerAdapter } from './keeper'
import type { PagerState } from './state'
import { neighbourPage } from './state'

// Xero's classic invoice list (/AccountsReceivable/Search.aspx), as read on the demo company: the pager under the
// table, whose two pickers load the page their change handler builds, and the strip above the table
const PAGER_SELECTOR = 'div.bridge-lower div.paginate'
const PAGE_PICKER_SELECTOR = `${PAGER_SELECTOR} #mainPagerGoToDropDown`
const SIZE_PICKER_SELECTOR = `${PAGER_SELECTOR} #mainPagerItemPerPageDropDown`
const PLACE_SELECTOR = 'div.bridge-lower div.action-bar'
const CHANGE_EVENT = 'change'
const PREVIOUS_PAGE = -1
const NEXT_PAGE = 1

function pickerAt(root: ParentNode, selector: string): HTMLSelectElement | null {
  return root.querySelector<HTMLSelectElement>(selector)
}

function numbersOf(picker: HTMLSelectElement): number[] {
  return [...picker.options].map((option) => Number(option.value))
}

// The classic pager as it is; null when either of its pickers is missing
export function readClassicState(root: ParentNode): PagerState | null {
  const pagePicker = pickerAt(root, PAGE_PICKER_SELECTOR)
  const sizePicker = pickerAt(root, SIZE_PICKER_SELECTOR)

  if (!pagePicker || !sizePicker) {
    return null
  }

  return {
    page: Number(pagePicker.value),
    pages: pagePicker.options.length,
    pageSize: Number(sizePicker.value),
    pageSizes: numbersOf(sizePicker),
    canPickPage: true,
  }
}

// Sets one of Xero's pickers and tells its change handler, which then loads the page Xero builds from the choice
function choose(picker: HTMLSelectElement | null, value: number): void {
  if (!picker) {
    return
  }

  picker.value = String(value)
  picker.dispatchEvent(new Event(CHANGE_EVENT, { bubbles: true }))
}

// Every control of the bar goes through Xero's two pickers: Prev and Next pick the page before or after
export function classicActions(root: ParentNode): PagerActions {
  const goToPage = (page: number): void => {
    choose(pickerAt(root, PAGE_PICKER_SELECTOR), page)
  }
  const stepBy = (delta: number): void => {
    const page = neighbourPage(readClassicState(root), delta)

    if (page === null) {
      return
    }

    goToPage(page)
  }

  return {
    goToPage,
    setPageSize: (size) => {
      choose(pickerAt(root, SIZE_PICKER_SELECTOR), size)
    },
    previous: () => {
      stepBy(PREVIOUS_PAGE)
    },
    next: () => {
      stepBy(NEXT_PAGE)
    },
  }
}

// The classic invoice list: the bar opens the strip above the table, at its left
export function classicAdapter(root: ParentNode): PagerAdapter {
  return {
    look: 'classic',
    readState: () => readClassicState(root),
    place: (bar) => prependTo(root.querySelector(PLACE_SELECTOR), bar),
    actions: classicActions(root),
  }
}
