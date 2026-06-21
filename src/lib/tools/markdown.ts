export async function renderMarkdown(input: string): Promise<string> {
  if (import.meta.env.SSR) return ''
  const [{ marked }, { default: DOMPurify }] = await Promise.all([
    import('marked'),
    import('dompurify'),
  ])
  const html = await marked.parse(input, { gfm: true, breaks: true })
  return DOMPurify.sanitize(html)
}
