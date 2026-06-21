import type { Plugin } from 'prettier'

export type PrettierLang =
  | 'babel'
  | 'typescript'
  | 'json'
  | 'json5'
  | 'css'
  | 'scss'
  | 'less'
  | 'html'
  | 'vue'
  | 'markdown'
  | 'mdx'
  | 'yaml'
  | 'graphql'

export const PRETTIER_LANGS: Array<{ value: PrettierLang; label: string }> = [
  { value: 'babel', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'json', label: 'JSON' },
  { value: 'json5', label: 'JSON5' },
  { value: 'css', label: 'CSS' },
  { value: 'scss', label: 'SCSS' },
  { value: 'less', label: 'LESS' },
  { value: 'html', label: 'HTML' },
  { value: 'vue', label: 'Vue' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'mdx', label: 'MDX' },
  { value: 'yaml', label: 'YAML' },
  { value: 'graphql', label: 'GraphQL' },
]

async function loadPlugins(lang: PrettierLang): Promise<Array<Plugin>> {
  if (import.meta.env.SSR) return []
  switch (lang) {
    case 'babel':
    case 'json':
    case 'json5': {
      const [babel, estree] = await Promise.all([
        import('prettier/plugins/babel'),
        import('prettier/plugins/estree'),
      ])
      return [babel.default, estree.default]
    }
    case 'typescript': {
      const [typescript, estree] = await Promise.all([
        import('prettier/plugins/typescript'),
        import('prettier/plugins/estree'),
      ])
      return [typescript.default, estree.default]
    }
    case 'css':
    case 'scss':
    case 'less':
      return [(await import('prettier/plugins/postcss')).default]
    case 'html':
    case 'vue':
      return [(await import('prettier/plugins/html')).default]
    case 'markdown':
    case 'mdx':
      return [(await import('prettier/plugins/markdown')).default]
    case 'yaml':
      return [(await import('prettier/plugins/yaml')).default]
    case 'graphql':
      return [(await import('prettier/plugins/graphql')).default]
  }
}

export async function formatCode(
  source: string,
  lang: PrettierLang,
): Promise<string> {
  if (import.meta.env.SSR) return source
  const { format } = await import('prettier/standalone')
  const plugins = await loadPlugins(lang)
  return format(source, { parser: lang, plugins })
}
