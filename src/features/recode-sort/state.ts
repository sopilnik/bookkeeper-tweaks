import type { SortDirection } from './messages'

// What the sort button shows: the page as Xero ordered it, sorted either way, or the sort not available
export type SortState = SortDirection | 'unsorted' | 'unavailable'

const LABELS: Record<SortState, string> = {
  unsorted: 'Sort this page: Description',
  asc: 'This page: Description A→Z',
  desc: 'This page: Description Z→A',
  unavailable: 'Sort not available on this page',
}

// The direction a click asks for: A to Z first, then back and forth
export function nextDirection(state: SortState): SortDirection {
  return state === 'asc' ? 'desc' : 'asc'
}

export function labelOf(state: SortState): string {
  return LABELS[state]
}
