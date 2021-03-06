// Pre-render the app into static HTML.
// run `yarn generate` and then `dist/static` can be served as a static site.

import fs from 'fs'
import path from 'path'
import fg from 'fast-glob'

const toAbsolute = (p: string) => path.resolve(__dirname, p)
function ensureDirExist(filePath: string) {
  const dirname = path.dirname(filePath)
  if (fs.existsSync(dirname))
    return true

  ensureDirExist(dirname)
  fs.mkdirSync(dirname)
}

export async function build() {
  // @ts-ignore
  const manifest = await import('./dist/static/ssr-manifest.json')
  const template = fs.readFileSync(toAbsolute('dist/static/index.html'), 'utf-8')

  // @ts-ignore
  const { render } = await import('./dist/server/entry-server.js')

  const vite = await import('vite').then(i => i.createServer({
    server: {
      middlewareMode: true,
    },
  }))

  // determine routes to pre-render from src/pages
  const files = await fg('**/*.{vue,md}', { cwd: path.resolve(process.cwd(), 'src/pages') })

  const routesToPrerender = files
    .filter(i => !i.includes('['))
    .map((file) => {
      const name = file.replace(/\.(vue|md)$/, '').toLowerCase()
      return name === 'index' ? '/' : `/${name}`
    })

  console.log(routesToPrerender)

  // pre-render each route...
  for (const url of routesToPrerender) {
    const [appHtml, preloadLinks, head] = await render(url, manifest)

    const transformedTemplate = await vite.transformIndexHtml(url, template)

    const html = transformedTemplate
      .replace('<!--preload-links-->', preloadLinks)
      .replace('<!--head-meta-->', head.headTags)
      .replace('<!--app-html-->', appHtml)
      .replace('<html>', `<html${head.htmlAttrs}>`)
      .replace('<body>', `<body${head.bodyAttrs}>`)

    const filePath = `dist/static${url === '/' ? '/index' : url}.html`
    ensureDirExist(filePath)
    fs.writeFileSync(toAbsolute(filePath), html)
    console.log('pre-rendered:', filePath)
  }

  // done, delete ssr manifest
  fs.unlinkSync(toAbsolute('dist/static/ssr-manifest.json'))
}

build()
