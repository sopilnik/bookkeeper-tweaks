// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest'
import { createSortControl, showState } from '../../../../src/features/recode-sort/control'
import type { SortState } from '../../../../src/features/recode-sort/state'

const DOT_SELECTOR = '.bt-sort__dot'
const ACTIVE_CLASS = 'bt-sort--active'
const UNAVAILABLE_CLASS = 'bt-sort--unavailable'
const ASCENDING: SortState = 'asc'
const UNAVAILABLE: SortState = 'unavailable'
const QUIET = (): void => {}

describe('createSortControl', () => {
  it('starts unsorted, with the extension\'s dot', () => {
    const control = createSortControl(QUIET)

    expect(control.state).toBe('unsorted')
    expect(control.element.textContent).toBe('Sort this page: Description')
    expect(control.element.type).toBe('button')
    expect(control.element.querySelector(DOT_SELECTOR)).not.toBeNull()
  })

  it('calls back on a click', () => {
    const onClick = vi.fn()

    createSortControl(onClick).element.click()

    expect(onClick).toHaveBeenCalledTimes(1)
  })
})

describe('showState', () => {
  it('shows a sorted page as active, keeping the dot', () => {
    const control = createSortControl(QUIET)

    showState(control, ASCENDING)

    expect(control.state).toBe('asc')
    expect(control.element.textContent).toBe('This page: Description A→Z')
    expect(control.element.classList.contains(ACTIVE_CLASS)).toBe(true)
    expect(control.element.querySelector(DOT_SELECTOR)).not.toBeNull()
  })

  it('greys the button out when the sort is not available', () => {
    const control = createSortControl(QUIET)

    showState(control, UNAVAILABLE)

    expect(control.element.classList.contains(UNAVAILABLE_CLASS)).toBe(true)
    expect(control.element.classList.contains(ACTIVE_CLASS)).toBe(false)
  })
})
