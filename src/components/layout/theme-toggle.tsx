import { cn } from '#/lib/utils'
import { Button } from '@/components/ui/button'
import type { Theme } from '@/lib/theme'
import { getCurrentTheme, toggleTheme } from '@/lib/theme'
import { Moon, Sun } from 'lucide-react'
import * as React from 'react'

export function ThemeToggle({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const [theme, setTheme] = React.useState<Theme>('dark')

  React.useEffect(() => {
    setTheme(getCurrentTheme())
  }, [])

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      className={cn(size === 'sm' ? 'h-7.5 w-7.5' : 'h-9 w-9', 'rounded-full')}
      onClick={() => setTheme(toggleTheme())}
    >
      {theme === 'dark' ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </Button>
  )
}
