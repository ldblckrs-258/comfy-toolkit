export type Theme = 'light' | 'dark'

export const THEME_KEY = 'comfy-toolkit-theme'

export function getCurrentTheme(): Theme {
  if (typeof document === 'undefined') return 'light'
  return document.documentElement.classList.contains('light') ? 'light' : 'dark'
}

export function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return
  document.documentElement.classList.toggle('light', theme === 'light')
  try {
    localStorage.setItem(THEME_KEY, theme)
  } catch {
    /* ignore storage errors */
  }
}

export function toggleTheme(): Theme {
  const next: Theme = getCurrentTheme() === 'dark' ? 'light' : 'dark'
  applyTheme(next)
  return next
}

export const THEME_INIT_SCRIPT = `(function(){try{if(localStorage.getItem('${THEME_KEY}')!=='dark'){document.documentElement.classList.add('light')}}catch(e){document.documentElement.classList.add('light')}})();`
