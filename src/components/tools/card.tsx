import { CodeEditor } from '@/components/ui/code-editor'
import { usePersistedState } from '@/lib/use-persisted-state'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'
import { Check, ChevronDown, ChevronRight, Copy, Eraser } from 'lucide-react'
import * as React from 'react'

export function CopyIcon({
  value,
  className,
}: {
  value: string
  className?: string
}) {
  const [copied, setCopied] = React.useState(false)
  const copy = async () => {
    if (!value) return
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch {
      /* clipboard unavailable */
    }
  }
  return (
    <button
      type="button"
      onClick={copy}
      disabled={!value}
      aria-label="Copy"
      className={cn(
        'flex h-7 w-7 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40',
        copied && 'text-success',
        className,
      )}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </button>
  )
}

export interface CardProps {
  label?: React.ReactNode
  icon?: LucideIcon
  headerLeft?: React.ReactNode
  headerRight?: React.ReactNode
  copyValue?: string
  onClear?: () => void
  variant?: 'card' | 'terminal'
  className?: string
  headerClassName?: string
  bodyClassName?: string
  children?: React.ReactNode
  value?: string
  onChange?: (value: string) => void
  readOnly?: boolean
  language?: string
  lineNumbers?: boolean
  placeholder?: string
  minRows?: number
  spellCheck?: boolean
  fieldClassName?: string
  collapsible?: boolean
  collapseKey?: string
  defaultCollapsed?: boolean
}

export function Card({
  label,
  icon: Icon,
  headerLeft,
  headerRight,
  copyValue,
  onClear,
  variant = 'card',
  className,
  headerClassName,
  bodyClassName,
  children,
  value,
  onChange,
  readOnly,
  language,
  lineNumbers,
  placeholder,
  minRows = 4,
  spellCheck = false,
  fieldClassName,
  collapsible = false,
  collapseKey,
  defaultCollapsed = false,
}: CardProps) {
  const [collapsed, setCollapsed] = usePersistedState<boolean>(
    `collapse:${collapseKey ?? 'card'}`,
    defaultCollapsed,
  )
  const isCollapsed = collapsible && collapsed

  const hasHeader =
    collapsible ||
    Boolean(Icon) ||
    label != null ||
    headerLeft != null ||
    headerRight != null ||
    copyValue != null ||
    Boolean(onClear)

  let field: React.ReactNode = children
  if (field === undefined && value !== undefined) {
    field =
      language || lineNumbers ? (
        <CodeEditor
          value={value}
          onChange={onChange}
          readOnly={readOnly}
          language={language}
          placeholder={placeholder}
          minRows={minRows}
          className={cn(
            'h-full flex-1 rounded-none border-0 bg-transparent focus-within:bg-transparent',
            fieldClassName,
          )}
        />
      ) : (
        <textarea
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          readOnly={readOnly}
          placeholder={placeholder}
          spellCheck={spellCheck}
          className={cn(
            'min-h-0 w-full flex-1 resize-none bg-transparent p-3 font-mono text-[13px] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground',
            fieldClassName,
          )}
        />
      )
  }

  return (
    <section
      className={cn(
        'flex min-h-0 flex-col overflow-hidden rounded-md border border-border',
        variant === 'terminal'
          ? 'bg-background transition-colors focus-within:bg-card'
          : 'bg-card',
        className,
      )}
    >
      {hasHeader ? (
        <div
          className={cn(
            'flex items-center gap-2 bg-muted/40 px-2.5 py-1.5 min-h-10',
            isCollapsed ? '' : 'border-b border-border',
            headerClassName,
          )}
        >
          {collapsible ? (
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              aria-expanded={!collapsed}
              aria-label={collapsed ? 'Expand section' : 'Collapse section'}
              className="flex size-5 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:text-foreground"
            >
              {collapsed ? (
                <ChevronRight className="size-3.5" />
              ) : (
                <ChevronDown className="size-3.5" />
              )}
            </button>
          ) : null}
          {Icon ? (
            <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          ) : null}
          {label != null ? (
            <span className="shrink-0 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
              {label}
            </span>
          ) : null}
          {headerLeft}
          <div className="ml-auto flex items-center gap-0.5">
            {headerRight}
            {copyValue != null ? <CopyIcon value={copyValue} /> : null}
            {onClear ? (
              <button
                type="button"
                onClick={onClear}
                disabled={copyValue != null ? !copyValue : false}
                aria-label="Clear"
                className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
              >
                <Eraser className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
      {isCollapsed ? null : (
        <div className={cn('flex min-h-0 flex-1 flex-col', bodyClassName)}>
          {field}
        </div>
      )}
    </section>
  )
}
