import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router'
import { ApiError } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import { PreferenceControls } from '../components/PreferenceControls'
import { Wordmark } from '../components/Wordmark'
import type { MessageKey } from '../i18n/messages'
import { errorMessage } from '../i18n/translate'
import { usePreferences } from '../preferences/PreferencesContext'

type Mode = 'login' | 'register'
type Field = 'name' | 'email' | 'password'

/** The API returns English validation details; show a translated message for each failing field instead. */
const FIELD_MESSAGES: Record<Field, MessageKey> = {
  name: 'auth.fieldName',
  email: 'auth.fieldEmail',
  password: 'auth.fieldPassword',
}

function daysFromToday(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function AuthPage() {
  const { user, login, register } = useAuth()
  const { t, tRich, due } = usePreferences()
  const [mode, setMode] = useState<Mode>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [invalid, setInvalid] = useState<Field[]>([])
  const [submitting, setSubmitting] = useState(false)
  // Preview cards show dates relative to today; computed once per visit
  const [previewDates] = useState(() => [1, 3].map(daysFromToday))

  if (user) return <Navigate to="/" replace />

  const switchMode = (next: Mode) => {
    setMode(next)
    setError(null)
    setInvalid([])
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setInvalid([])
    try {
      if (mode === 'login') await login(email, password)
      else await register(name, email, password)
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        setError(t('auth.checkFields'))
        setInvalid(Object.keys(err.details ?? {}).filter((k): k is Field => k in FIELD_MESSAGES))
      } else {
        setError(errorMessage(err, t))
      }
    } finally {
      setSubmitting(false)
    }
  }

  const isInvalid = (field: Field) => invalid.includes(field)
  const describedBy = (field: Field, hint?: string) => (isInvalid(field) ? `${field}-error` : hint)
  const fieldError = (field: Field) =>
    isInvalid(field) && (
      <span className="field__error" id={`${field}-error`}>
        {t(FIELD_MESSAGES[field])}
      </span>
    )


  return (
    <main className="auth">
      <section className="auth__intro">
        <div className="auth__top">
          <Wordmark />
          <PreferenceControls />
        </div>
        <div className="auth__pitch">
          <h1>{t('auth.pitchTitle')}</h1>
          <p>{t('auth.pitchBody')}</p>
        </div>
        <div className="auth__preview" aria-hidden="true">
          <div className="preview-card preview-card--high">
            <span>{t('auth.preview1')}</span>
            <em className="due due--soon">{due(previewDates[0]).text}</em>
          </div>
          <div className="preview-card preview-card--medium">
            <span>{t('auth.preview2')}</span>
            <em className="due due--later">{due(previewDates[1]).text}</em>
          </div>
          <div className="preview-card preview-card--low preview-card--done">
            <span>{t('auth.preview3')}</span>
          </div>
        </div>
        <p className="auth__source">
          {tRich('auth.source', {
            frontend: (
              <a key="fe" href="https://github.com/danielPachon/task-manager-web">
                {t('auth.sourceFrontend')}
              </a>
            ),
            api: (
              <a key="api" href="https://github.com/danielPachon/task-manager-api">
                {t('auth.sourceApi')}
              </a>
            ),
          })}
        </p>
      </section>

      <section className="auth__panel">
        <div className="tabs" role="tablist" aria-label={t('auth.tabsLabel')}>
          <button type="button" role="tab" aria-selected={mode === 'login'} onClick={() => switchMode('login')}>
            {t('auth.loginTab')}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'register'}
            onClick={() => switchMode('register')}
          >
            {t('auth.registerTab')}
          </button>
        </div>

        <form className="auth__form" onSubmit={handleSubmit} noValidate>
          <h2>{mode === 'login' ? t('auth.loginTitle') : t('auth.registerTitle')}</h2>

          {mode === 'register' && (
            <div className="field">
              <label className="field__label" htmlFor="name">
                {t('auth.name')}
              </label>
              <input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                aria-invalid={isInvalid('name')}
                aria-describedby={describedBy('name')}
              />
              {fieldError('name')}
            </div>
          )}

          <div className="field">
            <label className="field__label" htmlFor="email">
              {t('auth.email')}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              aria-invalid={isInvalid('email')}
              aria-describedby={describedBy('email')}
            />
            {fieldError('email')}
          </div>

          <div className="field">
            <label className="field__label" htmlFor="password">
              {t('auth.password')}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              aria-invalid={isInvalid('password')}
              aria-describedby={describedBy('password', mode === 'register' ? 'password-hint' : undefined)}
            />
            {fieldError('password') ||
              (mode === 'register' && (
                <span className="field__hint" id="password-hint">
                  {t('auth.passwordHint')}
                </span>
              ))}
          </div>

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="button button--primary button--block" disabled={submitting}>
            {submitting ? t('auth.wait') : mode === 'login' ? t('auth.loginSubmit') : t('auth.registerSubmit')}
          </button>
        </form>
      </section>
    </main>
  )
}
