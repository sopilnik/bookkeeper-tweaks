// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { showNotice } from '../../../src/shared/notice'

const HOST_TAG = 'div'
const MESSAGE = 'Could not pick it'
const NOTICE_SELECTOR = '.bt-notice'
const NOTICE_MS = 8000
const ROLE_ATTRIBUTE = 'role'
let host = document.createElement(HOST_TAG)

beforeEach(() => {
  vi.useFakeTimers()
  host = document.createElement(HOST_TAG)
  document.body.append(host)
})

afterEach(() => {
  vi.useRealTimers()
  document.body.replaceChildren()
})

describe('showNotice', () => {
  it('shows the message under its host as a status', () => {
    showNotice(host, MESSAGE)

    expect(host.querySelector(NOTICE_SELECTOR)?.textContent).toBe(MESSAGE)
    expect(host.querySelector(NOTICE_SELECTOR)?.getAttribute(ROLE_ATTRIBUTE)).toBe('status')
  })

  it('goes away by itself after eight seconds', () => {
    showNotice(host, MESSAGE)
    vi.advanceTimersByTime(NOTICE_MS)

    expect(host.querySelector(NOTICE_SELECTOR)).toBeNull()
  })

  it('goes away sooner when removed', () => {
    showNotice(host, MESSAGE)()

    expect(host.querySelector(NOTICE_SELECTOR)).toBeNull()
  })
})
