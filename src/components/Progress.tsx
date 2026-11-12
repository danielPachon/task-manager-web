import type { Task } from '../api/types'
import { usePreferences } from '../preferences/PreferencesContext'

/** Segmented bar showing how the visible tasks split across the three columns. */
export function Progress({ tasks }: { tasks: Task[] }) {
  const { t, tRich } = usePreferences()
  const total = tasks.length
  const done = tasks.filter((task) => task.status === 'done').length
  const inProgress = tasks.filter((task) => task.status === 'in_progress').length
  const pct = (n: number) => (total ? (n / total) * 100 : 0)

  return (
    <div className="progress">
      <p className="progress__text">
        {total === 0
          ? t('board.progressEmpty')
          : tRich('board.progress', { done: <strong key="done">{done}</strong>, total })}
      </p>
      <div
        className="progress__bar"
        role="img"
        aria-label={t('board.progressLabel', { done, inProgress, todo: total - done - inProgress })}
      >
        <span className="progress__seg progress__seg--done" style={{ width: `${pct(done)}%` }} />
        <span className="progress__seg progress__seg--progress" style={{ width: `${pct(inProgress)}%` }} />
      </div>
    </div>
  )
}
