import * as React from 'react'
import { TriangleAlert } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ToolBody({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex-1 overflow-auto p-6', className)}>{children}</div>
  )
}

export function ErrorText({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-2 flex items-center gap-1.5 text-sm text-destructive">
      <TriangleAlert className="h-3.5 w-3.5 shrink-0" />
      {children}
    </p>
  )
}
