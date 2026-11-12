import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { tasksApi } from '../api/endpoints'
import type { Paginated, Task, TaskFilters, TaskInput } from '../api/types'

const tasksKey = (filters: TaskFilters) => ['tasks', filters] as const

export function useTasks(filters: TaskFilters) {
  return useQuery({
    queryKey: tasksKey(filters),
    queryFn: () => tasksApi.list(filters),
    placeholderData: (previous) => previous,
  })
}

export function useTaskMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['tasks'] })

  const create = useMutation({
    mutationFn: (input: TaskInput) => tasksApi.create(input),
    onSuccess: invalidate,
  })

  /**
   * Updates are applied optimistically so dragging a card between columns feels instant;
   * the previous cache is restored if the request fails.
   */
  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<TaskInput> }) => tasksApi.update(id, input),
    onMutate: async ({ id, input }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] })
      const snapshots = queryClient.getQueriesData<Paginated<Task>>({ queryKey: ['tasks'] })
      queryClient.setQueriesData<Paginated<Task>>({ queryKey: ['tasks'] }, (old) =>
        old ? { ...old, data: old.data.map((t) => (t.id === id ? ({ ...t, ...input } as Task) : t)) } : old,
      )
      return { snapshots }
    },
    onError: (_err, _vars, context) => {
      context?.snapshots.forEach(([key, data]) => queryClient.setQueryData(key, data))
    },
    onSettled: invalidate,
  })

  const remove = useMutation({
    mutationFn: (id: string) => tasksApi.remove(id),
    onSuccess: invalidate,
  })

  return { create, update, remove }
}
