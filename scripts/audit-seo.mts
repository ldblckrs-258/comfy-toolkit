import { jaccard, shingles, words } from './content-metrics.mts'

const base = (process.argv[2] ?? 'http://localhost:8788').replace(/\/$/, '')

const FLOOR = {
  guide: 800,
  variant: 250,
  category: 300,
  tool: 400,
  index: 0,
}

function classify(path: string): keyof typeof FLOOR {
  if (path === '/' || path === '/tools' || path === '/guides') return 'index'
  if (path.startsWith('/guides/')) return 'guide'
  if (path.startsWith('/categories/')) return 'category'
  if (/^\/tools\/[^/]+\/[^/]+$/.test(path)) return 'variant'
  return 'tool'
}

function textOf(html: string): string {
  const body = html.slice(html.indexOf('<body'))
  return body
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

async function main(): Promise<void> {
  const sitemap = await (await fetch(`${base}/sitemap.xml`)).text()
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) =>
    m[1].replace(/^https?:\/\/[^/]+/, base),
  )
  if (urls.length === 0) throw new Error('sitemap returned no URLs')

  const failures: Array<string> = []
  const titles = new Map<string, string>()
  const descriptions = new Map<string, string>()
  const bodies = new Map<string, string>()
  const links = new Set<string>()

  // The sidebar repeats on every page. Measure it once so it can be subtracted:
  // counting it would let a genuinely thin page pass.
  let boilerplate = 0

  for (const url of urls) {
    const path = url.replace(base, '') || '/'
    const res = await fetch(url)
    const html = await res.text()

    if (res.status !== 200) failures.push(`${path}: status ${res.status}`)

    const title = /<title>(.*?)<\/title>/s.exec(html)?.[1]
    if (!title) failures.push(`${path}: no title`)
    else {
      const seen = titles.get(title)
      if (seen) failures.push(`${path}: title duplicates ${seen}`)
      titles.set(title, path)
      if (title.length > 70)
        failures.push(`${path}: title ${title.length} chars`)
    }

    const desc = /<meta name="description" content="(.*?)"/s.exec(html)?.[1]
    if (!desc) failures.push(`${path}: no description`)
    else {
      const seen = descriptions.get(desc)
      if (seen) failures.push(`${path}: description duplicates ${seen}`)
      descriptions.set(desc, path)
      if (desc.length < 110 || desc.length > 175) {
        failures.push(`${path}: description ${desc.length} chars`)
      }
    }

    const canonical = /rel="canonical" href="([^"]+)"/.exec(html)?.[1]
    const expected = `https://comfytk.com${path === '/' ? '/' : path}`
    if (canonical !== expected) {
      failures.push(`${path}: canonical ${canonical} expected ${expected}`)
    }

    const ld = [
      ...html.matchAll(/application\/ld\+json">([\s\S]*?)<\/script>/g),
    ]
    if (ld.length !== 1) failures.push(`${path}: ${ld.length} ld+json blocks`)
    else {
      try {
        JSON.parse(ld[0][1])
      } catch {
        failures.push(`${path}: ld+json does not parse`)
      }
    }

    const og = /property="og:image" content="([^"]+)"/.exec(html)?.[1]
    if (!og) failures.push(`${path}: no og:image`)

    const text = textOf(html)
    bodies.set(path, text)
    if (path === '/') boilerplate = 0
    for (const m of html.matchAll(/href="(\/[^"#?]*)"/g)) links.add(m[1])
  }

  // Longest common prefix across two unrelated pages approximates the shared shell.
  const sample = [...bodies.entries()].filter(([p]) => p.startsWith('/tools/'))
  if (sample.length >= 2) {
    const [, a] = sample[0]
    const [, b] = sample[sample.length - 1]
    let i = 0
    while (i < a.length && i < b.length && a[i] === b[i]) i++
    boilerplate = words(a.slice(0, i)).length
  }

  for (const [path, text] of bodies) {
    const unique = words(text).length - boilerplate
    const floor = FLOOR[classify(path)]
    if (unique < floor)
      failures.push(`${path}: ${unique} words, floor ${floor}`)
  }

  const grams = [...bodies].map(([p, t]) => [p, shingles(t)] as const)
  let worst = { pair: '', score: 0 }
  for (let i = 0; i < grams.length; i++) {
    for (let j = i + 1; j < grams.length; j++) {
      const score = jaccard(grams[i][1], grams[j][1])
      if (score > worst.score) {
        worst = { pair: `${grams[i][0]} ~ ${grams[j][0]}`, score }
      }
    }
  }

  const known = new Set(urls.map((u) => u.replace(base, '') || '/'))
  for (const link of links) {
    if (known.has(link)) continue
    const res = await fetch(base + link, { method: 'GET' })
    if (res.status !== 200)
      failures.push(`broken internal link ${link} (${res.status})`)
  }

  console.log(`audited ${urls.length} urls against ${base}`)
  console.log(`shared shell measured at ${boilerplate} words and subtracted`)
  console.log(`internal links checked: ${links.size}`)
  console.log(
    `max rendered similarity ${worst.score.toFixed(3)} (${worst.pair})`,
  )

  if (failures.length > 0) {
    console.error(`\naudit FAILED with ${failures.length} problems:`)
    for (const f of failures) console.error('  ' + f)
    process.exit(1)
  }
  console.log('\nall checks passed')
}

await main()
