import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '@/lib/api/tasks';
import { reminderAPI } from '@/lib/api/reminders';
import { activitiesApi } from '@/lib/api/activities';
import { notesApi } from '@/lib/api/notes';
import { documentsApi } from '@/lib/api/documents';
import type { CreateTaskRequest, TaskFeedItem, TaskResponseDto } from '@/lib/types/tasks';
import type { ActivityResponseDto } from '@/lib/types/activities';
import type { NoteResponseDto } from '@/lib/types/notes';
import type { DocumentResponseDto } from '@/lib/types/documents';
import {
  taskKeys,
  taskReminderKeys,
  taskActivityKeys,
  taskNoteKeys,
  taskDocumentKeys,
  leadTaskKeys,
} from '@/lib/queries/keys';

export function useTask(id: string) {
  return useQuery({
    queryKey: taskKeys.detail(id),
    queryFn: () => tasksApi.getTask(id),
    enabled: !!id,
  });
}

/**
 * PATCH /tasks/:id doesn't return the `lead` summary, so it's carried over from
 * the cached detail. Activity and reminders are refetched because the server
 * logs a timeline entry and may reschedule reminders on any change.
 */
export function useUpdateTask(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<CreateTaskRequest>) => tasksApi.updateTask(id, data),
    onSuccess: (updated) => {
      queryClient.setQueryData<TaskResponseDto>(taskKeys.detail(id), (old) => ({ ...updated, lead: old?.lead }));
      queryClient.invalidateQueries({ queryKey: taskActivityKeys.byTask(id) });
      queryClient.invalidateQueries({ queryKey: taskReminderKeys.byTask(id) });
      queryClient.invalidateQueries({
        queryKey: taskKeys.all,
        predicate: (q) => q.queryKey[1] !== 'detail',
      });
      if (updated.leadId) queryClient.invalidateQueries({ queryKey: leadTaskKeys.byLead(updated.leadId) });
    },
  });
}

export function useTaskReminders(taskId: string) {
  return useQuery({
    queryKey: taskReminderKeys.byTask(taskId),
    queryFn: async () =>
      (await reminderAPI.list({ taskId, limit: 50, sortBy: 'reminderTime', sortOrder: 'asc' })).data,
    enabled: !!taskId,
  });
}

export function useTaskNotes(taskId: string) {
  return useQuery({
    queryKey: taskNoteKeys.byTask(taskId),
    queryFn: () => notesApi.getByTask(taskId),
    enabled: !!taskId,
  });
}

export function useTaskDocuments(taskId: string) {
  return useQuery({
    queryKey: taskDocumentKeys.byTask(taskId),
    queryFn: () => documentsApi.getTaskDocuments(taskId),
    enabled: !!taskId,
  });
}

export function useUploadTaskDocument(taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => documentsApi.uploadTaskDocument(taskId, file),
    onSuccess: (doc) => {
      queryClient.setQueryData<DocumentResponseDto[]>(taskDocumentKeys.byTask(taskId), (old) => (old ? [doc, ...old] : [doc]));
    },
  });
}

export function useDeleteTaskDocument(taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (documentId: string) => documentsApi.deleteDocument(documentId),
    onSuccess: (_data, documentId) => {
      queryClient.setQueryData<DocumentResponseDto[]>(taskDocumentKeys.byTask(taskId), (old) =>
        old?.filter((d) => d.id !== documentId),
      );
    },
  });
}

function buildFeed(
  task: TaskResponseDto,
  activities: ActivityResponseDto[],
  notes: NoteResponseDto[],
  documents: DocumentResponseDto[],
): TaskFeedItem[] {
  const items: TaskFeedItem[] = [
    ...documents.map((d) => ({ id: `doc-${d.id}`, kind: 'document' as const, date: d.createdAt, document: d })),
    ...activities.map((a) => ({ id: `act-${a.id}`, kind: 'activity' as const, date: a.createdAt, activity: a })),
    ...notes.map((n) => ({ id: `note-${n.id}`, kind: 'note' as const, date: n.createdAt, note: n })),
  ];
  // Tasks created before activity logging existed have no CREATED entry — synthesize one.
  if (!activities.some((a) => a.action === 'CREATED')) {
    items.push({ id: `created-${task.id}`, kind: 'created', date: String(task.createdAt) });
  }
  return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/** Task change log, notes and uploads as one timeline, newest first. Shares caches with the Notes/Documents tabs. */
export function useTaskActivityFeed(task: TaskResponseDto) {
  const notesQuery = useTaskNotes(task.id);
  const documentsQuery = useTaskDocuments(task.id);
  const activitiesQuery = useQuery({
    queryKey: taskActivityKeys.byTask(task.id),
    queryFn: () => activitiesApi.list({ entityType: 'TASK', entityId: task.id }),
  });

  return {
    data: buildFeed(task, activitiesQuery.data ?? [], notesQuery.data ?? [], documentsQuery.data ?? []),
    isLoading: notesQuery.isLoading || activitiesQuery.isLoading || documentsQuery.isLoading,
  };
}

export function useCreateTaskTextNote(taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => notesApi.createTaskText(taskId, { body }),
    onSuccess: (note) => {
      queryClient.setQueryData<NoteResponseDto[]>(taskNoteKeys.byTask(taskId), (old) => (old ? [note, ...old] : [note]));
    },
  });
}

export function useCreateTaskVoiceNote(taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (blob: Blob) => notesApi.createTaskVoice(taskId, blob),
    onSuccess: (note) => {
      queryClient.setQueryData<NoteResponseDto[]>(taskNoteKeys.byTask(taskId), (old) => (old ? [note, ...old] : [note]));
    },
  });
}

/** Same supersede-not-mutate semantics as useEditLeadNote. */
export function useEditTaskNote(taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: string }) => notesApi.edit(id, { body }),
    onSuccess: (updated, variables) => {
      queryClient.setQueryData<NoteResponseDto[]>(taskNoteKeys.byTask(taskId), (old) =>
        old?.map((n) => (n.id === variables.id ? updated : n)),
      );
    },
  });
}

export function useDeleteTaskNote(taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notesApi.delete(id),
    onSuccess: (_data, id) => {
      queryClient.setQueryData<NoteResponseDto[]>(taskNoteKeys.byTask(taskId), (old) => old?.filter((n) => n.id !== id));
    },
  });
}
