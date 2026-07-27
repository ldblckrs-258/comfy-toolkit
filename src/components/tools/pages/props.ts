import type { ToolContent } from '@/content/types'
import type { ReactNode } from 'react'

export interface ToolPageProps {
  content?: ToolContent
  preset?: Record<string, string>
  variantArticle?: ReactNode
}
