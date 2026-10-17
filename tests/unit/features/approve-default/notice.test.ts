// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { showNotice } from '../../../../src/features/approve-default/notice'

const GROUP_TAG = 'div'
const MESSAGE = 'Could not pick it'
const NOTICE_SELECTOR = '.bt-approve-notice'
const NOTICE_MS = 8000
const ROLE_ATTRIBUTE = 'role'
let group = document.createElement(GROUP_TAG)

beforeEach(() => {
  vi.useFakeTimers()
  group = document.createElement(GROUP_TAG)
  document.body.append(group)
})

afterEach(() => {
  vi.useRealTimers()
  document.body.replaceChildren()
})

describe('showNotice', () => {
  it('shows the message under the group as a status', () => {
    showNotice(group, MESSAGE)

    expect(group.querySelector(NOTICE_SELECTOR)?.textContent).toBe(MESSAGE)
    expect(group.querySelector(NOTICE_SELECTOR)?.getAttribute(ROLE_ATTRIBUTE)).toBe('status')
  })

  it('goes away by itself after eight seconds', () => {
    showNotice(group, MESSAGE)
    vi.advanceTimersByTime(NOTICE_MS)

    expect(group.querySelector(NOTICE_SELECTOR)).toBeNull()
  })

  it('goes away sooner when removed', () => {
    showNotice(group, MESSAGE)()

    expect(group.querySelector(NOTICE_SELECTOR)).toBeNull()
  })
})
