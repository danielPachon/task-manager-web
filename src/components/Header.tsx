import { LogOut, Moon, Sun } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { useTheme } from '../hooks/useTheme'
import { Wordmark } from './Wordmark'

export function Header() {
  const { user, logout } = useAuth()
  const { theme, toggle } = useTheme()

  return (
    <header className="app-header">
      <Wordmark />
      <div className="app-header__actions">
        {user && <span className="app-header__user">{user.name}</span>}
        <button
          type="button"
          className="icon-button"
          onClick={toggle}
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        {user && (
          <button type="button" className="button button--ghost" onClick={logout}>
            <LogOut size={16} aria-hidden="true" />
            Log out
          </button>
        )}
      </div>
    </header>
  )
}
