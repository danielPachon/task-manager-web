import { useState } from 'react'
import type { Task, TaskStatus } from '../api/types'
import { TaskCard } from './TaskCard'

interface Props {
  status: TaskStatus
  label: string
  empty: string
  tasks: Task[]
  onOpen: (task: Task) => void
  onMove: (task: Task, status: TaskStatus) => void
  onDropTask: (taskId: string, status: TaskStatus) => void
}

export function TaskColumn({ status, label, empty, tasks, onOpen, onMove, onDropTask }: Props) {
  const [over, setOver] = useState(false)

  return (
    <section
      className={`column column--${status}${over ? ' column--over' : ''}`}
      aria-labelledby={`col-${status}`}
      onDragOver={(e) => {
        if (!e.dataTransfer.types.includes('text/task-id')) return
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
        setOver(true)
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOver(false)
      }}
      onDrop={(e) => {
        e.preventDefault()
        setOver(false)
        const id = e.dataTransfer.getData('text/task-id')
        if (id) onDropTask(id, status)
      }}
    >
      <h2 className="column__head" id={`col-${status}`}>
        {label}
        <span className="column__count">{tasks.length}</span>
      </h2>
      <div className="column__list">
        {tasks.length === 0 ? (
          <p className="column__empty">{empty}</p>
        ) : (
          tasks.map((task) => <TaskCard key={task.id} task={task} onOpen={onOpen} onMove={onMove} />)
        )}
      </div>
    </section>
  )
}
