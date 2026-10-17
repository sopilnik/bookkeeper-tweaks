// What the extension reads from one of Xero's pagers and draws its top bar from
export interface PagerState {
  page: number
  pages: number
  pageSize: number
  pageSizes: readonly number[]
  // Whether Xero's own pager has a page picker the bar can drive (the Bills list shows none at two pages)
  canPickPage: boolean
}

export interface PagePosition {
  page: number
  pages: number
}

// What the bar does after a change on the page: goes, stays as it is, or is drawn again
export type BarStep = 'remove' | 'keep' | 'draw'

const PAGE_OF = /Page\s+(\d+)\s+of\s+(\d+)/
const FIRST_NUMBER = /\d+/
const FIRST_PAGE = 1

// "Page 2 of 4", with any spacing around the numbers, as the page and the number of pages; null for any other text
export function parsePageOf(text: string): PagePosition | null {
  const match = PAGE_OF.exec(text)

  if (!match) {
    return null
  }

  return { page: Number(match[1]), pages: Number(match[2]) }
}

// The first number in a label such as "100 items per page"; null when the label holds none
export function firstNumber(text: string): number | null {
  const match = FIRST_NUMBER.exec(text)

  return match ? Number(match[0]) : null
}

export function hasPrevious(state: PagerState): boolean {
  return state.page > FIRST_PAGE
}

export function hasNext(state: PagerState): boolean {
  return state.page < state.pages
}

// The page numbers a page picker offers, from the first to the last
export function pageNumbers(pages: number): number[] {
  return Array.from({ length: pages }, (_, index) => index + FIRST_PAGE)
}

// One string per state, to tell whether the bar on the page still shows the pager as it is
export function stateKey(state: PagerState): string {
  return JSON.stringify(state)
}

// The bar goes when Xero's pager is missing or shows one page, stays while it shows the same state and is still on
// the page, and is drawn again otherwise
export function nextBarStep(state: PagerState | null, shownKey: string, onPage: boolean): BarStep {
  if (!state || state.pages <= FIRST_PAGE) {
    return 'remove'
  }

  return onPage && stateKey(state) === shownKey ? 'keep' : 'draw'
}
