// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { activateRecodeSort } from '../../../../src/features/recode-sort'
import type { SortDirection } from '../../../../src/features/recode-sort/messages'
import { RESET_EVENT, SORT_EVENT, SORTED_EVENT } from '../../../../src/features/recode-sort/messages'
import { loadFixture } from '../../helpers/fixture'
import { queryRequired } from '../../helpers/query'

const RECODE_FIXTURE = 'tests/fixtures/Accounts/Recoding/Recode.html'
const RECODE_PATH = '/Accounts/Recoding/Recode'
const HISTORY_PATH = '/Accounts/Recoding'
const PLACE_SELECTOR = '.x-toolbar.results-toolbar > button.bt-sort'
const CONTROL_SELECTOR = 'button.bt-sort'
const ANSWER_MS = 500
const ASCENDING: SortDirection = 'asc'
const DESCENDING: SortDirection = 'desc'
let stop = (): void => {}
let asked: unknown[] = []

function recordAsk(event: Event): void {
  asked.push(event instanceof CustomEvent ? event.detail : null)
}

// The page world's answer, as the page-world script sends it
function answer(type: string, direction?: SortDirection): void {
  document.dispatchEvent(new CustomEvent(type, { detail: direction }))
}

function clickSort(): void {
  queryRequired<HTMLButtonElement>(document, CONTROL_SELECTOR).click()
}

function label(): string | null {
  return queryRequired(document, CONTROL_SELECTOR).textContent
}

beforeEach(async () => {
  vi.useFakeTimers()
  await loadFixture(RECODE_FIXTURE)
  asked = []
  document.addEventListener(SORT_EVENT, recordAsk)
})

afterEach(() => {
  stop()
  document.removeEventListener(SORT_EVENT, recordAsk)
  vi.useRealTimers()
})

describe('activateRecodeSort', () => {
  it('puts its button into the results toolbar', () => {
    stop = activateRecodeSort(document.body, RECODE_PATH, true)

    expect(document.querySelectorAll(PLACE_SELECTOR)).toHaveLength(1)
  })

  it('stays away while switched off and on other pages', () => {
    activateRecodeSort(document.body, RECODE_PATH, false)
    activateRecodeSort(document.body, HISTORY_PATH, true)

    expect(document.querySelector(CONTROL_SELECTOR)).toBeNull()
  })

  it('removes its button and stops listening when stopped', () => {
    const stopSort = activateRecodeSort(document.body, RECODE_PATH, true)
    const button = queryRequired(document, CONTROL_SELECTOR)

    stopSort()
    answer(SORTED_EVENT, ASCENDING)

    expect(button.isConnected).toBe(false)
    expect(button.textContent).toBe('Sort this page: Description')
  })
})

describe('a click on the sort button', () => {
  it('asks the page world for A to Z, then Z to A, and shows each answer', () => {
    stop = activateRecodeSort(document.body, RECODE_PATH, true)

    clickSort()
    answer(SORTED_EVENT, ASCENDING)

    expect(label()).toBe('This page: Description A→Z')

    clickSort()
    answer(SORTED_EVENT, DESCENDING)

    expect(asked).toEqual(['asc', 'desc'])
    expect(label()).toBe('This page: Description Z→A')
  })

  it('goes back to unsorted when Ext loads rows', () => {
    stop = activateRecodeSort(document.body, RECODE_PATH, true)

    clickSort()
    answer(SORTED_EVENT, ASCENDING)
    answer(RESET_EVENT)

    expect(label()).toBe('Sort this page: Description')
  })

  it('keeps the answer that comes in time', () => {
    stop = activateRecodeSort(document.body, RECODE_PATH, true)

    clickSort()
    answer(SORTED_EVENT, ASCENDING)
    vi.advanceTimersByTime(ANSWER_MS)

    expect(label()).toBe('This page: Description A→Z')
  })

  it('says the sort is not available when no answer comes in time', () => {
    stop = activateRecodeSort(document.body, RECODE_PATH, true)

    clickSort()
    vi.advanceTimersByTime(ANSWER_MS)

    expect(label()).toBe('Sort not available on this page')
  })
})
