import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { MessageKey } from '../i18n/messages'
import type { Lang } from '../i18n/messages'
import { createTranslator, describeDue, type Params, type Translate } from '../i18n/translate'
import { storage } from '../utils/storage'

export type Theme = 'light' | 'dark'

const THEME_KEY = 'tm.theme'
const LANG_KEY = 'tm.lang'

interface PreferencesValue {
  lang: Lang
  setLang: (lang: Lang) => void
  theme: Theme
  setTheme: (theme: Theme) => void
  t: Translate
  /** Like t(), but placeholders can be React nodes (links, bold text). */
  tRich: (key: MessageKey, parts: Record<string, ReactNode>) => ReactNode[]
  due: (dueDate: string) => ReturnType<typeof describeDue>
}

const PreferencesContext = createContext<PreferencesValue | null>(null)

function initialLang(): Lang {
  const saved = storage.get(LANG_KEY)
  if (saved === 'en' || saved === 'es') return saved
  return navigator.language?.toLowerCase().startsWith('es') ? 'es' : 'en'
}

function initialTheme(): Theme {
  const saved = storage.get(THEME_KEY)
  if (saved === 'light' || saved === 'dark') return saved
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang)
  const [theme, setThemeState] = useState<Theme>(initialTheme)

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  const setLang = useCallback((next: Lang) => {
    storage.set(LANG_KEY, next)
    setLangState(next)
  }, [])

  const setTheme = useCallback((next: Theme) => {
    storage.set(THEME_KEY, next)
    setThemeState(next)
  }, [])

  const value = useMemo<PreferencesValue>(() => {
    const t = createTranslator(lang)
    return {
      lang,
      setLang,
      theme,
      setTheme,
      t,
      tRich: (key, parts) =>
        t(key)
          .split(/(\{\w+\})/)
          .filter(Boolean)
          .map((chunk) => {
            const name = chunk.match(/^\{(\w+)\}$/)?.[1]
            return name && name in parts ? parts[name] : chunk
          }),
      due: (dueDate) => describeDue(dueDate, lang),
    }
  }, [lang, theme, setLang, setTheme])

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function usePreferences() {
  const ctx = useContext(PreferencesContext)
  if (!ctx) throw new Error('usePreferences must be used inside PreferencesProvider')
  return ctx
}

export type { Params }
