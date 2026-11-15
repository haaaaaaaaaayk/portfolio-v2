// Bundles the site's real cursor engine and config into the Cursor Tuner, so the tuner runs exactly what ships.
// tools/cursor-tuner.src.html → tools/cursor-tuner.html
import { build } from 'vite'
import { readFileSync, writeFileSync } from 'node:fs'

const out = await build({
  configFile: false,
  logLevel: 'warn',
  build: {
    write: false,
    minify: true,
    lib: { entry: 'tools/cursor-entry.ts', name: 'CursorEngine', formats: ['iife'], fileName: 'engine' },
  },
})
const code = (Array.isArray(out) ? out[0] : out).output[0].code
const src = readFileSync('tools/cursor-tuner.src.html', 'utf8')
writeFileSync('tools/cursor-tuner.html', src.replace('/*__ENGINE__*/', () => code.replace(/<\/script/gi, '<\\/script')))
console.log('built tools/cursor-tuner.html')
