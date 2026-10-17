// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { classicActions, classicAdapter, readClassicState } from '../../../../src/features/top-pager/classic'
import { loadFixture } from '../../helpers/fixture'
import { queryRequired } from '../../helpers/query'

const CLASSIC_FIXTURE = 'tests/fixtures/AccountsReceivable/Search.aspx.html'
const PAGE_PICKER = '#mainPagerGoToDropDown'
const SIZE_PICKER = '#mainPagerItemPerPageDropDown'
const ACTION_BAR = 'div.action-bar'
const CHANGE_EVENT = 'change'
const CHANGE_SEPARATOR = ' '
const BAR_TAG = 'nav'
const SECOND_PAGE = 2
const SECOND_PAGE_VALUE = '2'
const BIGGER_SIZE = 50
let changes: string[] = []

function recordChange(event: Event): void {
  const target = event.target as HTMLSelectElement

  changes.push([target.id, target.value].join(CHANGE_SEPARATOR))
}

function picker(selector: string): HTMLSelectElement {
  return queryRequired<HTMLSelectElement>(document, selector)
}

beforeEach(async () => {
  await loadFixture(CLASSIC_FIXTURE)
  changes = []
  document.addEventListener(CHANGE_EVENT, recordChange)
})

afterEach(() => {
  document.removeEventListener(CHANGE_EVENT, recordChange)
})

describe('readClassicState', () => {
  it('reads the page, the pages and the sizes from Xero\'s pickers', () => {
    expect(readClassicState(document)).toEqual({ page: 1, pages: 2, pageSize: 25, pageSizes: [10, 25, 50, 100, 200], canPickPage: true })
  })

  it('reads the page Xero shows after a page change', () => {
    picker(PAGE_PICKER).value = SECOND_PAGE_VALUE

    expect(readClassicState(document)?.page).toBe(2)
  })

  it('gives null when a picker is missing', () => {
    picker(SIZE_PICKER).remove()

    expect(readClassicState(document)).toBeNull()
  })
})

describe('classicActions', () => {
  it('drives Xero\'s pickers and lets their change handlers run', () => {
    const actions = classicActions(document)

    actions.goToPage(SECOND_PAGE)
    actions.setPageSize(BIGGER_SIZE)

    expect(changes).toEqual(['mainPagerGoToDropDown 2', 'mainPagerItemPerPageDropDown 50'])
  })

  it('steps to the next and the previous page through the page picker', () => {
    const actions = classicActions(document)

    actions.next()
    actions.previous()

    expect(changes).toEqual(['mainPagerGoToDropDown 2', 'mainPagerGoToDropDown 1'])
  })

  it('does nothing past the ends or without the pickers', () => {
    const actions = classicActions(document)

    actions.previous()
    picker(PAGE_PICKER).value = SECOND_PAGE_VALUE
    actions.next()
    picker(PAGE_PICKER).remove()
    picker(SIZE_PICKER).remove()
    actions.goToPage(SECOND_PAGE)
    actions.setPageSize(BIGGER_SIZE)

    expect(changes).toEqual([])
  })
})

describe('classicAdapter', () => {
  it('puts the bar first in the strip above the table', () => {
    const bar = document.createElement(BAR_TAG)

    expect(classicAdapter(document).place(bar)).toBe(true)
    expect(queryRequired(document, ACTION_BAR).firstElementChild).toBe(bar)
  })

  it('has no place without the strip', () => {
    queryRequired(document, ACTION_BAR).remove()

    expect(classicAdapter(document).place(document.createElement(BAR_TAG))).toBe(false)
  })
})
