import { useEffect, useState } from 'react'
import { storage } from '../utils/storage'

type Theme = 'light' | 'dark'
const KEY = 'tm.theme'

function initialTheme(): Theme {
  const saved = storage.get(KEY)
  if (saved === 'light' || saved === 'dark') return saved
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(initialTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    storage.set(KEY, theme)
  }, [theme])

  return { theme, toggle: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')) }
}
