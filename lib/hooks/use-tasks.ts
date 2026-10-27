import { useMutation, useQuery, useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { tasksApi } from '@/lib/api/tasks';
import type { CreateTaskRequest, PaginatedTaskResponse, TaskResponseDto } from '@/lib/types/tasks';
import { dashboardKeys, reminderKeys, taskKeys } from '@/lib/queries/keys';

/** getTasks returns a bare array when the server doesn't paginate — normalize to one shape. */
export function normalizeTasksResponse(
  response: PaginatedTaskResponse | TaskResponseDto[],
): PaginatedTaskResponse {
  if (Array.isArray(response)) {
    return {
      data: response,
      meta: {
        page: 1,
        limit: response.length,
        total: response.length,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      },
    };
  }
  return response;
}

/**
 * One request for the whole board instead of 5. Seeds each status column's
 * useInfiniteQuery cache (taskKeys.boardColumn) with its first page as a side
 * effect, so TaskBoardColumnContainer's own query finds fresh data already
 * there and never fires its own page-1 fetch.
 */
export function useTasksBoardSummary() {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: taskKeys.boardSummary(),
    queryFn: async () => {
      const board = await tasksApi.getTasksBoard();
      board.columns.forEach((column) => {
        queryClient.setQueryData<InfiniteData<PaginatedTaskResponse>>(
          taskKeys.boardColumn(column.status),
          (existing) => existing ?? { pages: [{ data: column.data, meta: column.meta }], pageParams: [1] },
        );
      });
      return board;
    },
  });
}

/** Same contract as useCreateLead: stays pending until the board or dashboard on screen shows the new task. */
export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTaskRequest) => tasksApi.createTask(data),
    onSuccess: (_created, data) => {
      const refetches = [
        queryClient.invalidateQueries({ queryKey: taskKeys.all }),
        queryClient.invalidateQueries({ queryKey: dashboardKeys.summary() }),
      ];
      if (data.reminderOffsets?.length || data.customReminderTimes?.length) {
        refetches.push(queryClient.invalidateQueries({ queryKey: reminderKeys.all }));
      }
      return Promise.all(refetches);
    },
  });
}

export interface UpdateTaskStatusPayload {
  task: TaskResponseDto;
  newStatus: string;
}

interface UpdateTaskStatusContext {
  previousOldColumn: InfiniteData<PaginatedTaskResponse> | undefined;
  previousNewColumn: InfiniteData<PaginatedTaskResponse> | undefined;
  oldColumnKey: ReturnType<typeof taskKeys.boardColumn>;
  newColumnKey: ReturnType<typeof taskKeys.boardColumn>;
}

/** Drives board drag-and-drop. Patches the two affected column caches directly
 * instead of invalidating them — an invalidate would refetch all mounted
 * columns on every single drag. */
export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();

  return useMutation<TaskResponseDto, Error, UpdateTaskStatusPayload, UpdateTaskStatusContext>({
    mutationFn: ({ task, newStatus }) => tasksApi.updateTask(task.id, { status: newStatus }),
    onMutate: ({ task, newStatus }) => {
      const oldColumnKey = taskKeys.boardColumn(task.status);
      const newColumnKey = taskKeys.boardColumn(newStatus);

      // Not awaited on purpose: the cache must move in the same tick as the drop, or the
      // board's drop animation measures the card in its old column and it flickers.
      // Safe — setQueryData also updates the state a cancelled fetch reverts to.
      void Promise.all([
        queryClient.cancelQueries({ queryKey: oldColumnKey }),
        queryClient.cancelQueries({ queryKey: newColumnKey }),
      ]);

      const previousOldColumn =
        queryClient.getQueryData<InfiniteData<PaginatedTaskResponse>>(oldColumnKey);
      const previousNewColumn =
        queryClient.getQueryData<InfiniteData<PaginatedTaskResponse>>(newColumnKey);

      queryClient.setQueryData<InfiniteData<PaginatedTaskResponse>>(oldColumnKey, (old) =>
        old && {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: page.data.filter((t) => t.id !== task.id),
            meta: { ...page.meta, total: Math.max(0, page.meta.total - 1) },
          })),
        },
      );

      queryClient.setQueryData<InfiniteData<PaginatedTaskResponse>>(newColumnKey, (old) => {
        if (!old) return old;
        const [firstPage, ...rest] = old.pages;
        return {
          ...old,
          pages: [
            {
              ...firstPage,
              data: [{ ...task, status: newStatus }, ...firstPage.data],
              meta: { ...firstPage.meta, total: firstPage.meta.total + 1 },
            },
            ...rest,
          ],
        };
      });

      return { previousOldColumn, previousNewColumn, oldColumnKey, newColumnKey };
    },
    onError: (_err, _vars, context) => {
      if (!context) return;
      queryClient.setQueryData(context.oldColumnKey, context.previousOldColumn);
      queryClient.setQueryData(context.newColumnKey, context.previousNewColumn);
    },
  });
}
