import { build } from 'esbuild'
import type { BuildOptions } from 'esbuild'
import { copyFile, mkdir, rm } from 'node:fs/promises'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const DIST_DIR = path.join(ROOT, 'dist')
// Content scripts cannot be ES modules, so every entry becomes a classic script
const BUNDLE_OPTIONS = {
  entryPoints: [
    { in: path.join(ROOT, 'src/entries/app.ts'), out: 'app' },
    { in: path.join(ROOT, 'src/entries/app.css'), out: 'app' },
    { in: path.join(ROOT, 'src/settings-page/settings.ts'), out: 'settings' },
  ],
  bundle: true,
  format: 'iife',
  target: 'chrome111',
  logLevel: 'warning',
} satisfies BuildOptions
const STATIC_FILES = ['manifest.json', 'src/settings-page/settings.html', 'src/settings-page/settings.css']

async function bundleEntries(outDir: string): Promise<void> {
  await build({ ...BUNDLE_OPTIONS, outdir: outDir })
}

async function copyStaticFiles(outDir: string): Promise<void> {
  const copies = STATIC_FILES.map((file) => copyFile(path.join(ROOT, file), path.join(outDir, path.basename(file))))

  await Promise.all(copies)
}

export async function buildExtension(outDir: string): Promise<void> {
  await rm(outDir, { recursive: true, force: true })
  await mkdir(outDir, { recursive: true })
  await bundleEntries(outDir)
  await copyStaticFiles(outDir)
}

if (import.meta.main) {
  await buildExtension(DIST_DIR)
}
