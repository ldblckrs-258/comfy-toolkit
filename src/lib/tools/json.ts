export type JsonIndent = 2 | 4 | 'tab'

export interface JsonResult {
  ok: boolean
  output: string
  error?: string
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Invalid JSON'
}

export function formatJson(input: string, indent: JsonIndent): JsonResult {
  if (!input.trim()) return { ok: true, output: '' }
  try {
    const parsed: unknown = JSON.parse(input)
    const space = indent === 'tab' ? '\t' : indent
    return { ok: true, output: JSON.stringify(parsed, null, space) }
  } catch (error) {
    return { ok: false, output: '', error: errorMessage(error) }
  }
}

export function minifyJson(input: string): JsonResult {
  if (!input.trim()) return { ok: true, output: '' }
  try {
    const parsed: unknown = JSON.parse(input)
    return { ok: true, output: JSON.stringify(parsed) }
  } catch (error) {
    return { ok: false, output: '', error: errorMessage(error) }
  }
}
