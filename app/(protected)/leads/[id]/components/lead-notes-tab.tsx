'use client';

import {
  useLeadNotes,
  useCreateLeadTextNote,
  useCreateLeadVoiceNote,
  useEditLeadNote,
  useDeleteLeadNote,
} from '@/lib/hooks/use-lead-detail';
import NotesPanel from '@/components/notes/notes-panel';

interface Props {
  leadId: string;
}

export default function LeadNotesTab({ leadId }: Props) {
  const { data: notes = [], isLoading } = useLeadNotes(leadId);
  const createTextNote = useCreateLeadTextNote(leadId);
  const createVoiceNote = useCreateLeadVoiceNote(leadId);
  const editNote = useEditLeadNote(leadId);
  const deleteNote = useDeleteLeadNote(leadId);

  return (
    <NotesPanel
      notes={notes}
      isLoading={isLoading}
      placeholder="Add a note about this lead..."
      onCreateText={createTextNote.mutateAsync}
      onCreateVoice={createVoiceNote.mutateAsync}
      onEdit={(id, body) => editNote.mutateAsync({ id, body })}
      onDelete={deleteNote.mutateAsync}
      creatingText={createTextNote.isPending}
      creatingVoice={createVoiceNote.isPending}
    />
  );
}
