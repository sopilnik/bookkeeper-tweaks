import { directionOf, RESET_EVENT, SORT_EVENT, SORTED_EVENT } from '../features/recode-sort/messages'
import type { SortDirection } from '../features/recode-sort/messages'
import type { RecodeStore } from '../features/recode-sort/store'
import { sortPage, watchLoads } from '../features/recode-sort/store'

// Find and recode's results panel and its store, as reached on the demo company through the page's Ext JS; the store
// exists only after a search
interface ResultsPanel {
  getStore?: () => RecodeStore
}

interface ExtGlobal {
  Ext?: { ComponentQuery?: { query: (selector: string) => ResultsPanel[] } }
}

const RESULTS_XTYPE = 'resultspanel'

function resultsStore(): RecodeStore | null {
  const panel = (window as ExtGlobal).Ext?.ComponentQuery?.query(RESULTS_XTYPE)[0]

  return panel?.getStore?.() ?? null
}

function announce(type: string, direction?: SortDirection): void {
  document.dispatchEvent(new CustomEvent(type, { detail: direction }))
}

function announceReset(): void {
  announce(RESET_EVENT)
}

// The page-world half of feature 4, the only code of the extension in the page's own world: when the control asks, it
// sorts the loaded page and says so, and from then on it announces every load of the store. It holds no settings and
// adds nothing to the page
function onSortAsked(event: Event): void {
  const direction = directionOf(event)
  const store = resultsStore()

  if (!direction || !store) {
    return
  }

  watchLoads(store, announceReset)
  sortPage(store, direction)
  announce(SORTED_EVENT, direction)
}

document.addEventListener(SORT_EVENT, onSortAsked)
