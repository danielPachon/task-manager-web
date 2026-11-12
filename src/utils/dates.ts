const DAY_MS = 24 * 60 * 60 * 1000

/** Parses a YYYY-MM-DD string as a local calendar date (no timezone shift). */
export function parseDate(value: string): Date {
  const [y, m, d] = value.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function toInputDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export type DueTone = 'overdue' | 'soon' | 'later'

export interface DueLabel {
  text: string
  tone: DueTone
}

/** Human-friendly due date relative to today, e.g. "Due tomorrow" or "2 days overdue". */
export function describeDue(dueDate: string, today: Date = new Date()): DueLabel {
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const days = Math.round((parseDate(dueDate).getTime() - start.getTime()) / DAY_MS)

  if (days < -1) return { text: `${-days} days overdue`, tone: 'overdue' }
  if (days === -1) return { text: '1 day overdue', tone: 'overdue' }
  if (days === 0) return { text: 'Due today', tone: 'soon' }
  if (days === 1) return { text: 'Due tomorrow', tone: 'soon' }
  if (days <= 7) return { text: `Due in ${days} days`, tone: 'later' }

  const formatted = parseDate(dueDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    ...(parseDate(dueDate).getFullYear() !== start.getFullYear() ? { year: 'numeric' } : {}),
  })
  return { text: `Due ${formatted}`, tone: 'later' }
}
