import { describe, expect, it } from 'vitest'
import { convertData, parseData, stringifyData } from './data-converter'

describe('data-converter round-trips', () => {
  it('JSON → YAML → JSON preserves data', () => {
    const source = '{"name":"comfy","nested":{"a":1,"b":[1,2,3]},"flag":true}'
    const yaml = convertData(source, 'json', 'yaml')
    const back = convertData(yaml, 'yaml', 'json')
    expect(JSON.parse(back)).toEqual(JSON.parse(source))
  })

  it('JSON → TOML → JSON preserves data (object root)', () => {
    const source = '{"title":"cfg","server":{"host":"localhost","port":8080}}'
    const toml = convertData(source, 'json', 'toml')
    const back = convertData(toml, 'toml', 'json')
    expect(JSON.parse(back)).toEqual(JSON.parse(source))
  })

  it('JSON → CSV → JSON preserves data (array of flat objects, values as strings)', () => {
    const source = '[{"id":"1","name":"a"},{"id":"2","name":"b"}]'
    const csv = convertData(source, 'json', 'csv')
    const back = convertData(csv, 'csv', 'json')
    expect(JSON.parse(back)).toEqual([
      { id: '1', name: 'a' },
      { id: '2', name: 'b' },
    ])
  })
})

describe('YAML input', () => {
  it('resolves anchors and aliases', () => {
    const yaml = `defaults: &d\n  timeout: 30\nservice:\n  limits: *d\n  name: api\n`
    const value = parseData(yaml, 'yaml') as Record<
      string,
      Record<string, unknown>
    >
    expect(value.service.limits).toEqual({ timeout: 30 })
    expect(value.service.name).toBe('api')
  })

  it('throws on multi-document input', () => {
    const multi = `a: 1\n---\nb: 2\n`
    expect(() => parseData(multi, 'yaml')).toThrow(/multi/i)
  })

  it('treats a comment-only document as null (no undefined leak)', () => {
    expect(parseData('# just a comment\n', 'yaml')).toBeNull()
    expect(convertData('# just a comment\n', 'yaml', 'json')).toBe('null')
  })
})

describe('TOML output constraints', () => {
  it('throws with a path when a value is null', () => {
    expect(() => stringifyData({ server: { host: null } }, 'toml')).toThrow(
      /null.*server\.host/i,
    )
  })

  it('throws on an array root', () => {
    expect(() => stringifyData([1, 2, 3], 'toml')).toThrow(/root/i)
  })
})

describe('CSV parse (RFC 4180)', () => {
  it('handles quoted field with comma, embedded newline and escaped quote', () => {
    const csv = 'name,note\n"Smith, John","line1\nline2 ""quoted"""\n'
    const value = parseData(csv, 'csv') as Array<Record<string, string>>
    expect(value).toEqual([
      { name: 'Smith, John', note: 'line1\nline2 "quoted"' },
    ])
  })

  it('accepts CRLF the same as LF', () => {
    const lf = parseData('a,b\n1,2\n', 'csv')
    const crlf = parseData('a,b\r\n1,2\r\n', 'csv')
    expect(crlf).toEqual(lf)
    expect(crlf).toEqual([{ a: '1', b: '2' }])
  })

  it('ignores blank lines instead of emitting empty records', () => {
    expect(parseData('a,b\n1,2\n\n', 'csv')).toEqual([{ a: '1', b: '2' }])
  })

  it('strips a leading UTF-8 BOM from the first header', () => {
    const withBom = String.fromCharCode(0xfeff) + 'a,b\n1,2\n'
    expect(parseData(withBom, 'csv')).toEqual([{ a: '1', b: '2' }])
  })
})

describe('CSV output constraints', () => {
  it('unions keys across objects and fills missing with empty string', () => {
    const csv = stringifyData(
      [
        { a: '1', b: '2' },
        { a: '3', c: '4' },
      ],
      'csv',
    )
    expect(csv).toBe('a,b,c\r\n1,2,\r\n3,,4')
  })

  it('quotes fields containing comma, quote or newline', () => {
    const csv = stringifyData([{ v: 'a,b"c\nd' }], 'csv')
    expect(csv).toBe('v\r\n"a,b""c\nd"')
  })

  it('throws when a value is a nested object', () => {
    expect(() => stringifyData([{ a: { nested: true } }], 'csv')).toThrow(
      /flat objects/i,
    )
  })

  it('throws when the value is not an array', () => {
    expect(() => stringifyData({ a: 1 }, 'csv')).toThrow(
      /array of flat objects/i,
    )
  })
})

describe('invalid input error messages', () => {
  it('invalid JSON throws a useful message', () => {
    expect(() => parseData('{ not json', 'json')).toThrow(/JSON/i)
  })

  it('invalid YAML throws a useful message', () => {
    expect(() => parseData('a:\n b: [1, 2', 'yaml')).toThrow(/YAML/i)
  })

  it('invalid TOML throws a useful message', () => {
    expect(() => parseData('a = = 1', 'toml')).toThrow(/TOML/i)
  })
})

describe('same-format prettify', () => {
  it('json → json reformats with two-space indent', () => {
    expect(convertData('{"a":1}', 'json', 'json')).toBe('{\n  "a": 1\n}')
  })
})
