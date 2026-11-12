import { Moon, Sun } from 'lucide-react'
import type { Lang } from '../i18n/messages'
import { usePreferences, type Theme } from '../preferences/PreferencesContext'

const LANGS: { id: Lang; short: string; name: string }[] = [
  { id: 'en', short: 'EN', name: 'English' },
  { id: 'es', short: 'ES', name: 'Español' },
]

/** Language and theme switches, shown on both the login page and the board. */
export function PreferenceControls() {
  const { lang, setLang, theme, setTheme, t } = usePreferences()

  const themes: { id: Theme; label: string; long: string; icon: React.ReactNode }[] = [
    { id: 'light', label: t('prefs.light'), long: t('prefs.lightMode'), icon: <Sun size={16} aria-hidden="true" /> },
    { id: 'dark', label: t('prefs.dark'), long: t('prefs.darkMode'), icon: <Moon size={16} aria-hidden="true" /> },
  ]

  return (
    <div className="prefs">
      <div className="switch" role="group" aria-label={t('prefs.language')}>
        {LANGS.map((l) => (
          <button
            key={l.id}
            type="button"
            className="switch__option"
            aria-pressed={lang === l.id}
            onClick={() => setLang(l.id)}
            lang={l.id}
            title={l.name}
          >
            <span aria-hidden="true">{l.short}</span>
            <span className="visually-hidden">{l.name}</span>
          </button>
        ))}
      </div>

      <div className="switch" role="group" aria-label={t('prefs.theme')}>
        {themes.map((th) => (
          <button
            key={th.id}
            type="button"
            className="switch__option"
            aria-pressed={theme === th.id}
            onClick={() => setTheme(th.id)}
            title={th.long}
          >
            {th.icon}
            <span className="switch__text">{th.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
