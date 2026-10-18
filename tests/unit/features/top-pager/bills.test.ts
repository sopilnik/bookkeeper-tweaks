// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { billsActions, billsAdapter, readBillsState } from '../../../../src/features/top-pager/bills'
import { keepTopPager } from '../../../../src/features/top-pager/keeper'
import { installBillsStub } from '../../../e2e/bills-stub'
import { queryRequired } from '../../helpers/query'
import { loadWithStub, performed } from '../../helpers/stub'

const BILLS_FIXTURE = 'tests/fixtures/app/!demo0/bills/list/all.html'
const PAGING = '.xui-pagination--paging'
const PAGE_BUTTON = '.xui-select--button'
const SIZE_TRIGGER = '[role="combobox"]'
const PLACE = '.xui-u-flex-justify-end'
const BAR = 'nav.bt-pager'
const PAGE_PICKER = 'nav.bt-pager select[aria-label="Page"]'
const TWO_PAGES_TEXT = 'Page 1 of 2'
const BAR_TAG = 'nav'
const CHANGE_EVENT = 'change'
const OPEN_LISTS = '.xui-dropdown-layout, .xui-single-select__flyout'
const PORTAL = '.xui-portal .xui-container'
const OTHER_LIST = '[data-other]'
// Another of Xero's lists open in the portal, as the "New bill" menu of the Bills page is: its options look like the
// page select's and the size select's own
const OTHER_MENU_HTML = '<div data-other class="xui-dropdown-layout"><ul class="xui-picklist" role="listbox">' +
  '<li role="option">Upload bills</li><li role="option">New bill</li><li role="option">New repeating bill</li></ul></div>'
const OTHER_SIZES_HTML = '<div data-other class="xui-single-select__flyout" role="listbox"><div role="option" id="25">25</div></div>'
const AT_END: InsertPosition = 'beforeend'
const CLICK_EVENT = 'click'
const CLICKED = 'true'
const ID_ATTRIBUTE = 'id'
const CONTROLS_ATTRIBUTE = 'aria-controls'
const EXPANDED_ATTRIBUTE = 'aria-expanded'
const SECOND_PAGE_VALUE = '2'
const THIRD_PAGE = 3
const SMALLER_SIZE = 25
let removeStub = (): void => {}
let stop = (): void => {}
let controller = new AbortController()

function nextTask(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0)
  })
}

// Opens another of Xero's lists in the portal; it marks itself when one of its options is clicked
function openOtherList(html: string): HTMLElement {
  const portal = queryRequired(document, PORTAL)

  portal.insertAdjacentHTML(AT_END, html)

  const list = queryRequired<HTMLElement>(portal, OTHER_LIST)

  list.addEventListener(CLICK_EVENT, () => {
    list.dataset.clicked = CLICKED
  })

  return list
}

beforeEach(async () => {
  removeStub = await loadWithStub(BILLS_FIXTURE, installBillsStub)
  controller = new AbortController()
})

afterEach(() => {
  stop()
  removeStub()
  controller.abort()
})

describe('readBillsState', () => {
  it('reads the page and the size out of Xero\'s pager', () => {
    expect(readBillsState(document)).toEqual({ page: 1, pages: 4, pageSize: 10, pageSizes: [10, 25, 50, 100, 200], canPickPage: true })
  })

  it('knows when Xero shows the page without a page select', () => {
    queryRequired(document, PAGE_BUTTON).replaceWith(TWO_PAGES_TEXT)

    expect(readBillsState(document)).toMatchObject({ page: 1, pages: 2, canPickPage: false })
  })

  it('gives null at one page, where Xero shows no paging part', () => {
    queryRequired(document, PAGING).remove()

    expect(readBillsState(document)).toBeNull()
  })
})

describe('billsActions', () => {
  it('picks the page and the size in Xero\'s selects and leaves their lists closed', async () => {
    const actions = billsActions(document, controller.signal)

    actions.goToPage(THIRD_PAGE)
    await nextTask()
    actions.setPageSize(SMALLER_SIZE)
    await nextTask()

    expect(performed()).toBe('page 3 size 25')
    expect(document.querySelector(OPEN_LISTS)).toBeNull()
    expect(queryRequired(document, SIZE_TRIGGER).getAttribute(EXPANDED_ATTRIBUTE)).toBe('false')
  })

  it('picks the page only in the page select\'s own list while another of Xero\'s menus is open', async () => {
    const actions = billsActions(document, controller.signal)
    const otherMenu = openOtherList(OTHER_MENU_HTML)

    actions.goToPage(THIRD_PAGE)
    await nextTask()

    expect(otherMenu.dataset.clicked).toBeUndefined()
    expect(performed()).toBe('page 3')
  })

  it('picks the size only in the size select\'s own list while another of Xero\'s lists is open', async () => {
    const actions = billsActions(document, controller.signal)
    const otherSizes = openOtherList(OTHER_SIZES_HTML)

    actions.setPageSize(SMALLER_SIZE)
    await nextTask()

    expect(otherSizes.dataset.clicked).toBeUndefined()
    expect(performed()).toBe('size 25')
  })

  it('clicks Xero\'s own arrows', () => {
    const actions = billsActions(document, controller.signal)

    actions.next()
    actions.previous()

    expect(performed()).toBe('next previous')
  })

  it('does nothing without Xero\'s selects', () => {
    const actions = billsActions(document, controller.signal)

    queryRequired(document, PAGE_BUTTON).remove()
    queryRequired(document, SIZE_TRIGGER).remove()
    actions.goToPage(THIRD_PAGE)
    actions.setPageSize(SMALLER_SIZE)

    expect(performed()).toBeUndefined()
  })

  it('does nothing when Xero\'s selects name no list of their own', async () => {
    const actions = billsActions(document, controller.signal)

    queryRequired(document, PAGE_BUTTON).removeAttribute(ID_ATTRIBUTE)
    queryRequired(document, SIZE_TRIGGER).removeAttribute(CONTROLS_ATTRIBUTE)
    actions.goToPage(THIRD_PAGE)
    actions.setPageSize(SMALLER_SIZE)
    await nextTask()

    expect(performed()).toBeUndefined()
    expect(document.querySelector(OPEN_LISTS)).toBeNull()
  })
})

describe('billsAdapter', () => {
  it('puts the bar in the row above the table', () => {
    const bar = document.createElement(BAR_TAG)

    expect(billsAdapter(document, controller.signal).place(bar)).toBe(true)
    expect(queryRequired(document, PLACE).lastElementChild).toBe(bar)
  })

  it('has no place without that row', () => {
    queryRequired(document, PLACE).remove()

    expect(billsAdapter(document, controller.signal).place(document.createElement(BAR_TAG))).toBe(false)
  })

  it('gets its bar back into the new row React draws after a page change', async () => {
    stop = keepTopPager(document.body, billsAdapter(document, controller.signal))

    const picker = queryRequired<HTMLSelectElement>(document, PAGE_PICKER)

    picker.value = SECOND_PAGE_VALUE
    picker.dispatchEvent(new Event(CHANGE_EVENT))
    await nextTask()

    expect(performed()).toBe('page 2')
    expect(queryRequired(document, PLACE).querySelectorAll(BAR)).toHaveLength(1)
    expect(queryRequired<HTMLSelectElement>(document, PAGE_PICKER).value).toBe('2')
  })
})
