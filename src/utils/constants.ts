import type { TaskPriority, TaskStatus } from '../api/types'

/** Board columns in order. Labels come from the translation files (status.* and empty.*). */
export const STATUSES: TaskStatus[] = ['todo', 'in_progress', 'done']

export const PRIORITIES: TaskPriority[] = ['high', 'medium', 'low']
