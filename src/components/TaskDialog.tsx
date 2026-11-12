import { Trash2, X } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ApiError } from '../api/client'
import type { Task, TaskInput, TaskPriority, TaskStatus } from '../api/types'
import { PRIORITIES, STATUSES } from '../utils/constants'

interface Props {
  /** Task being edited, or null when creating a new one. */
  task: Task | null
  open: boolean
  onClose: () => void
  onSave: (input: TaskInput) => Promise<void>
  onDelete: (task: Task) => Promise<void>
}

export function TaskDialog({ task, open, onClose, onSave, onDelete }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  // The parent remounts this component (via `key`) each time it opens, so state starts from the task
  const [title, setTitle] = useState(task?.title ?? '')
  const [description, setDescription] = useState(task?.description ?? '')
  const [priority, setPriority] = useState<TaskPriority>(task?.priority ?? 'medium')
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? 'todo')
  const [dueDate, setDueDate] = useState(task?.dueDate ?? '')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    else if (!open && dialog.open) dialog.close()
  }, [open])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('Give the task a title.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await onSave({
        title: title.trim(),
        description: description.trim() || (task ? null : undefined),
        priority,
        status,
        dueDate: dueDate || (task ? null : undefined),
      })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'The task could not be saved. Try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!task) return
    setSaving(true)
    try {
      await onDelete(task)
    } catch {
      setError('The task could not be deleted. Try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="dialog"
      aria-labelledby="task-dialog-title"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose()
      }}
    >
      <form className="dialog__body" onSubmit={handleSubmit} noValidate>
        <div className="dialog__head">
          <h2 id="task-dialog-title">{task ? 'Edit task' : 'New task'}</h2>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <label className="field">
          <span className="field__label">Title</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            autoFocus
            placeholder="What needs to get done?"
            aria-invalid={!!error && !title.trim()}
          />
        </label>

        <label className="field">
          <span className="field__label">Notes</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            maxLength={2000}
            placeholder="Optional details, links or next steps"
          />
        </label>

        <fieldset className="field">
          <legend className="field__label">Priority</legend>
          <div className="segmented">
            {PRIORITIES.map((p) => (
              <label key={p.id} className={`segmented__option segmented__option--${p.id}`}>
                <input
                  type="radio"
                  name="priority"
                  value={p.id}
                  checked={priority === p.id}
                  onChange={() => setPriority(p.id)}
                />
                <span>{p.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="field-row">
          <label className="field">
            <span className="field__label">Column</span>
            <select value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)}>
              {STATUSES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="field__label">Due date</span>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </label>
        </div>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <div className="dialog__actions">
          {task &&
            (confirmingDelete ? (
              <span className="confirm-delete">
                Delete this task?
                <button type="button" className="button button--danger" onClick={handleDelete} disabled={saving}>
                  Delete
                </button>
                <button type="button" className="button button--ghost" onClick={() => setConfirmingDelete(false)}>
                  Keep
                </button>
              </span>
            ) : (
              <button type="button" className="button button--ghost button--danger-text" onClick={() => setConfirmingDelete(true)}>
                <Trash2 size={16} aria-hidden="true" />
                Delete
              </button>
            ))}
          <button type="submit" className="button button--primary dialog__save" disabled={saving}>
            {saving ? 'Saving…' : task ? 'Save changes' : 'Add task'}
          </button>
        </div>
      </form>
    </dialog>
  )
}
