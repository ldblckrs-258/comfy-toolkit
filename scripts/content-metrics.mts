export const BOILERPLATE: Array<string> = [
  'Frequently asked questions',
  'Related tools',
  'runs entirely in your browser',
  'in your browser',
  'is not uploaded',
  'never leaves your machine',
]

export function stripBoilerplate(text: string): string {
  let out = text
  for (const phrase of BOILERPLATE) {
    out = out.split(phrase).join(' ')
  }
  return out
}

export function normalize(text: string): string {
  return stripBoilerplate(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function words(text: string): Array<string> {
  const n = normalize(text)
  return n ? n.split(' ') : []
}

export function shingles(text: string, size = 5): Set<string> {
  const w = words(text)
  const out = new Set<string>()
  for (let i = 0; i + size <= w.length; i++) {
    out.add(w.slice(i, i + size).join(' '))
  }
  return out
}

export function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0
  let shared = 0
  for (const item of a) if (b.has(item)) shared++
  return shared / (a.size + b.size - shared)
}
