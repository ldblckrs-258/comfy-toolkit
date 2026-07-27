import type { LucideIcon } from 'lucide-react'
import {
  AlarmClock,
  ArrowLeftRight,
  Binary,
  Blend,
  Braces,
  CalendarClock,
  Clock,
  Code2,
  Contrast,
  FileSignature,
  FileText,
  Fingerprint,
  GitCompareArrows,
  Hash,
  KeyRound,
  KeySquare,
  Link,
  Palette,
  QrCode,
  Regex,
  ScanSearch,
  SwatchBook,
} from 'lucide-react'

export type ToolGroup =
  | 'formatters'
  | 'encoders'
  | 'generators'
  | 'text'
  | 'color'
  | 'date'

export interface ToolMeta {
  id: string
  name: string
  description: string
  metaDescription?: string
  group: ToolGroup
  tags: Array<string>
  keywords?: Array<string>
  icon: LucideIcon
  to: string
}

export const GROUP_COLORS: Record<ToolGroup, string> = {
  formatters: 'var(--tool-formatters)',
  encoders: 'var(--tool-encoders)',
  generators: 'var(--tool-generators)',
  text: 'var(--tool-text)',
  color: 'var(--tool-color)',
  date: 'var(--tool-date)',
}

export const GROUP_LABELS: Record<ToolGroup, string> = {
  formatters: 'Formatters',
  encoders: 'Encoders & Decoders',
  generators: 'Generators',
  text: 'Text',
  color: 'Color',
  date: 'Date & Time',
}

export const GROUP_ORDER: Array<ToolGroup> = [
  'formatters',
  'encoders',
  'generators',
  'date',
  'text',
  'color',
]

