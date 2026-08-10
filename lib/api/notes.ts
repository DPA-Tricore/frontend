import { axiosClient } from '@/lib/api/axios-client';
import type { NoteResponseDto, CreateNoteRequest, UpdateNoteRequest } from '@/lib/types/notes';

export type { NoteResponseDto, NoteType, CreateNoteRequest, UpdateNoteRequest } from '@/lib/types/notes';

export const notesApi = {
  async getByLead(leadId: string): Promise<NoteResponseDto[]> {
    const res = await axiosClient.get<NoteResponseDto[]>(`/leads/${leadId}/notes`);
    return res.data;
  },

  async createText(leadId: string, data: CreateNoteRequest): Promise<NoteResponseDto> {
    const res = await axiosClient.post<NoteResponseDto>(`/leads/${leadId}/notes`, data);
    return res.data;
  },

  /** Uploads a recorded voice-note blob (see components/voice-recorder.tsx). */
  async createVoice(leadId: string, blob: Blob): Promise<NoteResponseDto> {
    const form = new FormData();
    form.append('file', blob, `voice-note-${Date.now()}.webm`);
    const res = await axiosClient.post<NoteResponseDto>(
      `/leads/${leadId}/notes/audio`,
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return res.data;
  },

  async edit(id: string, data: UpdateNoteRequest): Promise<NoteResponseDto> {
    const res = await axiosClient.patch<NoteResponseDto>(`/notes/${id}`, data);
    return res.data;
  },

  async delete(id: string): Promise<void> {
    await axiosClient.delete(`/notes/${id}`);
  },

  async getHistory(id: string): Promise<NoteResponseDto[]> {
    const res = await axiosClient.get<NoteResponseDto[]>(`/notes/${id}/history`);
    return res.data;
  },

  /** Fetched as a blob (not a plain <audio src>) so the auth header actually attaches. */
  async getAudioBlob(id: string): Promise<Blob> {
    const res = await axiosClient.get(`/notes/${id}/audio`, { responseType: 'blob' });
    return res.data as Blob;
  },
};
