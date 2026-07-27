import { ToolHeader } from '@/components/layout/tool-header'

import { ToolArticle } from './tool-article'

import type { ToolContent } from '@/content/types'
import type { ToolMeta } from '@/lib/tools/registry'
import type { ReactNode } from 'react'

export function ToolPageLayout({
  tool,
  content,
  actions,
  article,
  children,
}: {
  tool: ToolMeta
  content?: ToolContent
  actions?: ReactNode
  article?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="flex min-h-full flex-col">
      <ToolHeader tool={tool} actions={actions} className="sticky top-0 z-20" />
      {children}
      {article ??
        (content ? (
          <ToolArticle
            content={content}
            group={tool.group}
            toolId={tool.id}
            toolPath={tool.to}
          />
        ) : null)}
    </div>
  )
}
