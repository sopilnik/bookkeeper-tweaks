// Puts the bar first in its place; false when the place is missing
export function prependTo(place: Element | null, bar: HTMLElement): boolean {
  place?.prepend(bar)

  return place !== null
}
