import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Task, TaskStatus } from '../api/types'
import { usePreferences } from '../preferences/PreferencesContext'
import { STATUSES } from '../utils/constants'

interface Props {
  task: Task
  onOpen: (task: Task) => void
  onMove: (task: Task, status: TaskStatus) => void
}

export function TaskCard({ task, onOpen, onMove }: Props) {
  const { t, due } = usePreferences()
  const index = STATUSES.indexOf(task.status)
  const neighbours = [
    { status: STATUSES[index - 1], Icon: ChevronLeft },
    { status: STATUSES[index + 1], Icon: ChevronRight },
  ].filter((n): n is { status: TaskStatus; Icon: typeof ChevronLeft } => Boolean(n.status))
  const dueLabel = task.dueDate && task.status !== 'done' ? due(task.dueDate) : null
  const priorityLabel = t(`priority.${task.priority}Long`)

  return (
    <article
      className={`card card--${task.priority}${task.status === 'done' ? ' card--done' : ''}`}
      data-flip-id={task.id}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/task-id', task.id)
        e.dataTransfer.effectAllowed = 'move'
        e.currentTarget.classList.add('card--dragging')
      }}
      onDragEnd={(e) => e.currentTarget.classList.remove('card--dragging')}
    >
      <button type="button" className="card__open" onClick={() => onOpen(task)}>
        <span className="visually-hidden">
          {priorityLabel}. {t('card.edit')}{' '}
        </span>
        <span className="card__title">{task.title}</span>
      </button>

      {task.description && <p className="card__desc">{task.description}</p>}

      <div className="card__footer">
        {dueLabel ? (
          <span className={`due due--${dueLabel.tone}`}>{dueLabel.text}</span>
        ) : (
          <span className="card__priority">{priorityLabel}</span>
        )}
        <span className="card__moves">
          {neighbours.map(({ status, Icon }) => {
            const column = t(`status.${status}`)
            return (
              <button
                key={status}
                type="button"
                className="icon-button icon-button--small"
                onClick={() => onMove(task, status)}
                aria-label={t('card.moveLabel', { title: task.title, column })}
                title={t('card.moveTitle', { column })}
              >
                <Icon size={16} />
              </button>
            )
          })}
        </span>
      </div>
    </article>
  )
}
