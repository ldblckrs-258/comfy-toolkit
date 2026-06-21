import { cn } from '@/lib/utils'
import * as React from 'react'

type Variant = 'default' | 'ghost' | 'outline' | 'subtle'
type Size = 'xs' | 'sm' | 'md' | 'icon'

const variants: Record<Variant, string> = {
  default:
    'btn-gradient text-accent-foreground shadow-[inset_0_1px_0_0_rgba(255,255,255,0.22)] hover:brightness-[1.08]',
  subtle:
    'border border-border bg-muted text-foreground hover:border-border-strong',
  outline:
    'border border-border text-foreground hover:bg-muted hover:border-border-strong',
  ghost: 'text-muted-foreground hover:bg-muted hover:text-foreground',
}

const sizes: Record<Size, string> = {
  xs: 'h-6.5 px-2 text-xs',
  sm: 'h-8 px-3 text-sm',
  md: 'h-9 px-4 text-sm',
  icon: 'h-9 w-9',
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex select-none items-center justify-center gap-1.5 rounded-md font-medium transition-[background-color,box-shadow,transform,filter,border-color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:translate-y-px disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  ),
)
Button.displayName = 'Button'
