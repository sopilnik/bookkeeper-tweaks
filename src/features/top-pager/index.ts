import { billsAdapter } from './bills'
import { classicAdapter } from './classic'
import type { PagerAdapter } from './keeper'
import { keepTopPager } from './keeper'
import { recodeAdapter } from './recode'
import type { PagerKind } from './route'
import { pagerKindOf } from './route'

const ADAPTERS: Record<PagerKind, (root: ParentNode, signal: AbortSignal) => PagerAdapter> = {
  classic: classicAdapter,
  recode: recodeAdapter,
  bills: billsAdapter,
}
const NOTHING_TO_UNDO = (): void => {}

// Feature 3 on the page at the path: a bar above the list that drives Xero's pager, when the feature is on and the
// page is one of its lists. The returned function stops it, aborts a pick still waiting and removes the bar
export function activateTopPager(root: ParentNode & Node, pathname: string, enabled: boolean): () => void {
  const kind = pagerKindOf(pathname)

  if (!enabled || !kind) {
    return NOTHING_TO_UNDO
  }

  const controller = new AbortController()
  const stopKeeping = keepTopPager(root, ADAPTERS[kind](root, controller.signal))

  return () => {
    controller.abort()
    stopKeeping()
  }
}
