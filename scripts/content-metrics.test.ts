import { describe, expect, it } from 'vitest'

import {
  jaccard,
  shingles,
  stripBoilerplate,
  words,
} from './content-metrics.mts'

describe('stripBoilerplate', () => {
  it('removes shared phrases so they cannot inflate similarity', () => {
    expect(stripBoilerplate('Runs it in your browser today')).not.toContain(
      'in your browser',
    )
  })
})

describe('words', () => {
  it('ignores punctuation and case when counting', () => {
    expect(words('Hello, WORLD! Hello.')).toEqual(['hello', 'world', 'hello'])
  })

  it('returns an empty array for empty input rather than [""]', () => {
    expect(words('   ')).toEqual([])
  })
})

describe('jaccard', () => {
  it('is 1 for identical text', () => {
    const a = shingles('the quick brown fox jumps over the lazy dog')
    expect(jaccard(a, a)).toBe(1)
  })

  it('is 0 for text with no shared five-word run', () => {
    const a = shingles('alpha beta gamma delta epsilon zeta')
    const b = shingles('one two three four five six')
    expect(jaccard(a, b)).toBe(0)
  })

  it('is 0 when either side is too short to form a shingle', () => {
    expect(jaccard(shingles('too short'), shingles('also brief'))).toBe(0)
  })

  it('rises as two texts share more consecutive runs', () => {
    const base = 'the quick brown fox jumps over the lazy dog again and again'
    const near = 'the quick brown fox jumps over the lazy cat again and again'
    const far =
      'completely different wording with nothing shared at all here now'
    expect(jaccard(shingles(base), shingles(near))).toBeGreaterThan(
      jaccard(shingles(base), shingles(far)),
    )
  })
})
