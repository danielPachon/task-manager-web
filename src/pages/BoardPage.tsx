import { useMemo, useState } from 'react'
import { ApiError } from '../api/client'
import type { Task, TaskFilters, TaskInput, TaskStatus } from '../api/types'
import { Header } from '../components/Header'
import { Progress } from '../components/Progress'
import { TaskColumn } from '../components/TaskColumn'
import { TaskDialog } from '../components/TaskDialog'
import { useToast } from '../components/Toast'
import { Toolbar } from '../components/Toolbar'
import { useDebounced } from '../hooks/useDebounced'
import { useTaskMutations, useTasks } from '../hooks/useTasks'
import { STATUSES, STATUS_LABEL } from '../utils/constants'

export function BoardPage() {
  const toast = useToast()
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
        onSuccess: () => toast(`Moved to ${STATUS_LABEL[status]}`),
        onError: () => toast('The task could not be moved. Try again.', 'error'),
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
      toast('Changes saved')
    } else {
      await create.mutateAsync(input)
      toast('Task added')
    }
    setDialogOpen(false)
  }

  const handleDelete = async (task: Task) => {
    await remove.mutateAsync(task.id)
    setDialogOpen(false)
    toast('Task deleted')
  }

  const filtering = Boolean(debouncedSearch || filters.priority)

  return (
    <div className="board-page">
      <Header />
      <main className="board-main">
        <div className="board-intro">
          <h1>Board</h1>
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
              {query.error instanceof ApiError ? query.error.message : 'Tasks could not be loaded.'}
            </p>
            <button type="button" className="button button--primary" onClick={() => query.refetch()}>
              Try again
            </button>
          </div>
        ) : query.isPending ? (
          <div className="board board--loading" aria-busy="true" aria-label="Loading tasks">
            {STATUSES.map((s) => (
              <div key={s.id} className="column column--skeleton">
                <span className="skeleton skeleton--head" />
                <span className="skeleton" />
                <span className="skeleton" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {filtering && tasks.length === 0 && (
              <p className="board-filter-note">No tasks match these filters.</p>
            )}
            <div className="board">
              {STATUSES.map((s) => (
                <TaskColumn
                  key={s.id}
                  status={s.id}
                  label={s.label}
                  empty={filtering ? 'No matching tasks.' : s.empty}
                  tasks={byStatus[s.id]}
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
