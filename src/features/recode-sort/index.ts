import { keepPlaced } from '../../shared/keeper'
import { askSort, listenToPage } from './bridge'
import { createSortControl, showState } from './control'
import { findToolbarPlace, placeInToolbar } from './place'
import { isRecodeResultsPath } from './route'
import type { SortState } from './state'
import { nextDirection } from './state'

// How long the page-world script may take to answer before the sort counts as not available on the page
const ANSWER_MS = 500
const UNAVAILABLE: SortState = 'unavailable'
const NOTHING_TO_UNDO = (): void => {}

// Feature 4 on Find and recode: a button in the results toolbar sorts the loaded page by description through the
// page-world script — A to Z, then Z to A — and shows the page as unsorted again once Ext loads rows. The returned
// function stops it and removes its button
export function activateRecodeSort(root: ParentNode & Node, pathname: string, enabled: boolean): () => void {
  if (!enabled || !isRecodeResultsPath(pathname)) {
    return NOTHING_TO_UNDO
  }

  let waiting: ReturnType<typeof setTimeout> | undefined
  const control = createSortControl(() => {
    clearTimeout(waiting)

    waiting = setTimeout(() => {
      showState(control, UNAVAILABLE)
    }, ANSWER_MS)

    askSort(nextDirection(control.state))
  })
  const stopListening = listenToPage((state) => {
    clearTimeout(waiting)
    showState(control, state)
  })
  const stopKeeping = keepPlaced(root, control.element, () => {
    placeInToolbar(control.element, findToolbarPlace(root))
  })

  return () => {
    clearTimeout(waiting)
    stopListening()
    stopKeeping()
  }
}
