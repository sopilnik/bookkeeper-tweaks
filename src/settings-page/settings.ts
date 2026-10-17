const VERSION_SELECTOR = '#bt-version'

function findVersionSlot(): HTMLElement | null {
  return document.querySelector<HTMLElement>(VERSION_SELECTOR)
}

function showVersion(slot: HTMLElement, version: string): void {
  slot.textContent = version
}

function start(): void {
  const slot = findVersionSlot()
  const { version } = chrome.runtime.getManifest()

  if (!slot) {
    return
  }

  showVersion(slot, version)
}

start()
