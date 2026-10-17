import { activateApproveDefault } from '../features/approve-default'
import { isInvoiceEditorRoute } from '../features/approve-default/route'
import { activateTopPager } from '../features/top-pager'
import type { Settings } from '../settings/schema'
import { loadSettings } from '../settings/storage'
import { announceActive } from '../shared/active'
import { watchRoute } from '../shared/route'

const NOTHING_TO_UNDO = (): void => {}

function activateApprove(pathname: string, settings: Settings): () => void {
  const { enabled, action } = settings.approveDefault

  if (!enabled || !isInvoiceEditorRoute(pathname)) {
    return NOTHING_TO_UNDO
  }

  return activateApproveDefault(document.body, action)
}

// Every feature of the new app on the page at the path; the returned function deactivates them all
function activateFor(pathname: string, settings: Settings): () => void {
  const deactivations = [activateApprove(pathname, settings), activateTopPager(document.body, pathname, settings.topPager.enabled)]

  return () => {
    deactivations.forEach((deactivate) => {
      deactivate()
    })
  }
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

announceActive()
void start()
