'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Mic, Type, Play, Pencil, Trash2, MessageSquare } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { notesApi, type NoteResponseDto } from '@/lib/api/notes';
import { formatDateTime } from '@/lib/utils/date';
import EmptyState from '@/components/empty-state';
import VoiceRecorder from '@/components/voice-recorder';

interface NotesPanelProps {
  notes: NoteResponseDto[];
  isLoading: boolean;
  placeholder: string;
  onCreateText: (body: string) => Promise<unknown>;
  onCreateVoice: (blob: Blob) => Promise<unknown>;
  onEdit: (id: string, body: string) => Promise<unknown>;
  onDelete: (id: string) => Promise<unknown>;
  creatingText: boolean;
  creatingVoice: boolean;
}

/** Text + voice note composer and list. Storage-agnostic — the caller wires it to lead or task notes. */
export default function NotesPanel({
  notes,
  isLoading,
  placeholder,
  onCreateText,
  onCreateVoice,
  onEdit,
  onDelete,
  creatingText,
  creatingVoice,
}: NotesPanelProps) {
  const { user } = useAuth();

  const [mode, setMode] = useState<'text' | 'voice'>('text');
  const [textValue, setTextValue] = useState('');
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);
  const [voiceRecorderKey, setVoiceRecorderKey] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleSubmitText = async () => {
    const body = textValue.trim();
    if (!body) return;
    try {
      setError(null);
      await onCreateText(body);
      setTextValue('');
    } catch {
      setError('Failed to save note');
    }
  };

  const handleSubmitVoice = async () => {
    if (!voiceBlob) return;
    try {
      setError(null);
      await onCreateVoice(voiceBlob);
      setVoiceBlob(null);
      setVoiceRecorderKey((k) => k + 1);
      setMode('text');
    } catch {
      setError('Failed to save voice note');
    }
  };

  return (
    <div className="space-y-4">
      {/* Composer */}
      <div className="surface border border-[var(--border)] rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => setMode('text')}
            className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors ${
              mode === 'text' ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'text-subtle hover:text-primary'
            }`}
          >
            <Type size={13} />
            Text
          </button>
          <button
            onClick={() => setMode('voice')}
            className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors ${
              mode === 'voice' ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'text-subtle hover:text-primary'
            }`}
          >
            <Mic size={13} />
            Voice
          </button>
        </div>

        {mode === 'text' ? (
          <div className="space-y-2">
            <textarea
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              rows={3}
              placeholder={placeholder}
              className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent surface text-primary resize-none"
            />
            <div className="flex justify-end">
              <button
                onClick={handleSubmitText}
                disabled={!textValue.trim() || creatingText}
                className="text-xs font-medium px-3 py-1.5 rounded-lg bg-gray-900 text-white dark:bg-white dark:text-gray-900 hover:opacity-90 disabled:opacity-40 transition-opacity"
              >
                {creatingText ? 'Saving...' : 'Add note'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <VoiceRecorder key={voiceRecorderKey} onVoiceRecorded={setVoiceBlob} onVoiceCleared={() => setVoiceBlob(null)} />
            {voiceBlob && (
              <div className="flex justify-end">
                <button
                  onClick={handleSubmitVoice}
                  disabled={creatingVoice}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg bg-gray-900 text-white dark:bg-white dark:text-gray-900 hover:opacity-90 disabled:opacity-40 transition-opacity"
                >
                  {creatingVoice ? 'Saving...' : 'Save voice note'}
                </button>
              </div>
            )}
          </div>
        )}

        {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
      </div>

      {/* Notes list */}
      {isLoading ? (
        <p className="text-sm text-subtle">Loading notes...</p>
      ) : notes.length === 0 ? (
        <EmptyState message="No notes yet" icon={<MessageSquare size={32} className="mx-auto text-subtle" />} />
      ) : (
        <ul className="space-y-2">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              isAuthor={!!user && note.authorId === user.id}
              onEdit={(body) => onEdit(note.id, body)}
              onDelete={() => onDelete(note.id)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function NoteCard({
  note,
  isAuthor,
  onEdit,
  onDelete,
}: {
  note: NoteResponseDto;
  isAuthor: boolean;
  onEdit: (body: string) => Promise<unknown>;
  onDelete: () => Promise<unknown>;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(note.body ?? '');
  const [saving, setSaving] = useState(false);

  const startEdit = () => {
    setDraft(note.body ?? '');
    setEditing(true);
  };

  const saveEdit = async () => {
    if (!draft.trim()) return;
    setSaving(true);
    try {
      await onEdit(draft.trim());
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <li className="p-3 rounded-lg border border-[var(--border)] surface">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {note.type === 'VOICE' ? (
            <VoiceNotePlayer noteId={note.id} />
          ) : editing ? (
            <div className="space-y-2">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={3}
                autoFocus
                className="w-full px-2 py-1.5 text-sm border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent surface text-primary resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={saveEdit}
                  disabled={saving || !draft.trim()}
                  className="text-xs font-medium px-2.5 py-1 rounded bg-gray-900 text-white dark:bg-white dark:text-gray-900 hover:opacity-90 disabled:opacity-40"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="text-xs font-medium px-2.5 py-1 rounded border border-[var(--border)] text-primary hover:opacity-70"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-primary whitespace-pre-wrap break-words">{note.body}</p>
          )}

          <p className="text-xs text-subtle mt-2">
            {note.authorName ?? 'Unknown'} &middot; {formatDateTime(note.createdAt)}
            {note.previousVersionId && ' · edited'}
          </p>
        </div>

        {isAuthor && !editing && (
          <div className="flex items-center gap-1 shrink-0">
            {note.type === 'TEXT' && (
              <button onClick={startEdit} className="p-1.5 text-subtle hover:text-primary transition-colors" title="Edit">
                <Pencil size={13} />
              </button>
            )}
            <button onClick={onDelete} className="p-1.5 text-subtle hover:text-red-500 transition-colors" title="Delete">
              <Trash2 size={13} />
            </button>
          </div>
        )}
      </div>
    </li>
  );
}

function VoiceNotePlayer({ noteId }: { noteId: string }) {
  const [loaded, setLoaded] = useState(false);
  const { data: blob, isFetching } = useQuery({
    queryKey: ['noteAudio', noteId],
    queryFn: () => notesApi.getAudioBlob(noteId),
    enabled: loaded,
    staleTime: Infinity,
  });
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!blob) return;
    const objectUrl = URL.createObjectURL(blob);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [blob]);

  if (url) {
    return <audio controls autoPlay src={url} className="h-9 max-w-[240px]" />;
  }

  return (
    <button
      onClick={() => setLoaded(true)}
      disabled={isFetching}
      className="flex items-center gap-1.5 text-xs font-medium text-primary border border-[var(--border)] px-2.5 py-1.5 rounded-lg hover:opacity-70 disabled:opacity-50 transition-opacity"
    >
      <Play size={12} />
      {isFetching ? 'Loading...' : 'Play voice note'}
    </button>
  );
}
