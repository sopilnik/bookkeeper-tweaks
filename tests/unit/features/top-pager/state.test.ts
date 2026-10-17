import { describe, expect, it } from 'vitest'
import type { PagerState } from '../../../../src/features/top-pager/state'
import { firstNumber, hasNext, hasPrevious, neighbourPage, nextBarStep, pageNumbers, parsePageOf, stateKey } from '../../../../src/features/top-pager/state'

const SECOND_OF_FOUR: PagerState = { page: 2, pages: 4, pageSize: 10, pageSizes: [10, 25], canPickPage: true }
const FIRST_OF_TWO: PagerState = { ...SECOND_OF_FOUR, page: 1, pages: 2 }
const LAST_OF_TWO: PagerState = { ...SECOND_OF_FOUR, page: 2, pages: 2 }
const ONE_PAGE: PagerState = { ...SECOND_OF_FOUR, page: 1, pages: 1 }
const XUI_PAGE_TEXT = 'Page 1 of 4'
const EXT_PAGE_TEXT = 'Page  2  of  2'
const LABELLED_PAGE_TEXT = 'Select a pagePage 3 of 4'
const COUNT_TEXT = 'Showing items 1-10 of 37'
const EXT_SIZE_TEXT = '100 items per page'
const XUI_SIZE_TEXT = ' 25 '
const NO_NUMBER_TEXT = 'per page'
const BACK = -1
const ON = 1

describe('parsePageOf', () => {
  it('reads the page and the pages of every spelling Xero uses', () => {
    expect(parsePageOf(XUI_PAGE_TEXT)).toEqual({ page: 1, pages: 4 })
    expect(parsePageOf(EXT_PAGE_TEXT)).toEqual({ page: 2, pages: 2 })
    expect(parsePageOf(LABELLED_PAGE_TEXT)).toEqual({ page: 3, pages: 4 })
  })

  it('gives null for other text', () => {
    expect(parsePageOf(COUNT_TEXT)).toBeNull()
  })
})

describe('firstNumber', () => {
  it('reads the size out of a label', () => {
    expect(firstNumber(EXT_SIZE_TEXT)).toBe(100)
    expect(firstNumber(XUI_SIZE_TEXT)).toBe(25)
  })

  it('gives null when there is no number', () => {
    expect(firstNumber(NO_NUMBER_TEXT)).toBeNull()
  })
})

describe('the steps', () => {
  it('has a previous page after the first and a next page before the last', () => {
    expect([hasPrevious(FIRST_OF_TWO), hasNext(FIRST_OF_TWO)]).toEqual([false, true])
    expect([hasPrevious(SECOND_OF_FOUR), hasNext(SECOND_OF_FOUR)]).toEqual([true, true])
    expect([hasPrevious(LAST_OF_TWO), hasNext(LAST_OF_TWO)]).toEqual([true, false])
  })

  it('finds the page before and after within the list only', () => {
    expect([neighbourPage(SECOND_OF_FOUR, BACK), neighbourPage(SECOND_OF_FOUR, ON)]).toEqual([1, 3])
    expect([neighbourPage(FIRST_OF_TWO, BACK), neighbourPage(LAST_OF_TWO, ON)]).toEqual([null, null])
    expect(neighbourPage(null, ON)).toBeNull()
  })

  it('numbers the pages from one', () => {
    expect(pageNumbers(SECOND_OF_FOUR.pages)).toEqual([1, 2, 3, 4])
  })
})

describe('nextBarStep', () => {
  it('removes the bar when Xero shows no pager or one page', () => {
    expect(nextBarStep(null, '', false)).toBe('remove')
    expect(nextBarStep(ONE_PAGE, stateKey(ONE_PAGE), true)).toBe('remove')
  })

  it('keeps the bar that shows the same state and is on the page', () => {
    expect(nextBarStep(SECOND_OF_FOUR, stateKey(SECOND_OF_FOUR), true)).toBe('keep')
  })

  it('draws the bar when the state changed or the bar left the page', () => {
    expect(nextBarStep(SECOND_OF_FOUR, stateKey(FIRST_OF_TWO), true)).toBe('draw')
    expect(nextBarStep(SECOND_OF_FOUR, stateKey(SECOND_OF_FOUR), false)).toBe('draw')
  })
})
