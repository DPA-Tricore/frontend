export type NoteType = 'TEXT' | 'VOICE';

export interface NoteResponseDto {
  id: string;
  threadId: string;
  attachableId: string;
  attachableType: string;
  type: NoteType;
  body?: string;
  hasAudio: boolean;
  authorId: string;
  authorName?: string;
  previousVersionId?: string;
  isLatest: boolean;
  createdAt: string;
}

export interface CreateNoteRequest {
  body: string;
}

export interface UpdateNoteRequest {
  body: string;
}
