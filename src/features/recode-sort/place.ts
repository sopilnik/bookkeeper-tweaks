// Where the sort button goes: Find and recode's results toolbar (it exists only after a search), before the top
// pager when the pager is there, as read on the demo company
export interface ToolbarPlace {
  toolbar: Element
  pager: HTMLElement | null
  pagerWidth: number
}

const TOOLBAR_SELECTOR = '.x-panel.results-panel .x-toolbar.results-toolbar'
const PAGER_SELECTOR = 'nav.bt-pager'
// The top pager sits 12 px from the toolbar's right edge (top-pager.css); the button keeps 16 px from it
const EDGE_PX = 12
const GAP_PX = 16
const PX = (value: number): string => `${value}px`

export function findToolbarPlace(root: ParentNode): ToolbarPlace | null {
  const toolbar = root.querySelector(TOOLBAR_SELECTOR)
  const pager = toolbar?.querySelector<HTMLElement>(PAGER_SELECTOR) ?? null

  return toolbar ? { toolbar, pager, pagerWidth: pager?.offsetWidth ?? 0 } : null
}

// How far from the toolbar's right edge the button sits: left of a shown pager, else at the edge
export function rightOffset(pagerWidth: number): number {
  return pagerWidth > 0 ? EDGE_PX + pagerWidth + GAP_PX : EDGE_PX
}

// Puts the button into the toolbar right before the top pager, which stays the toolbar's last child, at its offset
// from the right edge; takes it out when there is no toolbar
export function placeInToolbar(control: HTMLElement, place: ToolbarPlace | null): void {
  if (!place) {
    control.remove()

    return
  }

  if (control.parentElement !== place.toolbar) {
    place.toolbar.insertBefore(control, place.pager)
  }

  control.style.right = PX(rightOffset(place.pagerWidth))
}
