import { PaginationMeta } from './common';

export interface DocumentResponseDto {
  id: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  attachableId: string;
  attachableType: string;
  uploadedById: string;
  uploaderName?: string;
  createdAt: string;
}

export interface PaginatedDocumentResponse {
  data: DocumentResponseDto[];
  meta: PaginationMeta;
}

export interface ListDocumentsParams {
  page?: number;
  limit?: number;
  search?: string;
  attachableType?: string;
  sortBy?: 'originalName' | 'fileSize' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}
