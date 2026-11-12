import { LogOut } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { usePreferences } from '../preferences/PreferencesContext'
import { PreferenceControls } from './PreferenceControls'
import { Wordmark } from './Wordmark'

export function Header() {
  const { user, logout } = useAuth()
  const { t } = usePreferences()

  return (
    <header className="app-header">
      <Wordmark />
      <div className="app-header__actions">
        {user && <span className="app-header__user">{user.name}</span>}
        <PreferenceControls />
        {user && (
          <button type="button" className="button button--ghost app-header__logout"
            onClick={logout}
            aria-label={t('header.logout')}
          >
            <LogOut size={16} aria-hidden="true" />
            <span className="app-header__logout-text">{t('header.logout')}</span>
          </button>
        )}
      </div>
    </header>
  )
}
