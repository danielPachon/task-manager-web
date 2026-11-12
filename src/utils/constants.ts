import type { TaskPriority, TaskStatus } from '../api/types'

export const STATUSES: { id: TaskStatus; label: string; empty: string }[] = [
  { id: 'todo', label: 'To do', empty: 'Nothing waiting. Add a task to get started.' },
  { id: 'in_progress', label: 'In progress', empty: 'Move a task here when you start on it.' },
  { id: 'done', label: 'Done', empty: 'Finished tasks land here.' },
]

export const PRIORITIES: { id: TaskPriority; label: string }[] = [
  { id: 'high', label: 'High' },
  { id: 'medium', label: 'Medium' },
  { id: 'low', label: 'Low' },
]

export const STATUS_LABEL: Record<TaskStatus, string> = {
  todo: 'To do',
  in_progress: 'In progress',
  done: 'Done',
}
