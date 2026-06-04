'use client';

import { useDroppable } from '@dnd-kit/core';
import { LeadResponseDto } from '@/lib/api/leads';
import LeadCard from './lead-card';

interface BoardColumnProps {
  status: string;
  label: string;
  leads: LeadResponseDto[];
}

export default function BoardColumn({ status, label, leads }: BoardColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={[
        'w-64 flex-shrink-0 surface rounded-lg border flex flex-col transition-colors',
        isOver ? 'border-blue-400 ring-2 ring-blue-200' : 'border-[var(--border)]',
      ].join(' ')}
    >
      <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
        <span className="text-sm font-semibold text-primary">{label}</span>
        <span className="text-xs font-medium text-muted bg-[var(--bg)] border border-[var(--border)] rounded-full px-2 py-0.5">
          {leads.length}
        </span>
      </div>

      <div className="flex flex-col gap-2 p-3 flex-1 min-h-[120px]">
        {leads.length === 0 ? (
          <div
            className={[
              'flex-1 flex items-center justify-center rounded-lg border-2 border-dashed transition-colors',
              isOver ? 'border-blue-300' : 'border-[var(--border)]',
            ].join(' ')}
          >
            <span className="text-xs text-subtle">Drop here</span>
          </div>
        ) : (
          leads.map((lead) => <LeadCard key={lead.id} lead={lead} />)
        )}
      </div>
    </div>
  );
}
