import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Check, Copy } from 'lucide-react'
import * as React from 'react'

export function CopyButton({
  value,
  className,
}: {
  value: string
  className?: string
}) {
  const [copied, setCopied] = React.useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <Button
      type="button"
      variant="subtle"
      size="xs"
      className={cn(
        'font-mono text-[10px] lowercase tracking-wide',
        copied && 'border-success/40 text-success',
        className,
      )}
      onClick={copy}
      disabled={!value}
    >
      {copied ? (
        <Check className="h-2.5 w-2.5" />
      ) : (
        <Copy className="h-2.5 w-2.5" />
      )}
      {copied ? 'copied' : 'copy'}
    </Button>
  )
}
