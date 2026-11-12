import { useMemo, useState } from 'react'
import type { Task, TaskFilters, TaskInput, TaskStatus } from '../api/types'
import { Header } from '../components/Header'
import { Progress } from '../components/Progress'
import { TaskColumn } from '../components/TaskColumn'
import { TaskDialog } from '../components/TaskDialog'
import { useToast } from '../components/Toast'
import { Toolbar } from '../components/Toolbar'
import { useDebounced } from '../hooks/useDebounced'
import { useTaskMutations, useTasks } from '../hooks/useTasks'
import { errorMessage } from '../i18n/translate'
import { usePreferences } from '../preferences/PreferencesContext'
import { STATUSES } from '../utils/constants'

export function BoardPage() {
  const toast = useToast()
  const { t } = usePreferences()
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<TaskFilters>({ sortBy: 'createdAt', order: 'desc' })
  const debouncedSearch = useDebounced(search.trim())
  const query = useTasks({ ...filters, search: debouncedSearch || undefined })
  const { create, update, remove } = useTaskMutations()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Task | null>(null)
  const [dialogKey, setDialogKey] = useState(0)

  const tasks = useMemo(() => query.data?.data ?? [], [query.data])
  const byStatus = useMemo(() => {
    const groups: Record<TaskStatus, Task[]> = { todo: [], in_progress: [], done: [] }
    tasks.forEach((t) => groups[t.status].push(t))
    return groups
  }, [tasks])

  const openNew = () => {
    setEditing(null)
    setDialogKey((k) => k + 1)
    setDialogOpen(true)
  }

  const openEdit = (task: Task) => {
    setEditing(task)
    setDialogKey((k) => k + 1)
    setDialogOpen(true)
  }

  const moveTask = (task: Task, status: TaskStatus) => {
    if (task.status === status) return
    update.mutate(
      { id: task.id, input: { status } },
      {
        onSuccess: () => toast(t('toast.moved', { column: t(`status.${status}`) })),
        onError: () => toast(t('toast.moveError'), 'error'),
      },
    )
  }

  const handleDrop = (taskId: string, status: TaskStatus) => {
    const task = tasks.find((t) => t.id === taskId)
    if (task) moveTask(task, status)
  }

  const handleSave = async (input: TaskInput) => {
    if (editing) {
      await update.mutateAsync({ id: editing.id, input })
      toast(t('toast.saved'))
    } else {
      await create.mutateAsync(input)
      toast(t('toast.added'))
    }
    setDialogOpen(false)
  }

  const handleDelete = async (task: Task) => {
    await remove.mutateAsync(task.id)
    setDialogOpen(false)
    toast(t('toast.deleted'))
  }

  const filtering = Boolean(debouncedSearch || filters.priority)

  return (
    <div className="board-page">
      <Header />
      <main className="board-main">
        <div className="board-intro">
          <h1>{t('board.title')}</h1>
          <Progress tasks={tasks} />
        </div>

        <Toolbar
          search={search}
          onSearch={setSearch}
          filters={filters}
          onFilters={setFilters}
          onNewTask={openNew}
        />

        {query.isError ? (
          <div className="board-message" role="alert">
            <p>
              {query.error && errorMessage(query.error, t) !== t('errors.generic')
                ? errorMessage(query.error, t)
                : t('board.loadError')}
            </p>
            <button type="button" className="button button--primary" onClick={() => query.refetch()}>
              {t('board.retry')}
            </button>
          </div>
        ) : query.isPending ? (
          <div className="board board--loading" aria-busy="true" aria-label={t('board.loading')}>
            {STATUSES.map((s) => (
              <div key={s} className="column column--skeleton">
                <span className="skeleton skeleton--head" />
                <span className="skeleton" />
                <span className="skeleton" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {filtering && tasks.length === 0 && (
              <p className="board-filter-note">{t('board.noMatch')}</p>
            )}
            <div className="board">
              {STATUSES.map((s) => (
                <TaskColumn
                  key={s}
                  status={s}
                  label={t(`status.${s}`)}
                  empty={filtering ? t('board.noMatchColumn') : t(`empty.${s}`)}
                  tasks={byStatus[s]}
                  onOpen={openEdit}
                  onMove={moveTask}
                  onDropTask={handleDrop}
                />
              ))}
            </div>
          </>
        )}
      </main>

      <TaskDialog
        key={dialogKey}
        open={dialogOpen}
        task={editing}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  )
}
