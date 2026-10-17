import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { buildExtension } from '../../scripts/build.ts'

interface BuiltManifest {
  manifest_version: number
  permissions: string[]
  host_permissions?: string[]
  content_scripts: { js: string[] }[]
}

const TEMP_PREFIX = path.join(tmpdir(), 'bookkeeper-tweaks-build-')
const MANIFEST_FILE = 'manifest.json'
const TEXT_ENCODING = 'utf8'
const MODULE_SYNTAX = /^\s*(import|export)\b/m
let outDir = ''

async function readBuilt(file: string): Promise<string> {
  return readFile(path.join(outDir, file), TEXT_ENCODING)
}

async function readManifest(): Promise<BuiltManifest> {
  return JSON.parse(await readBuilt(MANIFEST_FILE))
}

beforeAll(async () => {
  outDir = await mkdtemp(TEMP_PREFIX)
  await buildExtension(outDir)
})

afterAll(async () => {
  await rm(outDir, { recursive: true, force: true })
})

describe('the built manifest', () => {
  it('is a Manifest V3 extension', async () => {
    expect((await readManifest()).manifest_version).toBe(3)
  })

  it('asks for storage and nothing else', async () => {
    const manifest = await readManifest()

    expect(manifest.permissions).toEqual(['storage'])
    expect(manifest.host_permissions).toBeUndefined()
  })

  it('builds every content script as a classic script', async () => {
    const files = (await readManifest()).content_scripts.flatMap((script) => script.js)
    const sources = await Promise.all(files.map(readBuilt))

    expect(files).toContain('app.js')
    expect(sources.filter((source) => MODULE_SYNTAX.test(source))).toEqual([])
  })
})
