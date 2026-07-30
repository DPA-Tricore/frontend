'use client';

import { useState, useRef } from 'react';
import { documentsApi, DocumentResponseDto } from '@/lib/api/documents';
import { formatDate } from '@/lib/utils/date';
import { useLeadDocuments, useUploadLeadDocument, useDeleteLeadDocument } from '@/lib/hooks/use-lead-detail';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileIcon(mimeType: string): string {
  if (mimeType.startsWith('image/')) return '🖼';
  if (mimeType === 'application/pdf') return '📄';
  if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return '📊';
  return '📎';
}

interface Props {
  leadId: string;
}

export default function LeadDocumentsTab({ leadId }: Props) {
  const { data: documents = [], isLoading: loading } = useLeadDocuments(leadId);
  const uploadDocument = useUploadLeadDocument(leadId);
  const deleteDocument = useDeleteLeadDocument(leadId);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File) => {
    if (file.size > 20 * 1024 * 1024) {
      setError('File exceeds 20 MB limit');
      return;
    }
    try {
      setError(null);
      await uploadDocument.mutateAsync(file);
    } catch {
      setError('Upload failed. Please try again.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  };

  const handleDownload = async (doc: DocumentResponseDto) => {
    try {
      setDownloadingId(doc.id);
      await documentsApi.downloadDocument(doc.id, doc.originalName);
    } catch {
      setError('Download failed');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDocument.mutateAsync(id);
    } catch {
      setError('Delete failed');
    }
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          dragging
            ? 'border-gray-400 bg-gray-50 dark:bg-white/5'
            : 'border-[var(--border)] hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'
        }`}
      >
        <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
        {uploadDocument.isPending ? (
          <p className="text-sm text-subtle">Uploading...</p>
        ) : (
          <>
            <p className="text-sm font-medium text-primary">Drop a file here or click to upload</p>
            <p className="text-xs text-subtle mt-1">Max 20 MB</p>
          </>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {/* Document list */}
      {loading ? (
        <p className="text-sm text-subtle">Loading...</p>
      ) : documents.length === 0 ? (
        <p className="text-sm text-subtle text-center py-4">No documents yet</p>
      ) : (
        <ul className="space-y-2">
          {documents.map((doc) => (
            <li
              key={doc.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border)] surface"
            >
              <span className="text-xl">{fileIcon(doc.mimeType)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-primary truncate">{doc.originalName}</p>
                <p className="text-xs text-subtle">
                  {formatBytes(doc.fileSize)} &middot;{' '}
                  {doc.uploaderName ?? 'Unknown'} &middot;{' '}
                  {formatDate(doc.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => handleDownload(doc)}
                  disabled={downloadingId === doc.id}
                  className="text-xs text-primary border border-[var(--border)] px-2 py-1 rounded hover:opacity-70 disabled:opacity-40 transition-opacity"
                >
                  {downloadingId === doc.id ? '...' : 'Download'}
                </button>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="text-xs text-red-500 hover:text-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
