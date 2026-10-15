'use client';

import {
  useTaskNotes,
  useCreateTaskTextNote,
  useCreateTaskVoiceNote,
  useEditTaskNote,
  useDeleteTaskNote,
} from '@/lib/hooks/use-task-detail';
import NotesPanel from '@/components/notes/notes-panel';

interface TaskNotesTabProps {
  taskId: string;
}

export default function TaskNotesTab({ taskId }: TaskNotesTabProps) {
  const { data: notes = [], isLoading } = useTaskNotes(taskId);
  const createTextNote = useCreateTaskTextNote(taskId);
  const createVoiceNote = useCreateTaskVoiceNote(taskId);
  const editNote = useEditTaskNote(taskId);
  const deleteNote = useDeleteTaskNote(taskId);

  return (
    <NotesPanel
      notes={notes}
      isLoading={isLoading}
      placeholder="Add a note about this task..."
      onCreateText={createTextNote.mutateAsync}
      onCreateVoice={createVoiceNote.mutateAsync}
      onEdit={(id, body) => editNote.mutateAsync({ id, body })}
      onDelete={deleteNote.mutateAsync}
      creatingText={createTextNote.isPending}
      creatingVoice={createVoiceNote.isPending}
    />
  );
}
