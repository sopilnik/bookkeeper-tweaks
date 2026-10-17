import type { HiddenPick } from '../../shared/hidden-picker'
import type { PagerActions } from './bar'
import { appendTo, clickAt, pickUnseen } from './dom'
import type { PagerAdapter } from './keeper'
import type { PagerState } from './state'
import { firstNumber, parsePageOf } from './state'

// The Bills list of the new app (/app/!<org>/bills/list/…), as read on the demo company: the pager React draws under
// the table — an items-per-page select and, from three pages on, a page select, both opening their lists in Xero's
// portal — and the row above the table ("37 items | 8,386.76 USD"), which React draws anew on every page change
const CONTAINER_SELECTOR = '.bills-list-content-container'
const PAGER_SELECTOR = `${CONTAINER_SELECTOR} nav.xui-pagination`
const SIZE_TRIGGER_SELECTOR = `${PAGER_SELECTOR} .xui-pagination--items [role="combobox"]`
const PAGING_SELECTOR = `${PAGER_SELECTOR} .xui-pagination--paging`
const PAGE_BUTTON_SELECTOR = `${PAGING_SELECTOR} .xui-select--button`
const PREVIOUS_SELECTOR = `${PAGING_SELECTOR} button[aria-label="Previous Page"]`
const NEXT_SELECTOR = `${PAGING_SELECTOR} button[aria-label="Next Page"]`
const PLACE_SELECTOR = `${CONTAINER_SELECTOR} > .xui-padding-xsmall:not(.xui-panel--section) > .xui-u-flex-justify-end`
const PAGE_LIST_SELECTOR = '.xui-dropdown-layout .xui-picklist'
const PAGE_OPTION_SELECTOR = (page: number): string => `${PAGE_LIST_SELECTOR} [role="option"]:nth-child(${page})`
const SIZE_OPTION_SELECTOR = (size: number): string => `.xui-single-select__flyout [role="option"][id="${size}"]`
const EXPANDED_ATTRIBUTE = 'aria-expanded'
const EXPANDED = 'true'
// The sizes the list offers (read on the demo company; the list exists only while it is open)
const PAGE_SIZES = [10, 25, 50, 100, 200]

// The Bills pager as it is: "Page 1 of 4" in its paging part, the size in its select; null when either is missing
// (one page shows no paging part)
export function readBillsState(root: ParentNode): PagerState | null {
  const position = parsePageOf(root.querySelector(PAGING_SELECTOR)?.textContent ?? '')
  const pageSize = firstNumber(root.querySelector(SIZE_TRIGGER_SELECTOR)?.textContent ?? '')

  if (!position || pageSize === null) {
    return null
  }

  return { ...position, pageSize, pageSizes: PAGE_SIZES, canPickPage: root.querySelector(PAGE_BUTTON_SELECTOR) !== null }
}

function isPageListOpen(): boolean {
  return document.querySelector(PAGE_LIST_SELECTOR) !== null
}

function isExpanded(trigger: Element): boolean {
  return trigger.getAttribute(EXPANDED_ATTRIBUTE) === EXPANDED
}

// The pick of the page in Xero's page select; null when the list shows no page select
function pagePick(root: ParentNode, page: number, signal: AbortSignal): HiddenPick | null {
  const trigger = root.querySelector<HTMLElement>(PAGE_BUTTON_SELECTOR)

  return trigger ? { trigger, optionSelector: PAGE_OPTION_SELECTOR(page), isOpen: isPageListOpen, signal } : null
}

// The pick of the size in Xero's items-per-page select; null without the select
function sizePick(root: ParentNode, size: number, signal: AbortSignal): HiddenPick | null {
  const trigger = root.querySelector<HTMLElement>(SIZE_TRIGGER_SELECTOR)

  return trigger ? { trigger, optionSelector: SIZE_OPTION_SELECTOR(size), isOpen: () => isExpanded(trigger), signal } : null
}

// The bar's pickers choose in Xero's selects; Prev and Next click Xero's own arrows
export function billsActions(root: ParentNode, signal: AbortSignal): PagerActions {
  return {
    goToPage: (page) => {
      pickUnseen(pagePick(root, page, signal))
    },
    setPageSize: (size) => {
      pickUnseen(sizePick(root, size, signal))
    },
    previous: () => {
      clickAt(root, PREVIOUS_SELECTOR)
    },
    next: () => {
      clickAt(root, NEXT_SELECTOR)
    },
  }
}

// Bills: the bar sits at the left of the row above the table, centred in it without changing its height; React
// drops it with the row on every page change, and the keeper puts it back
export function billsAdapter(root: ParentNode, signal: AbortSignal): PagerAdapter {
  return {
    look: 'xui',
    readState: () => readBillsState(root),
    place: (bar) => appendTo(root.querySelector(PLACE_SELECTOR), bar),
    actions: billsActions(root, signal),
  }
}
