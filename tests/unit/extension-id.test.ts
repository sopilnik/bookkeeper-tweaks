import { readFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'
import { extensionIdFromKey } from '../e2e/extension-id'

const MANIFEST_URL = new URL('../../manifest.json', import.meta.url)
const TEXT_ENCODING = 'utf8'

describe('extensionIdFromKey', () => {
  it('gives the id Chrome reports for the manifest key', async () => {
    const manifest = JSON.parse(await readFile(MANIFEST_URL, TEXT_ENCODING))

    expect(extensionIdFromKey(manifest.key)).toBe('bbckhndgoejohnnhlgeendblkclbnckj')
  })
})
