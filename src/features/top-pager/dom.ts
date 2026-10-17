import type { HiddenPick } from '../../shared/hidden-picker'
import { pickHidden } from '../../shared/hidden-picker'

// Puts the bar first in its place; false when the place is missing
export function prependTo(place: Element | null, bar: HTMLElement): boolean {
  place?.prepend(bar)

  return place !== null
}

// Puts the bar last in its place; false when the place is missing
export function appendTo(place: Element | null, bar: HTMLElement): boolean {
  place?.append(bar)

  return place !== null
}

// Clicks Xero's element the selector names under root, when it is there
export function clickAt(root: ParentNode, selector: string): void {
  root.querySelector<HTMLElement>(selector)?.click()
}

// Picks an option in one of Xero's lists, opened unseen, when the list's trigger was found
export function pickUnseen(pick: HiddenPick | null): void {
  if (!pick) {
    return
  }

  void pickHidden(pick)
}
