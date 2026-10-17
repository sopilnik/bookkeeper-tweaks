// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { PagerActions } from '../../../../src/features/top-pager/bar'
import type { PagerAdapter } from '../../../../src/features/top-pager/keeper'
import { keepTopPager } from '../../../../src/features/top-pager/keeper'
import type { PagerState } from '../../../../src/features/top-pager/state'
import { queryRequired } from '../../helpers/query'

const FIRST_OF_TWO: PagerState = { page: 1, pages: 2, pageSize: 25, pageSizes: [10, 25], canPickPage: true }
const SECOND_OF_TWO: PagerState = { ...FIRST_OF_TWO, page: 2 }
const ONE_PAGE: PagerState = { ...FIRST_OF_TWO, pages: 1 }
const PLACE_SELECTOR = '#place'
const BAR_SELECTOR = 'nav.bt-pager'
const PAGE_PICKER = 'select[aria-label="Page"]'
const PLACE_HTML = '<div id="place"></div><ul id="rows"></ul>'
const ROW_TAG = 'li'
const QUIET: PagerActions = {
  goToPage: () => {},
  setPageSize: () => {},
  previous: () => {},
  next: () => {},
}
let state: PagerState | null = FIRST_OF_TWO
let stop = (): void => {}

const ADAPTER: PagerAdapter = {
  look: 'xui',
  readState: () => state,
  place: (bar) => {
    const place = document.querySelector(PLACE_SELECTOR)

    place?.append(bar)

    return place !== null
  },
  actions: QUIET,
}

function nextTask(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0)
  })
}

// A change in the list, as Xero makes when it shows another page
async function changeList(next: PagerState | null): Promise<void> {
  state = next
  document.body.append(document.createElement(ROW_TAG))
  await nextTask()
}

function shownPage(): string {
  return queryRequired<HTMLSelectElement>(document, PAGE_PICKER).value
}

beforeEach(() => {
  document.body.innerHTML = PLACE_HTML
  state = FIRST_OF_TWO
})

afterEach(() => {
  stop()
})

describe('keepTopPager', () => {
  it('draws the bar at its place while the list has more than one page', () => {
    stop = keepTopPager(document.body, ADAPTER)

    expect(queryRequired(document, PLACE_SELECTOR).querySelectorAll(BAR_SELECTOR)).toHaveLength(1)
    expect(shownPage()).toBe('1')
  })

  it('draws it again, once, when the pager changes', async () => {
    stop = keepTopPager(document.body, ADAPTER)

    await changeList(SECOND_OF_TWO)

    expect(document.querySelectorAll(BAR_SELECTOR)).toHaveLength(1)
    expect(shownPage()).toBe('2')
  })

  it('keeps the same bar while the pager stays as it is', async () => {
    stop = keepTopPager(document.body, ADAPTER)

    const first = document.querySelector(BAR_SELECTOR)

    await changeList(FIRST_OF_TWO)

    expect(document.querySelector(BAR_SELECTOR)).toBe(first)
  })

  it('puts the bar back when the page drops it', async () => {
    stop = keepTopPager(document.body, ADAPTER)

    queryRequired(document, PLACE_SELECTOR).replaceChildren()
    await nextTask()

    expect(document.querySelectorAll(BAR_SELECTOR)).toHaveLength(1)
  })

  it('removes the bar at one page, without a pager and without a place', async () => {
    stop = keepTopPager(document.body, ADAPTER)

    await changeList(ONE_PAGE)

    expect(document.querySelector(BAR_SELECTOR)).toBeNull()

    await changeList(FIRST_OF_TWO)
    await changeList(null)

    expect(document.querySelector(BAR_SELECTOR)).toBeNull()

    queryRequired(document, PLACE_SELECTOR).remove()
    await changeList(SECOND_OF_TWO)

    expect(document.querySelector(BAR_SELECTOR)).toBeNull()
  })

  it('removes the bar and stops watching when stopped', async () => {
    stop = keepTopPager(document.body, ADAPTER)

    stop()
    await changeList(SECOND_OF_TWO)

    expect(document.querySelector(BAR_SELECTOR)).toBeNull()
  })
})
