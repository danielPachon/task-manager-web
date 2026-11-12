import { Plus, Search } from 'lucide-react'
import type { TaskFilters, TaskPriority } from '../api/types'
import { usePreferences } from '../preferences/PreferencesContext'
import { PRIORITIES } from '../utils/constants'

interface Props {
  search: string
  onSearch: (value: string) => void
  filters: TaskFilters
  onFilters: (filters: TaskFilters) => void
  onNewTask: () => void
}

export function Toolbar({ search, onSearch, filters, onFilters, onNewTask }: Props) {
  const { t } = usePreferences()
  const setPriority = (priority?: TaskPriority) => onFilters({ ...filters, priority })

  const sorts = [
    { value: 'createdAt:desc', label: t('toolbar.newest') },
    { value: 'createdAt:asc', label: t('toolbar.oldest') },
    { value: 'dueDate:asc', label: t('toolbar.dueDate') },
    { value: 'priority:desc', label: t('toolbar.priority') },
  ]

  return (
    <div className="toolbar">
      <label className="search">
        <Search size={16} aria-hidden="true" />
        <span className="visually-hidden">{t('toolbar.search')}</span>
        <input
          type="search"
          placeholder={t('toolbar.search')}
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />
      </label>

      <div className="chips" role="group" aria-label={t('toolbar.filter')}>
        <button type="button" className="chip" aria-pressed={!filters.priority} onClick={() => setPriority(undefined)}>
          {t('toolbar.all')}
        </button>
        {PRIORITIES.map((p) => (
          <button
            key={p}
            type="button"
            className={`chip chip--${p}`}
            aria-pressed={filters.priority === p}
            onClick={() => setPriority(p)}
          >
            {t(`priority.${p}`)}
          </button>
        ))}
      </div>

      <div className="sort">
        <select
          aria-label={t('toolbar.sort')}
          value={`${filters.sortBy}:${filters.order}`}
          onChange={(e) => {
            const [sortBy, order] = e.target.value.split(':') as [TaskFilters['sortBy'], TaskFilters['order']]
            onFilters({ ...filters, sortBy, order })
          }}
        >
          {sorts.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <button type="button" className="button button--primary toolbar__new" onClick={onNewTask}>
        <Plus size={18} aria-hidden="true" />
        {t('toolbar.newTask')}
      </button>
    </div>
  )
}
