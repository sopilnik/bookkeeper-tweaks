// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from 'vitest'
import { waitForElement } from '../../../src/shared/wait-for-element'

const TARGET_SELECTOR = '#bt-target'
const TARGET_ID = 'bt-target'
const TARGET_TAG = 'div'
const SHORT_TIMEOUT_MS = 20
const LONG_TIMEOUT_MS = 1000

function addTarget(): HTMLElement {
  const target = document.createElement(TARGET_TAG)

  target.id = TARGET_ID
  document.body.append(target)

  return target
}

afterEach(() => {
  document.body.replaceChildren()
})

describe('waitForElement', () => {
  it('gives an element that is already there', async () => {
    const target = addTarget()

    expect(await waitForElement(document.body, TARGET_SELECTOR, { timeoutMs: SHORT_TIMEOUT_MS })).toBe(target)
  })

  it('waits for an element that appears later', async () => {
    const waiting = waitForElement(document.body, TARGET_SELECTOR, { timeoutMs: LONG_TIMEOUT_MS })
    const target = addTarget()

    expect(await waiting).toBe(target)
  })

  it('gives null when the time is up', async () => {
    expect(await waitForElement(document.body, TARGET_SELECTOR, { timeoutMs: SHORT_TIMEOUT_MS })).toBeNull()
  })

  it('gives null when the wait is aborted', async () => {
    const controller = new AbortController()
    const waiting = waitForElement(document.body, TARGET_SELECTOR, { timeoutMs: LONG_TIMEOUT_MS, signal: controller.signal })

    controller.abort()

    expect(await waiting).toBeNull()
  })
})
