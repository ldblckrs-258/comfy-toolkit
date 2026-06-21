export const MATCH_CAP = 10000

export interface RegexGroup {
  name?: string
  value: string | undefined
  start: number
  end: number
}

export interface RegexMatch {
  start: number
  end: number
  value: string
  groups: Array<RegexGroup>
  named: Record<string, RegexGroup>
}

export interface RegexInput {
  pattern: string
  flags: string
  text: string
  replacement?: string
}

export interface RegexResult {
  matches: Array<RegexMatch>
  replaced?: string
  error?: string
  truncated: boolean
}

type Indices = Array<[number, number] | undefined> & {
  groups?: Record<string, [number, number] | undefined>
}

function toGroup(
  value: string | undefined,
  pair: [number, number] | undefined,
  name?: string,
): RegexGroup {
  if (!pair) return { name, value: undefined, start: -1, end: -1 }
  return { name, value, start: pair[0], end: pair[1] }
}

function toMatch(m: RegExpExecArray): RegexMatch {
  const indices = (m as RegExpExecArray & { indices?: Indices }).indices ?? []
  const whole = indices[0] ?? [m.index, m.index + m[0].length]

  const nameByPos = new Map<string, string>()
  const named: Record<string, RegexGroup> = {}
  if (m.groups) {
    for (const name of Object.keys(m.groups)) {
      const pair = indices.groups?.[name]
      named[name] = toGroup(m.groups[name], pair, name)
      if (pair) nameByPos.set(`${pair[0]}:${pair[1]}`, name)
    }
  }

  const groups: Array<RegexGroup> = []
  for (let i = 1; i < m.length; i++) {
    const pair = indices[i]
    const name = pair ? nameByPos.get(`${pair[0]}:${pair[1]}`) : undefined
    groups.push(toGroup(m[i], pair, name))
  }

  return { start: whole[0], end: whole[1], value: m[0], groups, named }
}

export function runRegex(input: RegexInput): RegexResult {
  const { pattern, text, replacement } = input
  if (!pattern) return { matches: [], truncated: false }

  const flags = input.flags.includes('d') ? input.flags : input.flags + 'd'
  let re: RegExp
  try {
    re = new RegExp(pattern, flags)
  } catch (error) {
    return {
      matches: [],
      truncated: false,
      error: error instanceof Error ? error.message : 'Invalid pattern',
    }
  }

  const matches: Array<RegexMatch> = []
  let truncated = false
  const iterates = /[gy]/.test(re.flags)

  if (iterates) {
    let m: RegExpExecArray | null
    while ((m = re.exec(text)) !== null) {
      matches.push(toMatch(m))
      if (m.index === re.lastIndex) re.lastIndex++
      if (matches.length >= MATCH_CAP) {
        truncated = true
        break
      }
    }
  } else {
    const m = re.exec(text)
    if (m) matches.push(toMatch(m))
  }

  let replaced: string | undefined
  if (replacement !== undefined) {
    re.lastIndex = 0
    replaced = text.replace(re, replacement)
  }

  return { matches, replaced, truncated }
}
