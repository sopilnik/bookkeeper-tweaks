// @vitest-environment happy-dom
// @vitest-environment-options {"url": "https://go.xero.com/app/!demo0/invoicing/"}
import { afterEach, describe, expect, it, vi } from 'vitest'
import { watchRoute } from '../../../src/shared/route'

const START_PATH = '/app/!demo0/invoicing/'
const NEXT_PATH = '/app/!demo0/sales/overview'
const CHANGE_TAG = 'div'

function nextTask(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0)
  })
}

function changeDom(): void {
  document.body.append(document.createElement(CHANGE_TAG))
}

afterEach(() => {
  history.replaceState(null, '', START_PATH)
  document.body.replaceChildren()
})

describe('watchRoute', () => {
  it('reports the new path once the page changes after a route change', async () => {
    const onChange = vi.fn()

    watchRoute(document.body, onChange)
    history.pushState(null, '', NEXT_PATH)
    changeDom()
    await nextTask()

    expect(onChange).toHaveBeenCalledExactlyOnceWith(NEXT_PATH)
  })

  it('stays quiet while the path is the same', async () => {
    const onChange = vi.fn()

    watchRoute(document.body, onChange)
    changeDom()
    await nextTask()

    expect(onChange).not.toHaveBeenCalled()
  })

  it('stops when told to', async () => {
    const onChange = vi.fn()
    const stop = watchRoute(document.body, onChange)

    stop()
    history.pushState(null, '', NEXT_PATH)
    changeDom()
    await nextTask()

    expect(onChange).not.toHaveBeenCalled()
  })
})
