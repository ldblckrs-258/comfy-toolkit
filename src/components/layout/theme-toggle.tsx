import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getCurrentTheme, toggleTheme } from '@/lib/theme'
import type { Theme } from '@/lib/theme'

export function ThemeToggle() {
  const [theme, setTheme] = React.useState<Theme>('dark')

  React.useEffect(() => {
    setTheme(getCurrentTheme())
  }, [])

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
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
