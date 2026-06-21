import type { LucideIcon } from 'lucide-react'
import {
  Binary,
  Blend,
  Braces,
  Code2,
  FileSignature,
  FileText,
  Fingerprint,
  KeyRound,
  KeySquare,
  Palette,
  Regex,
  SwatchBook,
} from 'lucide-react'

export type ToolGroup =
  | 'formatters'
  | 'encoders'
  | 'generators'
  | 'text'
  | 'color'

export interface ToolMeta {
  id: string
  name: string
  description: string
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
}

export const GROUP_LABELS: Record<ToolGroup, string> = {
  formatters: 'Formatters',
  encoders: 'Encoders & Decoders',
  generators: 'Generators',
  text: 'Text',
  color: 'Color',
}

export const GROUP_ORDER: Array<ToolGroup> = [
  'formatters',
  'encoders',
  'generators',
  'text',
  'color',
]

export const TOOLS: Array<ToolMeta> = [
  {
    id: 'json-formatter',
    name: 'JSON Formatter',
    description: 'Format, minify and validate JSON.',
    group: 'formatters',
    tags: ['json', 'format', 'minify', 'validate', 'pretty'],
    icon: Braces,
    to: '/tools/json-formatter',
  },
  {
    id: 'code-formatter',
    name: 'Code Formatter',
    description: 'Format source code with Prettier.',
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
    id: 'base64',
    name: 'Base64 Encode / Decode',
    description: 'Encode and decode Base64 text.',
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
    group: 'encoders',
    tags: ['jwt', 'token', 'encode', 'decode', 'verify', 'hmac', 'jose'],
    icon: KeyRound,
    to: '/tools/jwt',
  },
  {
    id: 'hmac',
    name: 'HMAC Generator / Verifier',
    description: 'Generate and verify HMAC signatures.',
    group: 'encoders',
    tags: ['hmac', 'signature', 'sha256', 'sha384', 'sha512', 'hash'],
    keywords: ['mac', 'sign', 'verify'],
    icon: FileSignature,
    to: '/tools/hmac',
  },
  {
    id: 'uuid-generator',
    name: 'UUID v7 Generator',
    description: 'Generate UUID v7 and inspect embedded timestamps.',
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
    id: 'markdown',
    name: 'Markdown Preview',
    description: 'Edit Markdown with live preview.',
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
    group: 'text',
    tags: ['regex', 'regexp', 'pattern', 'match', 'replace', 'test'],
    keywords: ['regex101', 'expression', 'capture', 'groups'],
    icon: Regex,
    to: '/tools/regex',
  },
  {
    id: 'colors',
    name: 'Color Converter',
    description:
      'Convert between HEX, RGB, HSL, HSV, CMYK, HWB, OKLCH and LAB.',
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
    group: 'color',
    tags: ['gradient', 'linear', 'radial', 'conic', 'css', 'tailwind', 'svg'],
    keywords: ['stops', 'background', 'oklch', 'export', 'color'],
    icon: Blend,
    to: '/tools/gradient',
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
