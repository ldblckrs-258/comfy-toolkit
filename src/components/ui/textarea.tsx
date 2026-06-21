import * as React from 'react'
import { cn } from '@/lib/utils'

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'w-full overscroll-contain rounded-md border border-border bg-background px-3 py-2.5 font-mono text-base leading-relaxed text-foreground transition-colors placeholder:text-muted-foreground hover:border-border-strong focus-within:bg-card focus-visible:border-accent focus-visible:outline-none md:text-[13px]',
      className,
    )}
    {...props}
  />
))
Textarea.displayName = 'Textarea'
