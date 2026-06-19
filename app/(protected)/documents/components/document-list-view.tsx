'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { PaginationMeta } from '@/lib/types/common';
import type { DocumentResponseDto } from '@/lib/types/documents';
import Pagination from '@/components/pagination';
import DocumentListItem from './document-list-item';

type SortField = 'originalName' | 'fileSize' | 'createdAt';

function SortIcon({ field, sortBy, sortOrder }: { field: string; sortBy: string; sortOrder: 'asc' | 'desc' }) {
  if (sortBy !== field) return <span className="text-subtle">⇅</span>;
  return <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>;
}

interface DocumentListViewProps {
  documents: DocumentResponseDto[];
  meta: PaginationMeta | null;
  page: number;
  sortBy: SortField;
  sortOrder: 'asc' | 'desc';
  onSort: (field: SortField) => void;
  onPageChange: (page: number) => void;
  onDeleted: (id: string) => void;
}

export default function DocumentListView({
  documents,
  meta,
  page,
  sortBy,
  sortOrder,
  onSort,
  onPageChange,
  onDeleted,
}: DocumentListViewProps) {
  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={page}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15, ease: 'easeInOut' }}
        >
          <div className="overflow-x-auto surface rounded-lg border border-[var(--border)]">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)] [background:var(--bg)]">
                  <th
                    className="px-6 py-3 text-left text-sm font-semibold text-primary cursor-pointer hover:opacity-70"
                    onClick={() => onSort('originalName')}
                  >
                    <div className="flex items-center gap-2">
                      File Name <SortIcon field="originalName" sortBy={sortBy} sortOrder={sortOrder} />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Type</th>
                  <th
                    className="px-6 py-3 text-left text-sm font-semibold text-primary cursor-pointer hover:opacity-70"
                    onClick={() => onSort('fileSize')}
                  >
                    <div className="flex items-center gap-2">
                      Size <SortIcon field="fileSize" sortBy={sortBy} sortOrder={sortOrder} />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Linked To</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Uploaded By</th>
                  <th
                    className="px-6 py-3 text-left text-sm font-semibold text-primary cursor-pointer hover:opacity-70"
                    onClick={() => onSort('createdAt')}
                  >
                    <div className="flex items-center gap-2">
                      Date <SortIcon field="createdAt" sortBy={sortBy} sortOrder={sortOrder} />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <DocumentListItem key={doc.id} doc={doc} onDeleted={onDeleted} />
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </AnimatePresence>

      {meta && <Pagination meta={meta} page={page} onPageChange={onPageChange} />}
    </div>
  );
}
