// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { isListShown, readRecodeState, recodeActions, recodeAdapter } from '../../../../src/features/top-pager/recode'
import { installExtStub } from '../../../e2e/ext-stub'
import { queryRequired } from '../../helpers/query'
import { loadWithStub, performed } from '../../helpers/stub'

const RECODE_FIXTURE = 'tests/fixtures/Accounts/Recoding/Recode.html'
const PAGE_COMBO = 'table.page-number'
const PAGING = '.x-toolbar.x-paging'
const RESULTS_TOOLBAR = '.x-toolbar.results-toolbar'
const PAGE_COMBO_ID = 'combo-1069'
const PAGE_LIST_ID = `${PAGE_COMBO_ID}-boundlist`
const PAGE_LIST = `#${PAGE_LIST_ID}`
const SIZE_COMBO_ID = 'combo-1068'
const EXT_HIDE_CLASS = 'x-hide-offsets'
const SECOND_PAGE = 2
const MISSING_PAGE = 5
const SMALLER_SIZE = 25
const LIST_TAG = 'div'
const BAR_TAG = 'nav'
const HIDDEN_DISPLAY = 'none'
const OPTION_WAIT_MS = 1000
let removeStub = (): void => {}
let controller = new AbortController()

function nextTask(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0)
  })
}

function listOf(id: string): HTMLElement {
  const list = document.createElement(LIST_TAG)

  list.id = id
  document.body.append(list)

  return list
}

beforeEach(async () => {
  removeStub = await loadWithStub(RECODE_FIXTURE, installExtStub)
  controller = new AbortController()
})

afterEach(() => {
  removeStub()
  controller.abort()
  vi.useRealTimers()
})

describe('readRecodeState', () => {
  it('reads the page and the size out of Ext\'s combos', () => {
    expect(readRecodeState(document)).toEqual({ page: 1, pages: 2, pageSize: 100, pageSizes: [10, 25, 50, 100, 200], canPickPage: true })
  })

  it('gives null without the paging toolbar', () => {
    queryRequired(document, PAGING).remove()

    expect(readRecodeState(document)).toBeNull()
  })
})

describe('isListShown', () => {
  it('reads a list as shown only while Ext shows it', () => {
    const list = listOf(PAGE_LIST_ID)

    expect(isListShown(PAGE_COMBO_ID)).toBe(true)

    list.style.display = HIDDEN_DISPLAY

    expect(isListShown(PAGE_COMBO_ID)).toBe(false)

    list.style.display = ''
    list.classList.add(EXT_HIDE_CLASS)

    expect(isListShown(PAGE_COMBO_ID)).toBe(false)

    list.remove()

    expect(isListShown(PAGE_COMBO_ID)).toBe(false)
  })
})

describe('recodeActions', () => {
  it('picks the page and the size in Ext\'s combos and closes their lists', async () => {
    const actions = recodeActions(document, controller.signal)

    actions.goToPage(SECOND_PAGE)
    await nextTask()
    actions.setPageSize(SMALLER_SIZE)
    await nextTask()

    expect(performed()).toBe('page 2 size 25')
    expect(isListShown(PAGE_COMBO_ID)).toBe(false)
    expect(isListShown(SIZE_COMBO_ID)).toBe(false)
  })

  it('clicks Ext\'s own Next and Prev', () => {
    const actions = recodeActions(document, controller.signal)

    actions.next()
    actions.previous()

    expect(performed()).toBe('next previous')
  })

  it('closes the list it opened when the page is not in it', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })

    recodeActions(document, controller.signal).goToPage(MISSING_PAGE)
    await vi.advanceTimersByTimeAsync(OPTION_WAIT_MS)

    expect(queryRequired<HTMLElement>(document, PAGE_LIST).style.display).toBe(HIDDEN_DISPLAY)
    expect(performed()).toBeUndefined()
  })

  it('does nothing without the combos or the buttons', () => {
    const actions = recodeActions(document, controller.signal)

    queryRequired(document, PAGING).remove()
    actions.goToPage(SECOND_PAGE)
    actions.setPageSize(SMALLER_SIZE)
    actions.next()

    expect(performed()).toBeUndefined()
  })

  it('does nothing when a combo has no trigger', () => {
    queryRequired(document, `${PAGE_COMBO} .x-form-trigger`).remove()
    recodeActions(document, controller.signal).goToPage(SECOND_PAGE)

    expect(document.querySelector(PAGE_LIST)).toBeNull()
  })
})

describe('recodeAdapter', () => {
  it('puts the bar last in the results toolbar', () => {
    const bar = document.createElement(BAR_TAG)

    expect(recodeAdapter(document, controller.signal).place(bar)).toBe(true)
    expect(queryRequired(document, RESULTS_TOOLBAR).lastElementChild).toBe(bar)
  })

  it('has no place without the results toolbar', () => {
    queryRequired(document, RESULTS_TOOLBAR).remove()

    expect(recodeAdapter(document, controller.signal).place(document.createElement(BAR_TAG))).toBe(false)
  })
})
