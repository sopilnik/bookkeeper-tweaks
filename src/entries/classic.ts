import { activateRecodeSort } from '../features/recode-sort'
import { activateTopPager } from '../features/top-pager'
import { loadSettings } from '../settings/storage'
import { announceActive } from '../shared/active'

// Xero's classic pages load in full on every change, so the top pager and the recode sort activate once per page, with
// the settings as they are when the page loads; the console line follows the activation
async function start(): Promise<void> {
  const settings = await loadSettings(chrome.storage.local)

  activateTopPager(document.body, location.pathname, settings.topPager.enabled)
  activateRecodeSort(document.body, location.pathname, settings.recodeSort.enabled)
  announceActive()
}

void start()
