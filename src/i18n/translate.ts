import { ApiError } from '../api/client'
import { LOCALES, messages, type Lang, type MessageKey } from './messages'

export type Params = Record<string, string | number>
export type Translate = (key: MessageKey, params?: Params) => string

export function createTranslator(lang: Lang): Translate {
  return (key, params) => {
    const template = messages[lang][key] ?? messages.en[key] ?? key
    return params ? template.replace(/\{(\w+)\}/g, (_, name) => String(params[name] ?? `{${name}}`)) : template
  }
}

const DAY_MS = 24 * 60 * 60 * 1000

function parseDate(value: string): Date {
  const [y, m, d] = value.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export type DueTone = 'overdue' | 'soon' | 'later'

/** Human-friendly due date relative to today, e.g. "Due tomorrow" / "Vence mañana". */
export function describeDue(dueDate: string, lang: Lang, today: Date = new Date()): { text: string; tone: DueTone } {
  const t = createTranslator(lang)
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const due = parseDate(dueDate)
  const days = Math.round((due.getTime() - start.getTime()) / DAY_MS)

  if (days < -1) return { text: t('due.overdueMany', { n: -days }), tone: 'overdue' }
  if (days === -1) return { text: t('due.overdueOne'), tone: 'overdue' }
  if (days === 0) return { text: t('due.today'), tone: 'soon' }
  if (days === 1) return { text: t('due.tomorrow'), tone: 'soon' }
  if (days <= 7) return { text: t('due.inDays', { n: days }), tone: 'later' }

  const date = due.toLocaleDateString(LOCALES[lang], {
    month: 'short',
    day: 'numeric',
    ...(due.getFullYear() !== start.getFullYear() ? { year: 'numeric' } : {}),
  })
  return { text: t('due.on', { date: date.replace('.', '') }), tone: 'later' }
}

/** Maps API errors (which the server returns in English) to a message in the current language. */
export function errorMessage(error: unknown, t: Translate): string {
  if (!(error instanceof ApiError)) return t('errors.generic')
  if (error.status === 0) return t('errors.network')
  if (error.status === 401 && /invalid email or password/i.test(error.message)) return t('errors.invalidCredentials')
  if (error.status === 401) return t('errors.sessionExpired')
  if (error.status === 409) return t('errors.emailTaken')
  if (error.status === 404) return t('errors.notFound')
  if (error.status === 429) return t('errors.tooMany')
  return t('errors.generic')
}
