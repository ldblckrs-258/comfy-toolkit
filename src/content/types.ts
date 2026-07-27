export interface ContentSection {
  heading: string
  paragraphs?: Array<string>
  bullets?: Array<string>
  code?: { lang: string; body: string }
}

export interface RelatedLink {
  id: string
  anchor: string
}

export interface ToolContent {
  updated: string
  intro: Array<string>
  sections: Array<ContentSection>
  faq: Array<{ q: string; a: string }>
  related: Array<RelatedLink>
}

export interface CategoryContent {
  updated: string
  title: string
  metaDescription: string
  intro: Array<string>
  sections: Array<ContentSection>
}
