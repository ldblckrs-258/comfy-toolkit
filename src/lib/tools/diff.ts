import { createTwoFilesPatch, diffChars, diffLines } from 'diff'

export type LineKind = 'context' | 'added' | 'removed'

export interface InlineSpan {
  text: string
  changed: boolean
}

export interface DiffLine {
  kind: LineKind
  oldLine?: number
  newLine?: number
  spans: Array<InlineSpan>
}

export interface DiffResult {
  lines: Array<DiffLine>
  addedCount: number
  removedCount: number
}

export interface DiffOptions {
  ignoreWhitespace: boolean
  ignoreCase: boolean
}

function normalize(text: string): string {
  return text
    .split('\n')
    .map((line) => `${line}\n`)
    .join('')
}

function ensureSpans(
  spans: Array<InlineSpan>,
  changed: boolean,
): Array<InlineSpan> {
  return spans.length > 0 ? spans : [{ text: '', changed }]
}

function inlineSpans(
  oldText: string,
  newText: string,
  ignoreCase: boolean,
): { removed: Array<InlineSpan>; added: Array<InlineSpan> } {
  const parts = diffChars(oldText, newText, { ignoreCase })
  const removed: Array<InlineSpan> = []
  const added: Array<InlineSpan> = []
  for (const part of parts) {
    if (!part.added)
      removed.push({ text: part.value, changed: Boolean(part.removed) })
    if (!part.removed)
      added.push({ text: part.value, changed: Boolean(part.added) })
  }
  return {
    removed: ensureSpans(removed, false),
    added: ensureSpans(added, false),
  }
}

export function computeDiff(
  oldText: string,
  newText: string,
  options: DiffOptions,
): DiffResult {
  const oldLines = oldText.split('\n')
  const newLines = newText.split('\n')
  const fold = (text: string) =>
    options.ignoreCase ? text.toLowerCase() : text

  const changes = diffLines(
    normalize(fold(oldText)),
    normalize(fold(newText)),
    {
      ignoreWhitespace: options.ignoreWhitespace,
    },
  )

  const lines: Array<DiffLine> = []
  let oldLine = 1
  let newLine = 1
  let addedCount = 0
  let removedCount = 0

  for (let i = 0; i < changes.length; i++) {
    const change = changes[i]
    const count = change.count

    if (change.removed) {
      const next = i + 1 < changes.length ? changes[i + 1] : undefined
      if (next && next.added && next.count === count) {
        for (let k = 0; k < count; k++) {
          const before = oldLines[oldLine - 1] ?? ''
          const after = newLines[newLine - 1] ?? ''
          const { removed, added } = inlineSpans(
            before,
            after,
            options.ignoreCase,
          )
          lines.push({ kind: 'removed', oldLine, spans: removed })
          lines.push({ kind: 'added', newLine, spans: added })
          oldLine++
          newLine++
          removedCount++
          addedCount++
        }
        i++
        continue
      }
      for (let k = 0; k < count; k++) {
        lines.push({
          kind: 'removed',
          oldLine,
          spans: [{ text: oldLines[oldLine - 1] ?? '', changed: true }],
        })
        oldLine++
        removedCount++
      }
      continue
    }

    if (change.added) {
      for (let k = 0; k < count; k++) {
        lines.push({
          kind: 'added',
          newLine,
          spans: [{ text: newLines[newLine - 1] ?? '', changed: true }],
        })
        newLine++
        addedCount++
      }
      continue
    }

    for (let k = 0; k < count; k++) {
      lines.push({
        kind: 'context',
        oldLine,
        newLine,
        spans: [{ text: oldLines[oldLine - 1] ?? '', changed: false }],
      })
      oldLine++
      newLine++
    }
  }

  return { lines, addedCount, removedCount }
}

export function toUnifiedDiff(oldText: string, newText: string): string {
  return createTwoFilesPatch('original', 'changed', oldText, newText)
}
