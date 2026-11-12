import type { Task } from '../api/types'

/** Segmented bar showing how the visible tasks split across the three columns. */
export function Progress({ tasks }: { tasks: Task[] }) {
  const total = tasks.length
  const done = tasks.filter((t) => t.status === 'done').length
  const inProgress = tasks.filter((t) => t.status === 'in_progress').length
  const pct = (n: number) => (total ? (n / total) * 100 : 0)

  return (
    <div className="progress">
      <p className="progress__text">
        {total === 0 ? (
          'No tasks yet'
        ) : (
          <>
            <strong>{done}</strong> of {total} done
          </>
        )}
      </p>
      <div
        className="progress__bar"
        role="img"
        aria-label={`${done} done, ${inProgress} in progress, ${total - done - inProgress} to do`}
      >
        <span className="progress__seg progress__seg--done" style={{ width: `${pct(done)}%` }} />
        <span className="progress__seg progress__seg--progress" style={{ width: `${pct(inProgress)}%` }} />
      </div>
    </div>
  )
}
