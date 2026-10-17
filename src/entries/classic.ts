import { activateTopPager } from '../features/top-pager'
import { loadSettings } from '../settings/storage'
import { announceActive } from '../shared/active'

// Xero's classic pages load in full on every change, so the top pager activates once per page, with the settings as
// they are when the page loads; the console line follows the activation
async function start(): Promise<void> {
  const settings = await loadSettings(chrome.storage.local)

  activateTopPager(document.body, location.pathname, settings.topPager.enabled)
  announceActive()
}

void start()
