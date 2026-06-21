import { marked } from 'marked'
import DOMPurify from 'dompurify'

export async function renderMarkdown(input: string): Promise<string> {
  const html = await marked.parse(input, { gfm: true, breaks: true })
  return DOMPurify.sanitize(html)
}
