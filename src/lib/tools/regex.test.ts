import { describe, expect, it } from 'vitest'
import { MATCH_CAP, runRegex } from './regex'

describe('runRegex matching', () => {
  it('returns each global match with correct offsets, not just text', () => {
    const result = runRegex({ pattern: '\\d+', flags: 'g', text: 'a1b22c' })
    expect(result.error).toBeUndefined()
    expect(result.matches.map((m) => [m.value, m.start, m.end])).toEqual([
      ['1', 1, 2],
      ['22', 3, 5],
    ])
  })

  it('captures numbered groups with values and offsets', () => {
    const result = runRegex({ pattern: '(\\w)(\\d)', flags: '', text: 'a1' })
    const [match] = result.matches
    expect(match.groups.map((g) => g.value)).toEqual(['a', '1'])
    expect(match.groups[0]).toMatchObject({ value: 'a', start: 0, end: 1 })
    expect(match.groups[1]).toMatchObject({ value: '1', start: 1, end: 2 })
  })

  it('captures named groups by name', () => {
    const result = runRegex({
      pattern: '(?<y>\\d{4})-(?<m>\\d{2})',
      flags: '',
      text: '2026-06',
    })
    const [match] = result.matches
    expect(match.named.y).toMatchObject({ value: '2026', start: 0, end: 4 })
    expect(match.named.m).toMatchObject({ value: '06', start: 5, end: 7 })
  })

  it('labels the numbered group array with its name so the UI can display it', () => {
    const result = runRegex({
      pattern: '(?<year>\\d{4})',
      flags: '',
      text: '2026',
    })
    expect(result.matches[0].groups[0]).toMatchObject({
      name: 'year',
      value: '2026',
    })
  })

  it('marks a non-participating optional group as undefined / -1', () => {
    const result = runRegex({ pattern: '(a)?(b)', flags: '', text: 'b' })
    const [match] = result.matches
    expect(match.groups[0]).toMatchObject({
      value: undefined,
      start: -1,
      end: -1,
    })
    expect(match.groups[1]).toMatchObject({ value: 'b' })
  })

  it('returns only the first match without the g/y flags', () => {
    const result = runRegex({ pattern: '\\d', flags: '', text: 'a1b2' })
    expect(result.matches).toHaveLength(1)
    expect(result.matches[0].value).toBe('1')
  })
})

describe('runRegex flags', () => {
  it('ignore-case (i) changes whether a pattern matches', () => {
    expect(
      runRegex({ pattern: 'A', flags: '', text: 'a' }).matches,
    ).toHaveLength(0)
    expect(
      runRegex({ pattern: 'A', flags: 'i', text: 'a' }).matches,
    ).toHaveLength(1)
  })

  it('multiline (m) anchors per line', () => {
    expect(
      runRegex({ pattern: '^b', flags: '', text: 'a\nb' }).matches,
    ).toHaveLength(0)
    expect(
      runRegex({ pattern: '^b', flags: 'm', text: 'a\nb' }).matches,
    ).toHaveLength(1)
  })

  it('dotall (s) lets . span newlines', () => {
    expect(
      runRegex({ pattern: 'a.b', flags: '', text: 'a\nb' }).matches,
    ).toHaveLength(0)
    expect(
      runRegex({ pattern: 'a.b', flags: 's', text: 'a\nb' }).matches,
    ).toHaveLength(1)
  })
})

describe('runRegex replace', () => {
  it('honors $1 / $2 reordering tokens', () => {
    const result = runRegex({
      pattern: '(\\w)(\\d)',
      flags: 'g',
      text: 'a1 b2',
      replacement: '$2$1',
    })
    expect(result.replaced).toBe('1a 2b')
  })

  it('honors named $<name>, $& whole-match, and $$ literal tokens', () => {
    expect(
      runRegex({
        pattern: '(?<y>\\d{4})-(?<m>\\d{2})',
        flags: '',
        text: '2026-06',
        replacement: '$<m>/$<y>',
      }).replaced,
    ).toBe('06/2026')
    expect(
      runRegex({
        pattern: '\\d+',
        flags: 'g',
        text: 'x1y',
        replacement: '[$&]',
      }).replaced,
    ).toBe('x[1]y')
    expect(
      runRegex({ pattern: 'a', flags: '', text: 'a', replacement: '$$' })
        .replaced,
    ).toBe('$')
  })

  it('replaces only the first match without g, all matches with g', () => {
    expect(
      runRegex({ pattern: 'a', flags: '', text: 'aaa', replacement: 'x' })
        .replaced,
    ).toBe('xaa')
    expect(
      runRegex({ pattern: 'a', flags: 'g', text: 'aaa', replacement: 'x' })
        .replaced,
    ).toBe('xxx')
  })
})

describe('runRegex safety', () => {
  it('reports invalid patterns instead of throwing', () => {
    const result = runRegex({ pattern: '(', flags: '', text: 'abc' })
    expect(result.error).toBeTruthy()
    expect(result.matches).toHaveLength(0)
  })

  it('terminates on zero-width global matches without infinite loop', () => {
    const result = runRegex({ pattern: 'a*', flags: 'g', text: 'abc' })
    expect(result.matches.length).toBeGreaterThan(0)
    expect(result.matches.length).toBeLessThan(MATCH_CAP)
  })

  it('caps match count and flags truncation', () => {
    const text = 'a'.repeat(MATCH_CAP + 1)
    const result = runRegex({ pattern: '.', flags: 'g', text })
    expect(result.truncated).toBe(true)
    expect(result.matches).toHaveLength(MATCH_CAP)
  })
})
