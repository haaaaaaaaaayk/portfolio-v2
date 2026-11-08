import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/* npm run dev only: the about text editor's Save button posts here, and the text is written to aboutText.json,
   which the published page reads. Only well-formed JSON with the four blocks is accepted. */
const ABOUT_TEXT = fileURLToPath(new URL('./src/variants/v11-trail/aboutText.json', import.meta.url))
function aboutTextSaver(): Plugin {
  return {
    name: 'about-text-saver',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__about-text', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          return res.end()
        }
        let body = ''
        req.on('data', (c) => (body += c))
        req.on('end', async () => {
          try {
            const data = JSON.parse(body)
            for (const k of ['location', 'hello', 'intro', 'more']) {
              if (typeof data?.[k]?.style !== 'string' || typeof data?.[k]?.color !== 'string') throw new Error(`bad ${k}`)
            }
            await writeFile(ABOUT_TEXT, JSON.stringify(data, null, 2) + '\n')
            res.statusCode = 204
            res.end()
          } catch (e) {
            res.statusCode = 400
            res.end(String(e))
          }
        })
      })
    },
  }
}

// base: './' so the build works on GitHub Pages (served from a sub-path)
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss(), aboutTextSaver()],
})
