import type { ContentSection } from '../types'

export interface VariantContent {
  updated: string
  title: string
  metaDescription: string
  intro: Array<string>
  sections: Array<ContentSection>
}

export interface ToolVariant {
  slug: string
  toolId: string
  preset: Record<string, string>
  content: VariantContent
}
