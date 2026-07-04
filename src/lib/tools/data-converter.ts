import { parse as parseToml, stringify as stringifyToml } from 'smol-toml'
import { parseAllDocuments, stringify as stringifyYaml } from 'yaml'

export type DataFormat = 'json' | 'yaml' | 'toml' | 'csv'

function messageOf(caught: unknown): string {
  return caught instanceof Error ? caught.message : String(caught)
}

export function parseData(input: string, format: DataFormat): unknown {
  switch (format) {
    case 'json':
      try {
        return JSON.parse(input)
      } catch (caught) {
        throw new Error(`Invalid JSON: ${messageOf(caught)}`)
      }
    case 'yaml':
      return parseYaml(input)
    case 'toml':
      try {
        return parseToml(input)
      } catch (caught) {
        throw new Error(`Invalid TOML: ${messageOf(caught)}`)
      }
    case 'csv':
      return parseCsv(input)
    default:
      throw new Error(`Unknown source format: ${String(format)}`)
  }
}

export function stringifyData(value: unknown, format: DataFormat): string {
  switch (format) {
    case 'json':
      return JSON.stringify(value, null, 2)
    case 'yaml':
      return stringifyYaml(value)
    case 'toml':
      return tomlStringify(value)
    case 'csv':
      return csvStringify(value)
    default:
      throw new Error(`Unknown target format: ${String(format)}`)
  }
}

export function convertData(
  input: string,
  from: DataFormat,
  to: DataFormat,
): string {
  return stringifyData(parseData(input, from), to)
}

function parseYaml(input: string): unknown {
  let docs
  try {
    docs = parseAllDocuments(input)
  } catch (caught) {
    throw new Error(`Invalid YAML: ${messageOf(caught)}`)
  }
  if (docs.length > 1) {
    throw new Error(
      'YAML input contains multiple documents; convert one document at a time.',
    )
  }
  if (docs.length === 0) return null
  const doc = docs[0]
  if (doc.errors.length > 0) {
    throw new Error(`Invalid YAML: ${doc.errors[0].message}`)
  }
  const value: unknown = doc.toJS()
  return value === undefined ? null : value
}

function tomlStringify(value: unknown): string {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('TOML requires an object at the root.')
  }
  const nullPath = findNullPath(value, '')
  if (nullPath) {
    throw new Error(`TOML cannot represent null values (at path ${nullPath})`)
  }
  return stringifyToml(value)
}

function findNullPath(value: unknown, path: string): string | null {
  if (value === null) return path || '(root)'
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      const found = findNullPath(value[i], `${path}[${i}]`)
      if (found) return found
    }
    return null
  }
  if (typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      const childPath = path ? `${path}.${key}` : key
      const found = findNullPath(child, childPath)
      if (found) return found
    }
  }
  return null
}

function parseCsv(input: string): Array<Record<string, string>> {
  const rows = parseCsvRows(input)
  if (rows.length === 0) return []
  const header = rows[0]
  return rows.slice(1).map((row) => {
    const record: Record<string, string> = {}
    header.forEach((key, index) => {
      record[key] = row[index] ?? ''
    })
    return record
  })
}

function parseCsvRows(source: string): Array<Array<string>> {
  const input = source.charCodeAt(0) === 0xfeff ? source.slice(1) : source
  const rows: Array<Array<string>> = []
  let row: Array<string> = []
  let field = ''
  let inQuotes = false
  let i = 0
  while (i < input.length) {
    const char = input[i]
    if (inQuotes) {
      if (char === '"') {
        if (input[i + 1] === '"') {
          field += '"'
          i += 2
          continue
        }
        inQuotes = false
        i++
        continue
      }
      field += char
      i++
      continue
    }
    if (char === '"') {
      inQuotes = true
      i++
      continue
    }
    if (char === ',') {
      row.push(field)
      field = ''
      i++
      continue
    }
    if (char === '\r' || char === '\n') {
      if (char === '\r' && input[i + 1] === '\n') i++
      if (field !== '' || row.length > 0) {
        row.push(field)
        rows.push(row)
      }
      field = ''
      row = []
      i++
      continue
    }
    field += char
    i++
  }
  if (field !== '' || row.length > 0) {
    row.push(field)
    rows.push(row)
  }
  return rows
}

function csvStringify(value: unknown): string {
  if (!Array.isArray(value)) {
    throw new Error('CSV requires an array of flat objects')
  }
  const header: Array<string> = []
  const seen = new Set<string>()
  for (const item of value) {
    if (item === null || typeof item !== 'object' || Array.isArray(item)) {
      throw new Error('CSV requires an array of flat objects')
    }
    for (const [key, cell] of Object.entries(item)) {
      if (cell !== null && typeof cell === 'object') {
        throw new Error('CSV requires an array of flat objects')
      }
      if (!seen.has(key)) {
        seen.add(key)
        header.push(key)
      }
    }
  }
  const lines = [header.map(csvEscape).join(',')]
  for (const item of value) {
    const record = item as Record<string, unknown>
    lines.push(
      header.map((key) => csvEscape(formatCell(record[key]))).join(','),
    )
  }
  return lines.join('\r\n')
}

function formatCell(cell: unknown): string {
  if (cell === null || cell === undefined) return ''
  return String(cell)
}

function csvEscape(field: string): string {
  if (/[",\r\n]/.test(field)) {
    return `"${field.replace(/"/g, '""')}"`
  }
  return field
}
