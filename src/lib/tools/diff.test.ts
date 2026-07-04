import { describe, expect, it } from 'vitest'
import { computeDiff, toUnifiedDiff } from './diff'

const opts = { ignoreWhitespace: false, ignoreCase: false }

describe('computeDiff', () => {
  it('marks identical inputs as all context with zero counts', () => {
    const result = computeDiff('a\nb', 'a\nb', opts)
    expect(result.addedCount).toBe(0)
    expect(result.removedCount).toBe(0)
    expect(result.lines.every((line) => line.kind === 'context')).toBe(true)
    expect(result.lines).toHaveLength(2)
    expect(result.lines[0]).toMatchObject({ oldLine: 1, newLine: 1 })
    expect(result.lines[1]).toMatchObject({ oldLine: 2, newLine: 2 })
  })

  it('reports a pure addition with correct kind and line numbers', () => {
    const result = computeDiff('a', 'a\nb', opts)
    expect(result.addedCount).toBe(1)
    expect(result.removedCount).toBe(0)
    expect(result.lines).toHaveLength(2)
    expect(result.lines[0]).toMatchObject({
      kind: 'context',
      oldLine: 1,
      newLine: 1,
    })
    const added = result.lines[1]
    expect(added.kind).toBe('added')
    expect(added.newLine).toBe(2)
    expect(added.oldLine).toBeUndefined()
    expect(added.spans.map((s) => s.text).join('')).toBe('b')
  })

  it('reports a pure removal with correct kind and line numbers', () => {
    const result = computeDiff('a\nb', 'a', opts)
    expect(result.addedCount).toBe(0)
    expect(result.removedCount).toBe(1)
    const removed = result.lines[1]
    expect(removed.kind).toBe('removed')
    expect(removed.oldLine).toBe(2)
    expect(removed.newLine).toBeUndefined()
    expect(removed.spans.map((s) => s.text).join('')).toBe('b')
  })

  it('pairs a modified line and marks only changed chars inline', () => {
    const result = computeDiff('foo', 'fox', opts)
    expect(result.removedCount).toBe(1)
    expect(result.addedCount).toBe(1)
    const [removed, added] = result.lines
    expect(removed.kind).toBe('removed')
    expect(added.kind).toBe('added')
    // removed side: "fo" unchanged, "o" changed
    expect(removed.spans).toEqual([
      { text: 'fo', changed: false },
      { text: 'o', changed: true },
    ])
    // added side: "fo" unchanged, "x" changed
    expect(added.spans).toEqual([
      { text: 'fo', changed: false },
      { text: 'x', changed: true },
    ])
  })

  it('does not char-pair runs of unequal length (whole-line spans)', () => {
    const result = computeDiff('a\nb', 'x\ny\nz', opts)
    expect(result.removedCount).toBe(2)
    expect(result.addedCount).toBe(3)
    for (const line of result.lines) {
      // no inline char diff → each line is a single whole-line changed span
      expect(line.spans).toHaveLength(1)
      expect(line.spans[0].changed).toBe(true)
    }
  })

  it('treats a trailing-whitespace-only change as context when ignoreWhitespace', () => {
    const result = computeDiff('a ', 'a', {
      ignoreWhitespace: true,
      ignoreCase: false,
    })
    expect(result.addedCount).toBe(0)
    expect(result.removedCount).toBe(0)
    expect(result.lines).toHaveLength(1)
    expect(result.lines[0].kind).toBe('context')
    // display keeps the original text (with the trailing space)
    expect(result.lines[0].spans.map((s) => s.text).join('')).toBe('a ')
  })

  it('treats case-only differences as context when ignoreCase, displaying original', () => {
    const result = computeDiff('Hello', 'hello', {
      ignoreWhitespace: false,
      ignoreCase: true,
    })
    expect(result.addedCount).toBe(0)
    expect(result.removedCount).toBe(0)
    expect(result.lines[0].kind).toBe('context')
    expect(result.lines[0].spans.map((s) => s.text).join('')).toBe('Hello')
  })

  it('does not highlight case-only char changes inside a modified pair when ignoreCase', () => {
    // whitespace forces the line to differ, but the case change must not highlight
    const result = computeDiff('Foo', 'foo ', {
      ignoreWhitespace: false,
      ignoreCase: true,
    })
    const removed = result.lines.find((l) => l.kind === 'removed')
    expect(removed).toBeDefined()
    // "Foo" vs "foo " under ignoreCase → only the trailing space differs, F/f is not changed
    expect(removed?.spans.some((s) => s.text === 'F' && s.changed)).toBe(false)
  })
})

describe('toUnifiedDiff', () => {
  it('produces a valid patch header and hunk', () => {
    const patch = toUnifiedDiff('a\n', 'b\n')
    expect(patch).toContain('@@')
    expect(patch).toContain('-a')
    expect(patch).toContain('+b')
  })
})
