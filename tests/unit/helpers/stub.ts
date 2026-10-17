import { loadFixture } from './fixture'

// The actions a stand-in for Xero recorded on <html data-bt-performed>, in order; undefined when there are none
export function performed(): string | undefined {
  return document.documentElement.dataset.btPerformed
}

// Loads the saved page and puts the stand-in for Xero's controls on it, with nothing recorded yet; gives the function
// that removes the stand-in
export async function loadWithStub(fixture: string, install: () => () => void): Promise<() => void> {
  await loadFixture(fixture)
  delete document.documentElement.dataset.btPerformed

  return install()
}
