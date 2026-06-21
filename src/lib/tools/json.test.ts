import { describe, expect, it } from 'vitest'
import { formatJson, minifyJson } from './json'

describe('formatJson', () => {
  it('pretty-prints valid JSON with the chosen indent', () => {
    expect(formatJson('{"a":1}', 2).output).toBe('{\n  "a": 1\n}')
    expect(formatJson('{"a":1}', 'tab').output).toBe('{\n\t"a": 1\n}')
  })

  it('reports an error for invalid JSON instead of throwing', () => {
    const result = formatJson('{bad', 2)
    expect(result.ok).toBe(false)
    expect(result.error).toBeTruthy()
    expect(result.output).toBe('')
  })

  it('treats empty input as a valid empty result', () => {
    expect(formatJson('   ', 2)).toEqual({ ok: true, output: '' })
  })
})

describe('minifyJson', () => {
  it('removes insignificant whitespace', () => {
    expect(minifyJson('{ "a" : 1 , "b" : [ 2 ] }').output).toBe(
      '{"a":1,"b":[2]}',
    )
  })
})
