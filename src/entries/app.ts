import { activateApproveDefault } from '../features/approve-default'
import { isInvoiceEditorRoute } from '../features/approve-default/route'
import type { Settings } from '../settings/schema'
import { loadSettings } from '../settings/storage'
import { watchRoute } from '../shared/route'

// The one console line the extension writes on a page; it also lets the smoke test see that the script runs
const ACTIVE_MESSAGE = 'Bookkeeper Tweaks: active'
const NOTHING_TO_UNDO = (): void => {}

function activateFor(pathname: string, settings: Settings): () => void {
  const { enabled, action } = settings.approveDefault

  if (!enabled || !isInvoiceEditorRoute(pathname)) {
    return NOTHING_TO_UNDO
  }

  return activateApproveDefault(document.body, action)
}

// Activates the features of the page the user is on, again after every route change of the new app, always with the
// settings as they are now — a settings change reaches the next page the user opens
async function start(): Promise<void> {
  let settings = await loadSettings(chrome.storage.local)
  let deactivate = activateFor(location.pathname, settings)

  chrome.storage.onChanged.addListener(() => {
    void loadSettings(chrome.storage.local).then((fresh) => {
      settings = fresh
    })
  })

  watchRoute(document.body, (pathname) => {
    deactivate()
    deactivate = activateFor(pathname, settings)
  })
}

console.debug(ACTIVE_MESSAGE)
void start()