export const TOOLS: Array<ToolMeta> = [
  {
    id: 'json-formatter',
    name: 'JSON Formatter',
    description: 'Format, minify and validate JSON.',
    metaDescription:
      'Format, minify and validate JSON online. Pretty-print messy payloads, catch syntax errors with line numbers, and minify for production - in your browser.',
    group: 'formatters',
    tags: ['json', 'format', 'minify', 'validate', 'pretty'],
    icon: Braces,
    to: '/tools/json-formatter',
  },
  {
    id: 'code-formatter',
    name: 'Code Formatter',
    description: 'Format source code with Prettier.',
    metaDescription:
      'Format JavaScript, TypeScript, CSS, HTML, YAML and Markdown with Prettier online. Paste code, pick a parser, get consistent output without installing anything.',
    group: 'formatters',
    tags: [
      'prettier',
      'format',
      'javascript',
      'typescript',
      'css',
      'html',
      'yaml',
    ],
    icon: Code2,
    to: '/tools/code-formatter',
  },
  {
    id: 'data-converter',
    name: 'Data Converter',
    description: 'Convert between JSON, YAML, TOML and CSV.',
    metaDescription:
      'Convert between JSON, YAML, TOML and CSV online. Paste config in one format, get it back in another, with parse errors reported inline. Runs in your browser.',
    group: 'formatters',
    tags: ['json', 'yaml', 'toml', 'csv', 'convert'],
    keywords: ['yml', 'transform', 'serialize', 'config'],
    icon: ArrowLeftRight,
    to: '/tools/data-converter',
  },
  {
    id: 'base64',
    name: 'Base64 Encode / Decode',
    description: 'Encode and decode Base64 text.',
    metaDescription:
      'Encode text to Base64 or decode Base64 back to plain text online. Handles full Unicode, works offline, and never uploads your input to a server.',
    group: 'encoders',
    tags: ['base64', 'encode', 'decode'],
    keywords: ['btoa', 'atob'],
    icon: Binary,
    to: '/tools/base64',
  },
  {
    id: 'jwt-decoder',
    name: 'JWT Encoder / Decoder',
    description: 'Encode, decode, inspect and verify JWTs.',
    metaDescription:
      'Decode, inspect and verify JSON Web Tokens online. Read header and payload claims, check expiry, and verify HMAC signatures locally in your browser.',
    group: 'encoders',
    tags: ['jwt', 'token', 'encode', 'decode', 'verify', 'hmac', 'jose'],
    icon: KeyRound,
    to: '/tools/jwt',
  },
  {
    id: 'hmac',
    name: 'HMAC Generator / Verifier',
    description: 'Generate and verify HMAC signatures.',
    metaDescription:
      'Generate and verify HMAC signatures with SHA-256, SHA-384 or SHA-512 online. Sign a message with a shared secret or check one you were sent - all client-side.',
    group: 'encoders',
    tags: ['hmac', 'signature', 'sha256', 'sha384', 'sha512', 'hash'],
    keywords: ['mac', 'sign', 'verify'],
    icon: FileSignature,
    to: '/tools/hmac',
  },
  {
    id: 'hash',
    name: 'Hash Generator',
    description: 'Generate MD5, SHA-1, SHA-256, SHA-384 and SHA-512 hashes.',
    metaDescription:
      'Generate MD5, SHA-1, SHA-256, SHA-384 and SHA-512 hashes from text or files online. Compare checksums to verify a download, without uploading anything.',
    group: 'encoders',
    tags: ['hash', 'md5', 'sha1', 'sha256', 'sha512', 'checksum', 'digest'],
    keywords: ['fingerprint', 'file hash', 'file checksum'],
    icon: Hash,
    to: '/tools/hash',
  },
  {
    id: 'url-parser',
    name: 'URL Parser / Encoder',
    description: 'Parse, edit and encode URLs and query strings.',
    metaDescription:
      'Parse, edit and encode URLs and query strings online. Break a URL into its parts, edit params, and percent-encode or decode text in your browser.',
    group: 'encoders',
    tags: ['url', 'query', 'params', 'encode', 'decode', 'uri'],
    keywords: [
      'querystring',
      'encodeURIComponent',
      'decodeURIComponent',
      'percent-encoding',
    ],
    icon: Link,
    to: '/tools/url-parser',
  },
  {
    id: 'uuid-generator',
    name: 'UUID v7 Generator',
    description: 'Generate UUID v7 and inspect embedded timestamps.',
    metaDescription:
      'Generate UUID v7 identifiers online and read the timestamp embedded in each one. Time-ordered IDs that index better than v4, generated in your browser.',
    group: 'generators',
    tags: ['uuid', 'guid', 'v7', 'generate', 'timestamp'],
    keywords: ['random', 'id', 'ulid'],
    icon: Fingerprint,
    to: '/tools/uuid-generator',
  },
  {
    id: 'secret-generator',
    name: 'Secret / Key Generator',
    description: 'Generate random secrets, keys and tokens.',
    metaDescription:
      'Generate cryptographically random secrets, API keys, passwords and tokens online. Choose hex, Base64 or passphrase output - produced locally, never sent.',
    group: 'generators',
    tags: [
      'secret',
      'key',
      'password',
      'token',
      'random',
      'generate',
      'hex',
      'base64',
    ],
    keywords: ['api-key', 'nanoid', 'openssl', 'csprng', 'passphrase'],
    icon: KeySquare,
    to: '/tools/secret-generator',
  },
  {
    id: 'cron',
    name: 'Cron Expression',
    description: 'Parse cron expressions to plain text or build schedules.',
    metaDescription:
      'Translate cron expressions to plain English or build a schedule field by field. See the next run times for any crontab line, right in your browser.',
    group: 'generators',
    tags: ['cron', 'crontab', 'schedule', 'quartz', 'expression', 'parse'],
    keywords: ['crontab.guru', 'next run', 'timezone', '*/5'],
    icon: CalendarClock,
    to: '/tools/cron',
  },
  {
    id: 'qr-code',
    name: 'QR Code Generator',
    description: 'Generate QR codes for text, URLs and Wi-Fi.',
    metaDescription:
      'Generate QR codes for text, links and Wi-Fi networks online. Export as SVG or PNG, or scan an existing code to read it back - all in your browser.',
    group: 'generators',
    tags: ['qr', 'qrcode', 'wifi', 'url', 'generate', 'svg', 'png'],
    keywords: ['barcode', 'scan', 'share'],
    icon: QrCode,
    to: '/tools/qr-code',
  },
  {
    id: 'unix-timestamp',
    name: 'Unix Timestamp',
    description: 'Convert epoch ↔ date and extract timestamps from IDs.',
    metaDescription:
      'Convert Unix timestamps to dates and back online. Handles seconds and milliseconds, and extracts the embedded time from Snowflake, ObjectId and ULID values.',
    group: 'date',
    tags: ['timestamp', 'epoch', 'unix', 'date', 'time', 'convert', 'iso8601'],
    keywords: [
      'milliseconds',
      'utc',
      'timezone',
      'relative',
      'snowflake',
      'ulid',
      'objectid',
      'now',
    ],
    icon: Clock,
    to: '/tools/unix-timestamp',
  },
  {
    id: 'clock',
    name: 'Clock',
    description: 'World clock with timezones, stopwatch and countdown timer.',
    metaDescription:
      'World clock, stopwatch and countdown timer in one page. Track several timezones side by side, time laps, and set alerts - no account, runs in your browser.',
    group: 'date',
    tags: [
      'clock',
      'world clock',
      'timezone',
      'stopwatch',
      'timer',
      'countdown',
    ],
    keywords: ['time', 'utc', 'laps', 'lap', 'schedule'],
    icon: AlarmClock,
    to: '/tools/clock',
  },
  {
    id: 'markdown',
    name: 'Markdown Preview',
    description: 'Edit Markdown with live preview.',
    metaDescription:
      'Write Markdown and see it rendered live as you type. GitHub-flavoured syntax with tables and code blocks, previewed instantly in your browser.',
    group: 'text',
    tags: ['markdown', 'md', 'preview', 'gfm'],
    icon: FileText,
    to: '/tools/markdown',
  },
  {
    id: 'regex',
    name: 'Regex Tester',
    description:
      'Test regular expressions with live match highlight and replace.',
    metaDescription:
      'Test regular expressions online with live match highlighting, capture groups and replace preview. Try patterns against your own text, entirely client-side.',
    group: 'text',
    tags: ['regex', 'regexp', 'pattern', 'match', 'replace', 'test'],
    keywords: ['regex101', 'expression', 'capture', 'groups'],
    icon: Regex,
    to: '/tools/regex',
  },
  {
    id: 'diff',
    name: 'Diff Checker',
    description: 'Compare two texts with line and character diff.',
    metaDescription:
      'Compare two texts and see exactly what changed, line by line or character by character. Side-by-side and unified views, computed in your browser.',
    group: 'text',
    tags: ['diff', 'compare', 'text', 'json', 'patch'],
    keywords: ['difference', 'changes', 'side by side', 'unified'],
    icon: GitCompareArrows,
    to: '/tools/diff',
  },
  {
    id: 'string-inspector',
    name: 'String Inspector',
    description: 'Count characters and detect hidden or suspicious Unicode.',
    metaDescription:
      'Count characters, words and graphemes, and reveal hidden Unicode. Detects zero-width characters and homoglyphs that make two strings look identical.',
    group: 'text',
    tags: ['string', 'unicode', 'count', 'characters', 'zero-width', 'inspect'],
    keywords: [
      'grapheme',
      'codepoint',
      'utf8',
      'homoglyph',
      'invisible',
      'word count',
    ],
    icon: ScanSearch,
    to: '/tools/string-inspector',
  },
  {
    id: 'colors',
    name: 'Color Converter',
    description:
      'Convert between HEX, RGB, HSL, HSV, CMYK, HWB, OKLCH and LAB.',
    metaDescription:
      'Convert colors between HEX, RGB, HSL, HSV, CMYK, HWB, OKLCH and LAB online. Pick a color, read every notation at once, and copy the one your stylesheet needs.',
    group: 'color',
    tags: ['color', 'hex', 'rgb', 'hsl', 'hsv', 'cmyk', 'oklch', 'convert'],
    keywords: ['colour', 'rgba', 'hwb', 'lab', 'lch', 'alpha', 'picker'],
    icon: Palette,
    to: '/tools/colors',
  },
  {
    id: 'palette',
    name: 'Palette Generator',
    description: 'Build a color shade scale from any color.',
    metaDescription:
      'Build a full shade scale from a single color online. Generates Tailwind-style 50-950 steps in perceptually even increments, ready to paste into your theme.',
    group: 'color',
    tags: ['palette', 'tailwind', 'shades', 'scale', 'tints', 'color'],
    keywords: ['swatch', 'theme', 'tokens', 'palette'],
    icon: SwatchBook,
    to: '/tools/palette',
  },
  {
    id: 'gradient',
    name: 'Gradient Generator',
    description: 'Build linear, radial and conic gradients and export them.',
    metaDescription:
      'Build linear, radial and conic CSS gradients visually and export them. Drag color stops, preview live, and copy CSS, Tailwind or SVG output from your browser.',
    group: 'color',
    tags: ['gradient', 'linear', 'radial', 'conic', 'css', 'tailwind', 'svg'],
    keywords: ['stops', 'background', 'oklch', 'export', 'color'],
    icon: Blend,
    to: '/tools/gradient',
  },
  {
    id: 'contrast',
    name: 'Contrast Checker',
    description: 'Check WCAG color contrast ratios and pass/fail levels.',
    metaDescription:
      'Check color contrast against WCAG 2.1 ratios and the newer APCA model. See pass and fail levels for normal and large text before you ship a palette.',
    group: 'color',
    tags: ['contrast', 'wcag', 'accessibility', 'a11y', 'ratio', 'color'],
    keywords: ['aa', 'aaa', 'luminance', 'legibility', 'wcag 2.1'],
    icon: Contrast,
    to: '/tools/contrast',
  },
]

export function getTool(id: string): ToolMeta | undefined {
  return TOOLS.find((tool) => tool.id === id)
}

export function requireTool(id: string): ToolMeta {
  const tool = getTool(id)
  if (!tool) throw new Error(`Unknown tool: ${id}`)
  return tool
}

export interface ToolGroupView {
  group: ToolGroup
  label: string
  tools: Array<ToolMeta>
}

export function toolsByGroup(): Array<ToolGroupView> {
  return GROUP_ORDER.map((group) => ({
    group,
    label: GROUP_LABELS[group],
    tools: TOOLS.filter((tool) => tool.group === group),
  })).filter((view) => view.tools.length > 0)
}

export function toolsByGroupSorted(): Array<ToolGroupView> {
  return toolsByGroup()
    .map((view) => ({
      ...view,
      tools: [...view.tools].sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .sort((a, b) => a.label.localeCompare(b.label))
}
