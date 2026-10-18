import { execFile } from 'node:child_process'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { packExtension, withoutKey } from '../../scripts/zip.ts'

const TEMP_PREFIX = path.join(tmpdir(), 'bookkeeper-tweaks-zip-')
const ZIP_FILE = 'store.zip'
const MANIFEST_FILE = 'manifest.json'
const UNZIP_COMMAND = 'unzip'
// -Z1 lists the archive's file names, one per line; -p prints a file's contents
const LIST_NAMES = '-Z1'
const PRINT_FILE = '-p'
const LINE_END = '\n'
const BUILT_FILES = [
  'app.css', 'app.js', 'classic.css', 'classic.js', 'icon-128.png', 'icon-16.png', 'icon-32.png', 'icon-48.png',
  'manifest.json', 'recode-page.js', 'settings.css', 'settings.html', 'settings.js',
]
const DEVELOPMENT_MANIFEST = { name: 'Bookkeeper Tweaks', version: '0.1.0', key: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8A' }
const run = promisify(execFile)
let outDir = ''
let zipFile = ''

async function unzip(...args: string[]): Promise<string> {
  const { stdout } = await run(UNZIP_COMMAND, args)

  return stdout
}

beforeAll(async () => {
  outDir = await mkdtemp(TEMP_PREFIX)
  zipFile = path.join(outDir, ZIP_FILE)
  await packExtension(zipFile)
})

afterAll(async () => {
  await rm(outDir, { recursive: true, force: true })
})

describe('withoutKey', () => {
  it('takes the development key out of a manifest and keeps the rest', () => {
    expect(withoutKey(DEVELOPMENT_MANIFEST)).toEqual({ name: 'Bookkeeper Tweaks', version: '0.1.0' })
  })
})

describe('the store package', () => {
  it('holds exactly the built files, at the archive\'s root', async () => {
    const names = (await unzip(LIST_NAMES, zipFile)).trim().split(LINE_END)

    expect(names.sort()).toEqual(BUILT_FILES)
  })

  it('carries the manifest without the development key', async () => {
    const manifest = JSON.parse(await unzip(PRINT_FILE, zipFile, MANIFEST_FILE))

    expect(manifest.key).toBeUndefined()
    expect(manifest.name).toBe('Bookkeeper Tweaks')
    expect(manifest.permissions).toEqual(['storage'])
  })
})
