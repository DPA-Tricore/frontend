import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { leadsApi } from '@/lib/api/leads';
import { tasksApi } from '@/lib/api/tasks';
import type { TaskResponseDto } from '@/lib/types/tasks';
import { documentsApi, type DocumentResponseDto } from '@/lib/api/documents';
import { reminderAPI } from '@/lib/api/reminders';
import type { ReminderResponseDto } from '@/lib/types/reminders';
import { activitiesApi } from '@/lib/api/activities';
import type { ActivityResponseDto } from '@/lib/types/activities';
import { notesApi } from '@/lib/api/notes';
import type { NoteResponseDto } from '@/lib/types/notes';
import {
  leadKeys,
  leadTaskKeys,
  leadDocumentKeys,
  leadReminderKeys,
  leadActivityKeys,
  leadNoteKeys,
} from '@/lib/queries/keys';

export function useLead(id: string) {
  return useQuery({
    queryKey: leadKeys.detail(id),
    queryFn: () => leadsApi.getLead(id),
    enabled: !!id,
  });
}

export function useLeadTasks(leadId: string) {
  return useQuery({
    queryKey: leadTaskKeys.byLead(leadId),
    queryFn: () => tasksApi.getTasksByLeadId(leadId),
    enabled: !!leadId,
  });
}

export function useLeadDocuments(leadId: string) {
  return useQuery({
    queryKey: leadDocumentKeys.byLead(leadId),
    queryFn: () => documentsApi.getLeadDocuments(leadId),
    enabled: !!leadId,
  });
}

export function useLeadReminders(leadId: string) {
  return useQuery({
    queryKey: leadReminderKeys.byLead(leadId),
    queryFn: async () =>
      (await reminderAPI.list({ leadId, limit: 50, sortBy: 'reminderTime', sortOrder: 'asc' })).data,
    enabled: !!leadId,
  });
}

type ActivityKind = 'task' | 'reminder' | 'document' | 'activity' | 'note';

export interface ActivityItem {
  id: string;
  kind: ActivityKind;
  date: string;
  task?: TaskResponseDto;
  reminder?: ReminderResponseDto;
  document?: DocumentResponseDto;
  activity?: ActivityResponseDto;
  note?: NoteResponseDto;
}

