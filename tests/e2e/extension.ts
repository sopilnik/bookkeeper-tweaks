import { chromium, test as base } from '@playwright/test'
import type { BrowserContext, Route } from '@playwright/test'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { extensionIdFromKey } from './extension-id'

interface ExtensionFixtures {
  context: BrowserContext
}

const ROOT = path.resolve(import.meta.dirname, '../..')
const DIST_DIR = path.join(ROOT, 'dist')
const FIXTURES_DIR = path.join(ROOT, 'tests/fixtures')
const MANIFEST = JSON.parse(readFileSync(path.join(ROOT, 'manifest.json'), 'utf8'))
// The new headless mode of the full Chromium build; the default headless shell cannot load extensions
const LAUNCH_OPTIONS = {
  channel: 'chromium',
  args: [`--disable-extensions-except=${DIST_DIR}`, `--load-extension=${DIST_DIR}`],
}
const XERO_REQUESTS = 'https://go.xero.com/**'
const WEB_REQUESTS = /^https?:\/\//
const FIXTURE_EXTENSION = '.html'
// Chrome shows its own error page instead of a 404 whose body is empty
const NOT_FOUND = { status: 404, body: 'No fixture for this path' }

export const EXTENSION_ID = extensionIdFromKey(MANIFEST.key)

export { expect } from '@playwright/test'

function fixtureFile(url: string): string {
  return path.join(FIXTURES_DIR, new URL(url).pathname + FIXTURE_EXTENSION)
}

// A routed Xero request gets its fixture file, or a 404 when the test has none
async function answerFromFixtures(route: Route): Promise<void> {
  const file = fixtureFile(route.request().url())

  if (!existsSync(file)) {
    await route.fulfill(NOT_FOUND)

    return
  }

  await route.fulfill({ path: file })
}

// The route added last is tried first: Xero's requests get fixtures, every other web request is aborted
async function routeRequests(context: BrowserContext): Promise<void> {
  await context.route(WEB_REQUESTS, (route) => route.abort())
  await context.route(XERO_REQUESTS, answerFromFixtures)
}

export const test = base.extend<ExtensionFixtures>({
  context: async ({ headless }, use) => {
    const context = await chromium.launchPersistentContext('', { ...LAUNCH_OPTIONS, headless })

    await routeRequests(context)
    await use(context)
    await context.close()
  },
})
