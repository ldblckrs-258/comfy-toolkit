import * as React from 'react'
import { cn } from '@/lib/utils'

export function Tabs<T extends string>({
  value,
  onChange,
  options,
  size = 'md',
  className,
}: {
  value: T
  onChange: (value: T) => void
  options: Array<{ value: T; label: React.ReactNode }>
  size?: 'sm' | 'md'
  className?: string
}) {
  return (
    <div
      className={cn(
        'inline-flex rounded-md border border-border bg-card p-0.5',
        className,
      )}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            'rounded-sm font-medium transition-colors',
            size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-1.5 text-sm',
            value === option.value
              ? 'bg-muted text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
