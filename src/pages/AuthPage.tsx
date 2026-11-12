import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router'
import { ApiError } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import { Wordmark } from '../components/Wordmark'

type Mode = 'login' | 'register'

export function AuthPage() {
  const { user, login, register } = useAuth()
  const [mode, setMode] = useState<Mode>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [submitting, setSubmitting] = useState(false)

  if (user) return <Navigate to="/" replace />

  const switchMode = (next: Mode) => {
    setMode(next)
    setError(null)
    setFieldErrors({})
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setFieldErrors({})
    try {
      if (mode === 'login') await login(email, password)
      else await register(name, email, password)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.status === 400 ? 'Check the highlighted fields.' : err.message)
        setFieldErrors(err.details ?? {})
      } else {
        setError('Something went wrong. Try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const fieldError = (key: string) =>
    fieldErrors[key]?.[0] && (
      <span className="field__error" id={`${key}-error`}>
        {fieldErrors[key][0]}
      </span>
    )

  return (
    <main className="auth">
      <section className="auth__intro">
        <Wordmark />
        <div className="auth__pitch">
          <h1>Your work, one column at a time.</h1>
          <p>
            Capture tasks, set what matters most and drag each one forward from to do to done. Overdue work
            stands out, so nothing slips.
          </p>
        </div>
        <div className="auth__preview" aria-hidden="true">
          <div className="preview-card preview-card--high">
            <span>Prepare sprint demo</span>
            <em className="due due--soon">Due tomorrow</em>
          </div>
          <div className="preview-card preview-card--medium">
            <span>Review pull requests</span>
            <em className="due due--later">Due in 3 days</em>
          </div>
          <div className="preview-card preview-card--low preview-card--done">
            <span>Update the README</span>
          </div>
        </div>
        <p className="auth__source">
          A portfolio project by Daniel Pachón.{' '}
          <a href="https://github.com/danielPachon/task-manager-web">Frontend</a> and{' '}
          <a href="https://github.com/danielPachon/task-manager-api">API</a> source on GitHub.
        </p>
      </section>

      <section className="auth__panel">
        <div className="tabs" role="tablist" aria-label="Account">
          <button type="button" role="tab" aria-selected={mode === 'login'} onClick={() => switchMode('login')}>
            Log in
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'register'}
            onClick={() => switchMode('register')}
          >
            Create account
          </button>
        </div>

        <form className="auth__form" onSubmit={handleSubmit} noValidate>
          <h2>{mode === 'login' ? 'Welcome back' : 'Create your board'}</h2>

          {mode === 'register' && (
            <div className="field">
              <label className="field__label" htmlFor="name">
                Name
              </label>
              <input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                aria-invalid={!!fieldErrors.name}
                aria-describedby={fieldErrors.name ? 'name-error' : undefined}
              />
              {fieldError('name')}
            </div>
          )}

          <div className="field">
            <label className="field__label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              aria-invalid={!!fieldErrors.email}
              aria-describedby={fieldErrors.email ? 'email-error' : undefined}
            />
            {fieldError('email')}
          </div>

          <div className="field">
            <label className="field__label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              aria-invalid={!!fieldErrors.password}
              aria-describedby={
                fieldErrors.password ? 'password-error' : mode === 'register' ? 'password-hint' : undefined
              }
            />
            {fieldError('password') ||
              (mode === 'register' && (
                <span className="field__hint" id="password-hint">
                  At least 8 characters, with a letter and a number.
                </span>
              ))}
          </div>

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="button button--primary button--block" disabled={submitting}>
            {submitting ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}
          </button>
        </form>
      </section>
    </main>
  )
}
