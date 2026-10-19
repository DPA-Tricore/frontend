'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { PaginationMeta } from '@/lib/types/common';
import type { TaskResponseDto } from '@/lib/types/tasks';
import Pagination from '@/components/pagination';
import TaskListItem from './task-list-item';

type SortField = 'title' | 'createdAt' | 'dueDate' | 'status' | 'priority' | 'type';

function SortIcon({ field, sortBy, sortOrder }: { field: string; sortBy: string; sortOrder: 'asc' | 'desc' }) {
  if (sortBy !== field) return <span className="text-subtle">⇅</span>;
  return <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>;
}

interface TaskListViewProps {
  tasks: TaskResponseDto[];
  meta: PaginationMeta | null;
  page: number;
  sortBy: SortField;
  sortOrder: 'asc' | 'desc';
  onSort: (field: SortField) => void;
  onPageChange: (page: number) => void;
  getUserName: (id: string) => string;
}

export default function TaskListView({
  tasks,
  meta,
  page,
  sortBy,
  sortOrder,
  onSort,
  onPageChange,
  getUserName,
}: TaskListViewProps) {
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
                onClick={() => onSort('title')}
              >
                <div className="flex items-center gap-2">
                  Title <SortIcon field="title" sortBy={sortBy} sortOrder={sortOrder} />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Type</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Priority</th>
              <th
                className="px-6 py-3 text-left text-sm font-semibold text-primary cursor-pointer hover:opacity-70"
                onClick={() => onSort('status')}
              >
                <div className="flex items-center gap-2">
                  Status <SortIcon field="status" sortBy={sortBy} sortOrder={sortOrder} />
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-sm font-semibold text-primary cursor-pointer hover:opacity-70"
                onClick={() => onSort('dueDate')}
              >
                <div className="flex items-center gap-2">
                  Due Date <SortIcon field="dueDate" sortBy={sortBy} sortOrder={sortOrder} />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Assigned To</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <TaskListItem key={task.id} task={task} getUserName={getUserName} />
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
