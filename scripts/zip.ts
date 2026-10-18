import { execFile } from 'node:child_process'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'
import { buildExtension } from './build.ts'

type Manifest = Record<string, unknown>

const ROOT = path.resolve(import.meta.dirname, '..')
const RELEASE_DIR = path.join(ROOT, 'release')
const STAGE_PREFIX = path.join(tmpdir(), 'bookkeeper-tweaks-pack-')
const MANIFEST_FILE = 'manifest.json'
const TEXT_ENCODING = 'utf8'
const JSON_INDENT = 2
const LINE_END = '\n'
// The development key fixes the extension's id in tests; the store gives the package an id of its own
const KEY_FIELD = 'key'
const ZIP_COMMAND = 'zip'
// -X leaves out the files' extra attributes, -r takes the folder whole, -q keeps quiet; run inside the folder, so the
// files sit at the archive's root
const ZIP_ARGUMENTS = (zipFile: string): string[] => ['-X', '-r', '-q', zipFile, '.']
const ZIP_NAME = (version: unknown): string => `bookkeeper-tweaks-${String(version)}.zip`
const run = promisify(execFile)

// The manifest as the store takes it: the same, without the development key
export function withoutKey(manifest: Manifest): Manifest {
  return Object.fromEntries(Object.entries(manifest).filter(([field]) => field !== KEY_FIELD))
}

async function readManifest(dir: string): Promise<Manifest> {
  return JSON.parse(await readFile(path.join(dir, MANIFEST_FILE), TEXT_ENCODING))
}

async function writeManifest(dir: string, manifest: Manifest): Promise<void> {
  await writeFile(path.join(dir, MANIFEST_FILE), JSON.stringify(manifest, null, JSON_INDENT) + LINE_END)
}

async function zipFolder(dir: string, zipFile: string): Promise<void> {
  await rm(zipFile, { force: true })
  await run(ZIP_COMMAND, ZIP_ARGUMENTS(zipFile), { cwd: dir })
}

// The store package at zipFile: a fresh build in a folder of its own, its manifest without the development key
export async function packExtension(zipFile: string): Promise<void> {
  const stageDir = await mkdtemp(STAGE_PREFIX)

  try {
    await buildExtension(stageDir)
    await writeManifest(stageDir, withoutKey(await readManifest(stageDir)))
    await zipFolder(stageDir, zipFile)
  } finally {
    await rm(stageDir, { recursive: true, force: true })
  }
}

// release/bookkeeper-tweaks-<version>.zip, with the version of the manifest
async function releaseFile(): Promise<string> {
  const manifest = await readManifest(ROOT)

  return path.join(RELEASE_DIR, ZIP_NAME(manifest.version))
}

if (import.meta.main) {
  await mkdir(RELEASE_DIR, { recursive: true })
  await packExtension(await releaseFile())
}
