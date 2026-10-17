// The one console line the extension writes on a page; it also lets the tests see that a content script has run
const ACTIVE_MESSAGE = 'Bookkeeper Tweaks: active'

export function announceActive(): void {
  console.debug(ACTIVE_MESSAGE)
}
