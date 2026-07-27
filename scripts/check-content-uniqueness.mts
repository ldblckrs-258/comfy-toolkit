import { readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { jaccard, shingles, words } from './content-metrics.mts'

import type { ToolContent } from '../src/content/types.ts'

const TOOL_WORD_FLOOR = 400
const SIMILARITY_CEILING = 0.35

const rootDir = join(dirname(fileURLToPath(import.meta.url)), '..')
const toolContentDir = join(rootDir, 'src', 'content', 'tools')

function flatten(content: ToolContent): string {
  const parts: Array<string> = [...content.intro]
  for (const section of content.sections) {
    parts.push(section.heading)
    if (section.paragraphs) parts.push(...section.paragraphs)
    if (section.bullets) parts.push(...section.bullets)
    if (section.code) parts.push(section.code.body)
  }
  for (const item of content.faq) parts.push(item.q, item.a)
  for (const link of content.related) parts.push(link.anchor)
  return parts.join(' ')
}

async function main(): Promise<void> {
  const files = readdirSync(toolContentDir).filter(
    (f: string) => f.endsWith('.ts') && f !== 'index.ts',
  )
  const pages: Array<{ id: string; text: string; count: number }> = []

  for (const file of files) {
    const mod = await import(join(toolContentDir, file))
    const content = Object.values(mod)[0] as ToolContent
    const text = flatten(content)
    pages.push({
      id: file.replace(/\.ts$/, ''),
      text,
      count: words(text).length,
    })
  }

  const failures: Array<string> = []

  for (const page of pages) {
    if (page.count < TOOL_WORD_FLOOR) {
      failures.push(
        `${page.id}: ${page.count} words, floor is ${TOOL_WORD_FLOOR}`,
      )
    }
  }

  const grams = new Map(pages.map((p) => [p.id, shingles(p.text)]))
  let worst = { pair: '', score: 0 }

  for (let i = 0; i < pages.length; i++) {
    for (let j = i + 1; j < pages.length; j++) {
      const a = pages[i]
      const b = pages[j]
      const score = jaccard(grams.get(a.id)!, grams.get(b.id)!)
      if (score > worst.score) worst = { pair: `${a.id} ~ ${b.id}`, score }
      if (score > SIMILARITY_CEILING) {
        failures.push(
          `${a.id} ~ ${b.id}: similarity ${score.toFixed(3)} exceeds ${SIMILARITY_CEILING}`,
        )
      }
    }
  }

  const total = pages.reduce((sum, p) => sum + p.count, 0)
  console.log(
    `content: ${pages.length} pages, ${total} words, min ${Math.min(
      ...pages.map((p) => p.count),
    )}, max similarity ${worst.score.toFixed(3)} (${worst.pair})`,
  )

  if (failures.length > 0) {
    console.error('\ncontent gate FAILED:')
    for (const line of failures) console.error('  ' + line)
    process.exit(1)
  }
}

await main()
