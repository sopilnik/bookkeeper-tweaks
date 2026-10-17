// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from 'vitest'
import type { PagerActions, PagerLook } from '../../../../src/features/top-pager/bar'
import { createBar } from '../../../../src/features/top-pager/bar'
import type { PagerState } from '../../../../src/features/top-pager/state'
import { queryRequired } from '../../helpers/query'

const SECOND_OF_FOUR: PagerState = { page: 2, pages: 4, pageSize: 25, pageSizes: [10, 25, 50], canPickPage: true }
const FIRST_OF_TWO_NO_PICKER: PagerState = { ...SECOND_OF_FOUR, page: 1, pages: 2, canPickPage: false }
const PAGE_PICKER = 'select[aria-label="Page"]'
const SIZE_PICKER = 'select[aria-label="Items per page"]'
const PREVIOUS = 'button[aria-label="Previous page"]'
const NEXT = 'button[aria-label="Next page"]'
const CHANGE_EVENT = 'change'
const CLASSIC: PagerLook = 'classic'
const EXT: PagerLook = 'ext'
const XUI: PagerLook = 'xui'
const THIRD_PAGE = '3'
const BIGGER_SIZE = '50'
let calls: string[] = []

const RECORDING: PagerActions = {
  goToPage: (page) => {
    calls.push(`page ${page}`)
  },
  setPageSize: (size) => {
    calls.push(`size ${size}`)
  },
  previous: () => {
    calls.push('previous')
  },
  next: () => {
    calls.push('next')
  },
}

function pick(picker: HTMLSelectElement, value: string): void {
  picker.value = value
  picker.dispatchEvent(new Event(CHANGE_EVENT))
}

function optionsOf(picker: HTMLSelectElement): string[] {
  return [...picker.options].map((option) => option.value)
}

beforeEach(() => {
  calls = []
})

describe('createBar', () => {
  it('draws the page and the size with their pickers, and the steps', () => {
    const bar = createBar(SECOND_OF_FOUR, RECORDING, XUI)
    const pagePicker = queryRequired<HTMLSelectElement>(bar, PAGE_PICKER)
    const sizePicker = queryRequired<HTMLSelectElement>(bar, SIZE_PICKER)

    expect(bar.textContent).toBe('Page1234of 4102550per page‹ PrevNext ›')
    expect([optionsOf(pagePicker), pagePicker.value]).toEqual([['1', '2', '3', '4'], '2'])
    expect([optionsOf(sizePicker), sizePicker.value]).toEqual([['10', '25', '50'], '25'])
    expect(queryRequired<HTMLButtonElement>(bar, PREVIOUS).disabled).toBe(false)
    expect(queryRequired<HTMLButtonElement>(bar, NEXT).disabled).toBe(false)
  })

  it('names itself, carries the look and copies no id', () => {
    const bar = createBar(SECOND_OF_FOUR, RECORDING, CLASSIC)

    expect(bar.tagName).toBe('NAV')
    expect(bar.getAttribute('aria-label')).toBe('Pagination (top)')
    expect(bar.className).toBe('bt-pager bt-pager--classic')
    expect(bar.querySelectorAll('[id]')).toHaveLength(0)
  })

  it('writes the page as text where Xero offers no page picker, and stops at the first page', () => {
    const bar = createBar(FIRST_OF_TWO_NO_PICKER, RECORDING, XUI)

    expect(bar.querySelector(PAGE_PICKER)).toBeNull()
    expect(bar.textContent).toContain('Page 1 of 2')
    expect(queryRequired<HTMLButtonElement>(bar, PREVIOUS).disabled).toBe(true)
  })

  it('asks Xero for what the user picks and clicks', () => {
    const bar = createBar(SECOND_OF_FOUR, RECORDING, EXT)

    pick(queryRequired(bar, PAGE_PICKER), THIRD_PAGE)
    pick(queryRequired(bar, SIZE_PICKER), BIGGER_SIZE)
    queryRequired<HTMLButtonElement>(bar, PREVIOUS).click()
    queryRequired<HTMLButtonElement>(bar, NEXT).click()

    expect(calls).toEqual(['page 3', 'size 50', 'previous', 'next'])
  })
})
