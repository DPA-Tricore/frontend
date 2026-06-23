'use client';

import { useRef, useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { LeadResponseDto } from '@/lib/api/leads';
import LeadCard from './lead-card';

interface BoardColumnProps {
  status: string;
  label: string;
  leads: LeadResponseDto[];
  isLoading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  totalCount?: number;
}

export default function BoardColumn({
  status,
  label,
  leads,
  isLoading = false,
  onLoadMore,
  hasMore = false,
  totalCount = leads.length,
}: BoardColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || !onLoadMore || isLoading) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      // Trigger load more when user scrolls to 80% down
      if (scrollHeight - (scrollTop + clientHeight) < scrollHeight * 0.2 && hasMore) {
        onLoadMore();
      }
    };

    scrollContainer.addEventListener('scroll', handleScroll);
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, [hasMore, isLoading, onLoadMore]);

  return (
    <div
      ref={setNodeRef}
      className={[
        'w-64 flex-shrink-0 surface rounded-lg border flex flex-col transition-colors h-full',
        isOver ? 'border-blue-400 ring-2 ring-blue-200' : 'border-[var(--border)]',
      ].join(' ')}
    >
      <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
        <span className="text-sm font-semibold text-primary">{label}</span>
        <span className="text-xs font-medium text-muted bg-[var(--bg)] border border-[var(--border)] rounded-full px-2 py-0.5">
          {leads.length}/{totalCount}
        </span>
      </div>

      <div
        ref={scrollRef}
        className="flex flex-col gap-2 p-3 flex-1 overflow-y-auto"
      >
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
          <>
            {leads.map((lead) => (
              <LeadCard key={lead.id} lead={lead} />
            ))}
            {isLoading && (
              <div className="flex justify-center py-2">
                <div className="h-4 w-4 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
              </div>
            )}
            {!hasMore && leads.length > 0 && (
              <div className="text-center py-2">
                <span className="text-xs text-subtle">All loaded</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
