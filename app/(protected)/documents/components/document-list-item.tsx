'use client';

import { useState } from 'react';
import { documentsApi, DocumentResponseDto } from '@/lib/api/documents';
import { formatDate } from '@/lib/utils/date';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function mimeLabel(mimeType: string): string {
  if (mimeType.startsWith('image/')) return mimeType.split('/')[1].toUpperCase();
  if (mimeType === 'application/pdf') return 'PDF';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'Word';
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'Excel';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'PPT';
  if (mimeType.includes('zip') || mimeType.includes('compressed')) return 'ZIP';
  return 'File';
}

function mimeColor(mimeType: string): string {
  if (mimeType === 'application/pdf') return 'bg-red-100 text-red-700';
  if (mimeType.startsWith('image/')) return 'bg-purple-100 text-purple-700';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'bg-blue-100 text-blue-700';
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'bg-green-100 text-green-700';
  return 'bg-gray-100 text-gray-700';
}

interface DocumentListItemProps {
  doc: DocumentResponseDto;
  onDeleted: (id: string) => void;
}

export default function DocumentListItem({ doc, onDeleted }: DocumentListItemProps) {
  const [downloading, setDownloading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      await documentsApi.downloadDocument(doc.id, doc.originalName);
    } finally {
      setDownloading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${doc.originalName}"?`)) return;
    try {
      setDeleting(true);
      await documentsApi.deleteDocument(doc.id);
      onDeleted(doc.id);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <tr className="border-b border-[var(--border)] hover:[background:var(--bg)]">
      <td className="px-6 py-4">
        <div className="text-sm font-medium text-primary truncate max-w-xs">{doc.originalName}</div>
      </td>
      <td className="px-6 py-4">
        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${mimeColor(doc.mimeType)}`}>
          {mimeLabel(doc.mimeType)}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className="text-sm text-muted">{formatBytes(doc.fileSize)}</span>
      </td>
      <td className="px-6 py-4">
        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 font-medium capitalize">
          {doc.attachableType}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className="text-sm text-muted">{doc.uploaderName ?? '—'}</span>
      </td>
      <td className="px-6 py-4">
        <span className="text-sm text-muted">{formatDate(doc.createdAt)}</span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="text-sm text-primary hover:opacity-70 disabled:opacity-40 transition-opacity font-medium"
          >
            {downloading ? '...' : 'Download'}
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-sm text-red-500 hover:text-red-600 disabled:opacity-40 transition-colors"
          >
            {deleting ? '...' : 'Delete'}
          </button>
        </div>
      </td>
    </tr>
  );
}
