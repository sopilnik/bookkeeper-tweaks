// @vitest-environment happy-dom
// @vitest-environment-options {"settings":{"enableIframePageLoading":true}}
import { afterEach, describe, expect, it, vi } from 'vitest'
import { printInFrame } from '../../../../src/features/direct-print/frame'
import { queryRequired } from '../../helpers/query'

interface Printing {
  frame: HTMLIFrameElement
  print: ReturnType<typeof vi.fn>
}

const PAGE_URL = 'about:blank'
const FRAME_SELECTOR = 'iframe'
const LOAD_EVENT = 'load'
const ONCE = { once: true }

// happy-dom loads about:blank into the frame (page loading is on for this file), but its windows cannot print, so the
// frame's window gets a print of its own before its page has loaded
function startPrinting(): Printing {
  printInFrame(PAGE_URL)

  const frame = queryRequired<HTMLIFrameElement>(document, FRAME_SELECTOR)
  const print = vi.fn()

  Object.defineProperty(frame.contentWindow, 'print', { value: print })

  return { frame, print }
}

function loaded(frame: HTMLIFrameElement): Promise<Event> {
  return new Promise((resolve) => {
    frame.addEventListener(LOAD_EVENT, resolve, ONCE)
  })
}

afterEach(() => {
  document.body.replaceChildren()
})

describe('printInFrame', () => {
  it('loads the url in a frame that stays rendered, out of sight', () => {
    const { frame } = startPrinting()

    expect(frame.src).toBe(PAGE_URL)
    expect(frame.style.position).toBe('fixed')
    expect(frame.style.opacity).toBe('0')
    expect(frame.style.display).toBe('')
  })

  it('opens the print dialog once the page has loaded, and only once', async () => {
    const { frame, print } = startPrinting()

    await loaded(frame)
    frame.dispatchEvent(new Event(LOAD_EVENT))

    expect(print).toHaveBeenCalledTimes(1)
  })

  it('removes the frame when asked', () => {
    const remove = printInFrame(PAGE_URL)

    remove()

    expect(document.querySelector(FRAME_SELECTOR)).toBeNull()
  })
})
