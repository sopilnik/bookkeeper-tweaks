import type { SortDirection } from './messages'
import { directionOf, RESET_EVENT, SORT_EVENT, SORTED_EVENT } from './messages'
import type { SortState } from './state'

const UNSORTED: SortState = 'unsorted'

// Asks the page-world script to sort the loaded page
export function askSort(direction: SortDirection): void {
  document.dispatchEvent(new CustomEvent(SORT_EVENT, { detail: direction }))
}

// Listens to the page-world script: onState gets the direction it sorted by, and "unsorted" after every load of rows;
// the returned function stops listening
export function listenToPage(onState: (state: SortState) => void): () => void {
  const onSorted = (event: Event): void => {
    const direction = directionOf(event)

    if (direction) {
      onState(direction)
    }
  }
  const onReset = (): void => {
    onState(UNSORTED)
  }

  document.addEventListener(SORTED_EVENT, onSorted)
  document.addEventListener(RESET_EVENT, onReset)

  return () => {
    document.removeEventListener(SORTED_EVENT, onSorted)
    document.removeEventListener(RESET_EVENT, onReset)
  }
}
