import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { Resvg } from '@resvg/resvg-js'
import satori from 'satori'
import { html as toReactNode } from 'satori-html'

import { GROUP_LABELS, TOOLS } from '../src/lib/tools/registry.ts'
import type { ToolGroup, ToolMeta } from '../src/lib/tools/registry.ts'

const SITE_ACCENT = '#0d9488'

const SITE_DESCRIPTION =
  'A fast, offline-friendly console of developer and designer utilities — formatters, encoders, generators, and color tools that run entirely in your browser.'

const GROUP_HEX: Record<ToolGroup, string> = {
  formatters: '#0284c7',
  encoders: '#7c3aed',
  generators: '#059669',
  text: '#ea580c',
  color: '#db2777',
  date: '#d97706',
}

const rootDir = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(rootDir, 'public', 'og')
const manifestPath = join(outDir, '.manifest.json')

function readManifest(): Record<string, string> {
  if (!existsSync(manifestPath)) return {}
  try {
    return JSON.parse(readFileSync(manifestPath, 'utf8'))
  } catch {
    return {}
  }
}

const logoDataUri = `data:image/svg+xml;base64,${Buffer.from(
  readFileSync(join(rootDir, 'public', 'logo.svg')),
).toString('base64')}`

function cardHtml(opts: {
  accent: string
  eyebrow: string
  title: string
  description: string
}): string {
  const { accent, eyebrow, title, description } = opts
  return `
    <div style="width:1200px;height:630px;display:flex;flex-direction:column;justify-content:space-between;background:#ffffff;padding:80px;font-family:Jakarta;">
      <div style="display:flex;flex-direction:column;">
        <div style="display:flex;color:${accent};font-size:28px;font-weight:700;letter-spacing:4px;">${eyebrow}</div>
        <div style="display:flex;color:#0b0e14;font-size:88px;font-weight:700;margin-top:28px;">${title}</div>
        <div style="display:flex;color:#5b647a;font-size:36px;font-weight:400;margin-top:24px;max-width:940px;line-height:1.4;">${description}</div>
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;">
        <div style="display:flex;align-items:center;">
          <img src="${logoDataUri}" style="width:64px;height:64px;margin-right:20px;" />
          <div style="display:flex;font-size:38px;font-weight:700;">
            <span style="color:#0b0e14;">Comfy</span>
            <span style="color:${SITE_ACCENT};">Toolkit</span>
          </div>
        </div>
        <div style="display:flex;height:8px;width:220px;background:${accent};border-radius:999px;"></div>
      </div>
    </div>`
}

async function loadFont(weight: number): Promise<ArrayBuffer> {
  const api = `https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@${weight}`
  const css = await (
    await fetch(api, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0)',
      },
    })
  ).text()
  const url = css.match(
    /src:\s*url\((.+?)\)\s*format\('(?:woff|truetype|opentype)'\)/,
  )?.[1]
  if (!url) throw new Error(`Could not resolve font url for weight ${weight}`)
  return await (await fetch(url)).arrayBuffer()
}

async function renderPng(html: string, fonts: Array<any>): Promise<Uint8Array> {
  const markup = toReactNode(html) as any
  const svg = await satori(markup, { width: 1200, height: 630, fonts })
  return new Resvg(svg).render().asPng()
}

async function main(): Promise<void> {
  mkdirSync(outDir, { recursive: true })

  const [bold, regular] = await Promise.all([loadFont(700), loadFont(400)])
  const fonts = [
    { name: 'Jakarta', data: bold, weight: 700, style: 'normal' },
    { name: 'Jakarta', data: regular, weight: 400, style: 'normal' },
  ]

  const cards: Array<{ file: string; html: string }> = [
    {
      file: 'default',
      html: cardHtml({
        accent: SITE_ACCENT,
        eyebrow: 'DEVELOPER & DESIGNER TOOLS',
        title: 'ComfyToolkit',
        description: SITE_DESCRIPTION,
      }),
    },
    ...TOOLS.map((tool: ToolMeta) => ({
      file: tool.id,
      html: cardHtml({
        accent: GROUP_HEX[tool.group],
        eyebrow: GROUP_LABELS[tool.group].toUpperCase(),
        title: tool.name,
        description: tool.description,
      }),
    })),
  ]

  const manifest = readManifest()
  const next: Record<string, string> = {}
  let written = 0

  for (const card of cards) {
    const hash = createHash('sha256').update(card.html).digest('hex')
    next[card.file] = hash
    const pngPath = join(outDir, `${card.file}.png`)
    if (manifest[card.file] === hash && existsSync(pngPath)) {
      console.log(`og: ${card.file}.png (unchanged, skipped)`)
      continue
    }
    const png = await renderPng(card.html, fonts)
    writeFileSync(pngPath, png)
    written += 1
    console.log(`og: ${card.file}.png (${(png.length / 1024).toFixed(0)} KiB)`)
  }

  writeFileSync(manifestPath, `${JSON.stringify(next, null, 2)}\n`)
  console.log(
    `Generated ${written}/${cards.length} OG images → public/og/ (${cards.length - written} unchanged)`,
  )
}

await main()
