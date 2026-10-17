export interface WaitOptions {
  timeoutMs: number
  signal?: AbortSignal
}

const OBSERVE_TREE: MutationObserverInit = { childList: true, subtree: true }
const ABORT_EVENT = 'abort'

// Resolves with the first element under root that matches the selector, or with null once the time is up or the
// wait is aborted
export function waitForElement(root: ParentNode & Node, selector: string, options: WaitOptions): Promise<Element | null> {
  const present = root.querySelector(selector)

  if (present || options.signal?.aborted) {
    return Promise.resolve(present)
  }

  return new Promise((resolve) => {
    const finish = (element: Element | null): void => {
      observer.disconnect()
      clearTimeout(timer)
      options.signal?.removeEventListener(ABORT_EVENT, giveUp)
      resolve(element)
    }
    const giveUp = (): void => {
      finish(null)
    }
    const observer = new MutationObserver(() => {
      const element = root.querySelector(selector)

      if (element) {
        finish(element)
      }
    })
    const timer = setTimeout(giveUp, options.timeoutMs)

    observer.observe(root, OBSERVE_TREE)
    options.signal?.addEventListener(ABORT_EVENT, giveUp)
  })
}
