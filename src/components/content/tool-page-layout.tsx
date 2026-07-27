import { ToolHeader } from '@/components/layout/tool-header'

import { ToolArticle } from './tool-article'

import type { ToolContent } from '@/content/types'
import type { ToolMeta } from '@/lib/tools/registry'
import type { ReactNode } from 'react'

export function ToolPageLayout({
  tool,
  content,
  actions,
  children,
}: {
  tool: ToolMeta
  content?: ToolContent
  actions?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="flex min-h-full flex-col">
      <ToolHeader tool={tool} actions={actions} className="sticky top-0 z-20" />
      {children}
      {content ? <ToolArticle content={content} /> : null}
    </div>
  )
}
