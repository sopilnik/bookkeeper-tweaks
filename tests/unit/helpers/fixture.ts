import { readFile } from 'node:fs/promises'

// Paths are read from the repository root, where Vitest runs
const EDITOR_FIXTURE = 'tests/fixtures/app/!demo0/invoicing/edit/00000000-0000-0000-0000-000000000000.html'
const TEXT_ENCODING = 'utf8'
const HTML_TYPE = 'text/html'

// Replaces the test document's body with the body of a saved page
export async function loadFixture(file: string): Promise<void> {
  const page = new DOMParser().parseFromString(await readFile(file, TEXT_ENCODING), HTML_TYPE)

  document.body.replaceWith(document.importNode(page.body, true))
}

export function loadEditorFixture(): Promise<void> {
  return loadFixture(EDITOR_FIXTURE)
}
