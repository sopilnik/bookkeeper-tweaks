import type { PagerActions, PagerLook } from './bar'
import { createBar } from './bar'
import type { PagerState } from './state'
import { nextBarStep, stateKey } from './state'

// One kind of Xero list: how to read its pager, where the bar goes and how the bar drives the pager
export interface PagerAdapter {
  look: PagerLook
  // The pager as it is now; null when the page has none
  readState: () => PagerState | null
  // Puts the bar at its place on the page; false when the place is missing
  place: (bar: HTMLElement) => boolean
  actions: PagerActions
}

const WATCHED: MutationObserverInit = { childList: true, subtree: true, characterData: true }
const NOTHING_SHOWN = ''

// Keeps a bar above the list in step with Xero's pager under root: drawn while the pager shows more than one page,
// drawn again whenever the pager changes or the page drops the bar, removed otherwise. The returned function stops
// and removes the bar
export function keepTopPager(root: Node, adapter: PagerAdapter): () => void {
  let bar: HTMLElement | null = null
  let shownKey = NOTHING_SHOWN
  const remove = (): void => {
    bar?.remove()
    bar = null
    shownKey = NOTHING_SHOWN
  }
  const draw = (state: PagerState): void => {
    const fresh = createBar(state, adapter.actions, adapter.look)

    if (!adapter.place(fresh)) {
      remove()

      return
    }

    bar?.remove()
    bar = fresh
    shownKey = stateKey(state)
  }
  const refresh = (): void => {
    const state = adapter.readState()
    const step = nextBarStep(state, shownKey, bar?.isConnected ?? false)

    if (step === 'keep') {
      return
    }

    if (!state || step === 'remove') {
      remove()

      return
    }

    draw(state)
  }
  const observer = new MutationObserver(refresh)

  refresh()
  observer.observe(root, WATCHED)

  return () => {
    observer.disconnect()
    remove()
  }
}