function buildFeed(
  tasks: TaskResponseDto[],
  reminders: ReminderResponseDto[],
  documents: DocumentResponseDto[],
  activities: ActivityResponseDto[],
  notes: NoteResponseDto[],
): ActivityItem[] {
  const items: ActivityItem[] = [
    ...tasks.map((t) => ({ id: `task-${t.id}`, kind: 'task' as const, date: String(t.createdAt), task: t })),
    ...reminders.map((r) => ({ id: `rem-${r.id}`, kind: 'reminder' as const, date: r.createdAt, reminder: r })),
    ...documents.map((d) => ({ id: `doc-${d.id}`, kind: 'document' as const, date: d.createdAt, document: d })),
    ...activities.map((a) => ({ id: `act-${a.id}`, kind: 'activity' as const, date: a.createdAt, activity: a })),
    ...notes.map((n) => ({ id: `note-${n.id}`, kind: 'note' as const, date: n.createdAt, note: n })),
  ];
  return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Merges tasks/reminders/documents/activities/notes into one timeline. Composed
 * from useLeadTasks/useLeadDocuments/useLeadReminders/useLeadNotes (rather than
 * its own fetch) so that landing on the detail page — stats bar + activity tab
 * mount together — doesn't fetch tasks/documents twice.
 */
export function useLeadActivityFeed(leadId: string) {
  const tasksQuery = useLeadTasks(leadId);
  const documentsQuery = useLeadDocuments(leadId);
  const remindersQuery = useLeadReminders(leadId);
  const notesQuery = useLeadNotes(leadId);
  const activitiesQuery = useQuery({
    queryKey: leadActivityKeys.byLead(leadId),
    queryFn: () => activitiesApi.list({ entityType: 'LEAD', entityId: leadId }),
    enabled: !!leadId,
  });

  return {
    data: buildFeed(
      tasksQuery.data ?? [],
      remindersQuery.data ?? [],
      documentsQuery.data ?? [],
      activitiesQuery.data ?? [],
      notesQuery.data ?? [],
    ),
    isLoading:
      tasksQuery.isLoading ||
      documentsQuery.isLoading ||
      remindersQuery.isLoading ||
      activitiesQuery.isLoading ||
      notesQuery.isLoading,
  };
}

export interface NextActionItem {
  kind: 'task' | 'reminder';
  id: string;
  title: string;
  dueDate: string;
  taskType?: string;
}

/**
 * Earliest-due open task or pending reminder, i.e. "what should happen next"
 * for this lead. Composed from useLeadTasks/useLeadReminders (shared cache)
 * rather than its own fetch, same reasoning as useLeadActivityFeed above.
 */
export function useLeadNextAction(leadId: string) {
  const tasksQuery = useLeadTasks(leadId);
  const remindersQuery = useLeadReminders(leadId);

  const openTasks = (tasksQuery.data ?? []).filter(
    (t) => t.status !== 'COMPLETED' && t.status !== 'CANCELLED',
  );
  const openReminders = (remindersQuery.data ?? []).filter(
    (r) => r.status === 'PENDING' || r.status === 'TRIGGERED',
  );

  const candidates: NextActionItem[] = [
    ...openTasks.map((t) => ({ kind: 'task' as const, id: t.id, title: t.title, dueDate: String(t.dueDate), taskType: t.type })),
    ...openReminders.map((r) => ({ kind: 'reminder' as const, id: r.id, title: r.title, dueDate: r.dueDate })),
  ];
  candidates.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  return {
    nextAction: candidates[0] ?? null,
    isLoading: tasksQuery.isLoading || remindersQuery.isLoading,
  };
}

export function useUploadLeadDocument(leadId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => documentsApi.uploadLeadDocument(leadId, file),
    onSuccess: (doc) => {
      queryClient.setQueryData<DocumentResponseDto[]>(leadDocumentKeys.byLead(leadId), (old) =>
        old ? [doc, ...old] : [doc],
      );
    },
  });
}

export function useDeleteLeadDocument(leadId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (documentId: string) => documentsApi.deleteDocument(documentId),
    onSuccess: (_data, documentId) => {
      queryClient.setQueryData<DocumentResponseDto[]>(leadDocumentKeys.byLead(leadId), (old) =>
        old?.filter((d) => d.id !== documentId),
      );
    },
  });
}

export function useLeadNotes(leadId: string) {
  return useQuery({
    queryKey: leadNoteKeys.byLead(leadId),
    queryFn: () => notesApi.getByLead(leadId),
    enabled: !!leadId,
  });
}

export function useCreateLeadTextNote(leadId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => notesApi.createText(leadId, { body }),
    onSuccess: (note) => {
      queryClient.setQueryData<NoteResponseDto[]>(leadNoteKeys.byLead(leadId), (old) =>
        old ? [note, ...old] : [note],
      );
    },
  });
}

export function useCreateLeadVoiceNote(leadId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (blob: Blob) => notesApi.createVoice(leadId, blob),
    onSuccess: (note) => {
      queryClient.setQueryData<NoteResponseDto[]>(leadNoteKeys.byLead(leadId), (old) =>
        old ? [note, ...old] : [note],
      );
    },
  });
}

/** Edits never mutate a row server-side — the mutation returns a brand new
 * note that supersedes `id`, so the cache patch replaces that entry wholesale
 * rather than merging fields into it. */
export function useEditLeadNote(leadId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: string }) => notesApi.edit(id, { body }),
    onSuccess: (updated, variables) => {
      queryClient.setQueryData<NoteResponseDto[]>(leadNoteKeys.byLead(leadId), (old) =>
        old?.map((n) => (n.id === variables.id ? updated : n)),
      );
    },
  });
}

export function useDeleteLeadNote(leadId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notesApi.delete(id),
    onSuccess: (_data, id) => {
      queryClient.setQueryData<NoteResponseDto[]>(leadNoteKeys.byLead(leadId), (old) =>
        old?.filter((n) => n.id !== id),
      );
    },
  });
}
