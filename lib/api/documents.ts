import { axiosClient } from '@/lib/api/axios-client';
import type { DocumentResponseDto, PaginatedDocumentResponse, ListDocumentsParams } from '@/lib/types/documents';

export type { DocumentResponseDto, PaginatedDocumentResponse, ListDocumentsParams } from '@/lib/types/documents';

export const documentsApi = {
  async getDocuments(params?: ListDocumentsParams): Promise<PaginatedDocumentResponse> {
    const q = new URLSearchParams();
    if (params?.page) q.append('page', String(params.page));
    if (params?.limit) q.append('limit', String(params.limit));
    if (params?.search) q.append('search', params.search);
    if (params?.attachableType) q.append('attachableType', params.attachableType);
    if (params?.sortBy) q.append('sortBy', params.sortBy);
    if (params?.sortOrder) q.append('sortOrder', params.sortOrder);
    const res = await axiosClient.get<PaginatedDocumentResponse>(`/documents?${q}`);
    return res.data;
  },

  async getLeadDocuments(leadId: string): Promise<DocumentResponseDto[]> {
    const res = await axiosClient.get<DocumentResponseDto[]>(`/leads/${leadId}/documents`);
    return res.data;
  },

  async uploadLeadDocument(leadId: string, file: File): Promise<DocumentResponseDto> {
    const form = new FormData();
    form.append('file', file);
    const res = await axiosClient.post<DocumentResponseDto>(
      `/leads/${leadId}/documents`,
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return res.data;
  },

  async downloadDocument(documentId: string, fileName: string): Promise<void> {
    const res = await axiosClient.get(`/documents/${documentId}/download`, {
      responseType: 'blob',
    });
    const url = URL.createObjectURL(res.data as Blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  },

  async deleteDocument(documentId: string): Promise<void> {
    await axiosClient.delete(`/documents/${documentId}`);
  },
};
