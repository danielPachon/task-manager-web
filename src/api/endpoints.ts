import { request } from './client'
import type { AuthResponse, Paginated, Task, TaskFilters, TaskInput, User } from './types'

export const authApi = {
  login: (email: string, password: string) =>
    request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  register: (name: string, email: string, password: string) =>
    request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),

  me: () => request<{ user: User }>('/auth/me'),
}

export const tasksApi = {
  /** The board shows up to 100 tasks, the API's maximum page size. */
  list: (filters: TaskFilters) => {
    const params = new URLSearchParams({ limit: '100', sortBy: filters.sortBy, order: filters.order })
    if (filters.search) params.set('search', filters.search)
    if (filters.priority) params.set('priority', filters.priority)
    return request<Paginated<Task>>(`/tasks?${params}`)
  },

  create: (input: TaskInput) => request<Task>('/tasks', { method: 'POST', body: JSON.stringify(input) }),

  update: (id: string, input: Partial<TaskInput>) =>
    request<Task>(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),

  remove: (id: string) => request<void>(`/tasks/${id}`, { method: 'DELETE' }),
}
