export interface UrlParam {
  key: string
  value: string
}

export interface UrlParts {
  protocol: string
  hostname: string
  port: string
  pathname: string
  hash: string
  username: string
  password: string
  params: Array<UrlParam>
}

export function parseUrl(input: string): UrlParts {
  const url = new URL(input)
  const params: Array<UrlParam> = []
  for (const [key, value] of url.searchParams.entries()) {
    params.push({ key, value })
  }
  return {
    protocol: url.protocol,
    hostname: url.hostname,
    port: url.port,
    pathname: url.pathname,
    hash: url.hash,
    username: url.username,
    password: url.password,
    params,
  }
}

export function buildUrl(parts: UrlParts): string {
  const auth =
    parts.username || parts.password
      ? `${parts.username}${parts.password ? `:${parts.password}` : ''}@`
      : ''
  const host = parts.port ? `${parts.hostname}:${parts.port}` : parts.hostname
  const query = parts.params.length
    ? `?${parts.params
        .map(
          (param) =>
            `${encodeURIComponent(param.key)}=${encodeURIComponent(param.value)}`,
        )
        .join('&')}`
    : ''
  return `${parts.protocol}//${auth}${host}${parts.pathname}${query}${parts.hash}`
}

export type UrlTokenType =
  | 'protocol'
  | 'auth'
  | 'host'
  | 'port'
  | 'path'
  | 'punct'
  | 'query-key'
  | 'query-value'
  | 'hash'
  | 'text'

export interface UrlToken {
  text: string
  type: UrlTokenType
}

function tokenizeAuthority(
  authority: string,
  push: (text: string, type: UrlTokenType) => void,
): void {
  let rest = authority
  const atIndex = rest.lastIndexOf('@')
  if (atIndex >= 0) {
    push(rest.slice(0, atIndex + 1), 'auth')
    rest = rest.slice(atIndex + 1)
  }

  if (rest.startsWith('[')) {
    const close = rest.indexOf(']')
    if (close >= 0) {
      push(rest.slice(0, close + 1), 'host')
      const after = rest.slice(close + 1)
      if (after.startsWith(':')) {
        push(':', 'punct')
        push(after.slice(1), 'port')
      } else {
        push(after, 'host')
      }
      return
    }
  }

  const colon = rest.indexOf(':')
  if (colon >= 0) {
    push(rest.slice(0, colon), 'host')
    push(':', 'punct')
    push(rest.slice(colon + 1), 'port')
  } else {
    push(rest, 'host')
  }
}

function tokenizeQuery(
  query: string,
  push: (text: string, type: UrlTokenType) => void,
): void {
  push('?', 'punct')
  const pairs = query.slice(1).split('&')
  pairs.forEach((pair, index) => {
    if (index > 0) push('&', 'punct')
    const eq = pair.indexOf('=')
    if (eq >= 0) {
      push(pair.slice(0, eq), 'query-key')
      push('=', 'punct')
      push(pair.slice(eq + 1), 'query-value')
    } else {
      push(pair, 'query-key')
    }
  })
}

/** Lex a raw URL string into colorable segments. Lenient: works on partial
 * input and always satisfies `tokens.map(t => t.text).join('') === input`. */
export function tokenizeUrl(input: string): Array<UrlToken> {
  const tokens: Array<UrlToken> = []
  const push = (text: string, type: UrlTokenType) => {
    if (text) tokens.push({ text, type })
  }

  let rest = input
  let schemePresent = false
  let slashesPresent = false

  const scheme = /^[a-zA-Z][a-zA-Z\d+.-]*:/.exec(rest)
  if (scheme) {
    push(scheme[0], 'protocol')
    rest = rest.slice(scheme[0].length)
    schemePresent = true
    if (rest.startsWith('//')) {
      push('//', 'punct')
      rest = rest.slice(2)
      slashesPresent = true
    }
  }

  let fragment = ''
  const hashIndex = rest.indexOf('#')
  if (hashIndex >= 0) {
    fragment = rest.slice(hashIndex)
    rest = rest.slice(0, hashIndex)
  }

  let query = ''
  const queryIndex = rest.indexOf('?')
  if (queryIndex >= 0) {
    query = rest.slice(queryIndex)
    rest = rest.slice(0, queryIndex)
  }

  if (slashesPresent || !schemePresent) {
    const slashIndex = rest.indexOf('/')
    const authority = slashIndex >= 0 ? rest.slice(0, slashIndex) : rest
    const path = slashIndex >= 0 ? rest.slice(slashIndex) : ''
    tokenizeAuthority(authority, push)
    push(path, 'path')
  } else {
    push(rest, 'path')
  }

  if (query) tokenizeQuery(query, push)
  push(fragment, 'hash')

  return tokens
}

export function encodeComponent(input: string): string {
  return encodeURIComponent(input)
}

export function decodeComponent(input: string): string {
  return decodeURIComponent(input)
}

export function encodeFullUrl(input: string): string {
  return encodeURI(input)
}

export function decodeFullUrl(input: string): string {
  return decodeURI(input)
}
