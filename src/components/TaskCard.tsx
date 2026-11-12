import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Task, TaskStatus } from '../api/types'
import { STATUSES, STATUS_LABEL } from '../utils/constants'
import { describeDue } from '../utils/dates'

interface Props {
  task: Task
  onOpen: (task: Task) => void
  onMove: (task: Task, status: TaskStatus) => void
}

const PRIORITY_LABEL = { high: 'High priority', medium: 'Medium priority', low: 'Low priority' }

export function TaskCard({ task, onOpen, onMove }: Props) {
  const index = STATUSES.findIndex((s) => s.id === task.status)
  const prev = STATUSES[index - 1]
  const next = STATUSES[index + 1]
  const due = task.dueDate && task.status !== 'done' ? describeDue(task.dueDate) : null

  return (
    <article
      className={`card card--${task.priority}${task.status === 'done' ? ' card--done' : ''}`}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/task-id', task.id)
        e.dataTransfer.effectAllowed = 'move'
        e.currentTarget.classList.add('card--dragging')
      }}
      onDragEnd={(e) => e.currentTarget.classList.remove('card--dragging')}
    >
      <button type="button" className="card__open" onClick={() => onOpen(task)}>
        <span className="visually-hidden">{PRIORITY_LABEL[task.priority]}. Edit task: </span>
        <span className="card__title">{task.title}</span>
      </button>

      {task.description && <p className="card__desc">{task.description}</p>}

      <div className="card__footer">
        {due ? (
          <span className={`due due--${due.tone}`}>{due.text}</span>
        ) : (
          <span className="card__priority">{PRIORITY_LABEL[task.priority]}</span>
        )}
        <span className="card__moves">
          {prev && (
            <button
              type="button"
              className="icon-button icon-button--small"
              onClick={() => onMove(task, prev.id)}
              aria-label={`Move "${task.title}" to ${STATUS_LABEL[prev.id]}`}
              title={`Move to ${STATUS_LABEL[prev.id]}`}
            >
              <ChevronLeft size={16} />
            </button>
          )}
          {next && (
            <button
              type="button"
              className="icon-button icon-button--small"
              onClick={() => onMove(task, next.id)}
              aria-label={`Move "${task.title}" to ${STATUS_LABEL[next.id]}`}
              title={`Move to ${STATUS_LABEL[next.id]}`}
            >
              <ChevronRight size={16} />
            </button>
          )}
        </span>
      </div>
    </article>
  )
}
