import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'
import fs from 'node:fs/promises'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const distDir = path.join(rootDir, 'dist')
const serverEntry = path.join(distDir, 'server', 'entry-server.js')

const routes = ['/', '/about', '/services', '/quote']

async function ensureEntry() {
  try {
    await fs.access(serverEntry)
  } catch (error) {
    throw new Error(`Missing server bundle at ${serverEntry}. Run the SSR build first.`)
  }
}

function resolveRoutePath(route) {
  if (route === '/') return path.join(distDir, 'index.html')
  const trimmed = route.replace(/^\/+/, '')
  return path.join(distDir, trimmed, 'index.html')
}

async function writeHtml(route, html) {
  const outputPath = resolveRoutePath(route)
  await fs.mkdir(path.dirname(outputPath), { recursive: true })
  await fs.writeFile(outputPath, html, 'utf-8')
}

async function main() {
  await ensureEntry()
  const template = await fs.readFile(path.join(distDir, 'index.html'), 'utf-8')
  const { render } = await import(pathToFileURL(serverEntry).href)

  await Promise.all(
    routes.map(async (route) => {
      const appHtml = render(route)
      const html = template.replace('<!--app-html-->', appHtml)
      await writeHtml(route, html)
    })
  )
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
