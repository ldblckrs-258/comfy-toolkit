import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'
import { injectManifest } from 'workbox-build'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const clientDir = join(root, 'dist', 'client')
const swDest = join(clientDir, 'sw.js')

await build({
  entryPoints: [join(root, 'src', 'sw.ts')],
  outfile: swDest,
  bundle: true,
  format: 'iife',
  target: 'es2020',
  minify: true,
})

const { count, size, warnings } = await injectManifest({
  swSrc: swDest,
  swDest,
  globDirectory: clientDir,
  globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,json}'],
  globIgnores: ['og/**', 'sw.js', 'workbox-*.js'],
  maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
})

for (const w of warnings) console.warn(w)
console.log(
  `sw.js: precached ${count} files (${(size / 1024 / 1024).toFixed(2)} MiB)`,
)
