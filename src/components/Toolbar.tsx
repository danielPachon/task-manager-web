import { Plus, Search } from 'lucide-react'
import type { TaskFilters, TaskPriority } from '../api/types'
import { PRIORITIES } from '../utils/constants'

interface Props {
  search: string
  onSearch: (value: string) => void
  filters: TaskFilters
  onFilters: (filters: TaskFilters) => void
  onNewTask: () => void
}

const SORTS: { value: string; label: string }[] = [
  { value: 'createdAt:desc', label: 'Newest first' },
  { value: 'createdAt:asc', label: 'Oldest first' },
  { value: 'dueDate:asc', label: 'Due date' },
  { value: 'priority:desc', label: 'Priority' },
]

export function Toolbar({ search, onSearch, filters, onFilters, onNewTask }: Props) {
  const setPriority = (priority?: TaskPriority) => onFilters({ ...filters, priority })

  return (
    <div className="toolbar">
      <label className="search">
        <Search size={16} aria-hidden="true" />
        <span className="visually-hidden">Search tasks</span>
        <input
          type="search"
          placeholder="Search tasks"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />
      </label>

      <div className="chips" role="group" aria-label="Filter by priority">
        <button
          type="button"
          className="chip"
          aria-pressed={!filters.priority}
          onClick={() => setPriority(undefined)}
        >
          All
        </button>
        {PRIORITIES.map((p) => (
          <button
            key={p.id}
            type="button"
            className={`chip chip--${p.id}`}
            aria-pressed={filters.priority === p.id}
            onClick={() => setPriority(p.id)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="sort">
        <select
          aria-label="Sort tasks"
          value={`${filters.sortBy}:${filters.order}`}
          onChange={(e) => {
            const [sortBy, order] = e.target.value.split(':') as [TaskFilters['sortBy'], TaskFilters['order']]
            onFilters({ ...filters, sortBy, order })
          }}
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <button type="button" className="button button--primary toolbar__new" onClick={onNewTask}>
        <Plus size={18} aria-hidden="true" />
        New task
      </button>
    </div>
  )
}
