import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Task } from '../api/types'
import { TaskCard } from './TaskCard'

const baseTask: Task = {
  id: '1',
  title: 'Prepare sprint demo',
  description: 'Slides and a live walkthrough',
  status: 'in_progress',
  priority: 'high',
  dueDate: null,
  createdAt: '2026-11-01T00:00:00Z',
  updatedAt: '2026-11-01T00:00:00Z',
}

describe('TaskCard', () => {
  it('shows the title, notes and priority', () => {
    render(<TaskCard task={baseTask} onOpen={vi.fn()} onMove={vi.fn()} />)
    expect(screen.getByText('Prepare sprint demo')).toBeInTheDocument()
    expect(screen.getByText('Slides and a live walkthrough')).toBeInTheDocument()
    expect(screen.getByText('High priority')).toBeInTheDocument()
  })

  it('moves the task to the neighbouring columns', async () => {
    const onMove = vi.fn()
    render(<TaskCard task={baseTask} onOpen={vi.fn()} onMove={onMove} />)

    await userEvent.click(screen.getByRole('button', { name: /move .* to done/i }))
    await userEvent.click(screen.getByRole('button', { name: /move .* to to do/i }))

    expect(onMove).toHaveBeenNthCalledWith(1, baseTask, 'done')
    expect(onMove).toHaveBeenNthCalledWith(2, baseTask, 'todo')
  })

  it('only offers valid moves at the edges of the board', () => {
    render(<TaskCard task={{ ...baseTask, status: 'todo' }} onOpen={vi.fn()} onMove={vi.fn()} />)
    expect(screen.queryByRole('button', { name: /move .* to done/i })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /move .* to in progress/i })).toBeInTheDocument()
  })

  it('opens the task for editing', async () => {
    const onOpen = vi.fn()
    render(<TaskCard task={baseTask} onOpen={onOpen} onMove={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /edit task/i }))
    expect(onOpen).toHaveBeenCalledWith(baseTask)
  })

  it('hides the due date once the task is done', () => {
    render(
      <TaskCard task={{ ...baseTask, status: 'done', dueDate: '2020-01-01' }} onOpen={vi.fn()} onMove={vi.fn()} />,
    )
    expect(screen.queryByText(/overdue/i)).not.toBeInTheDocument()
  })
})
