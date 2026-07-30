'use client';

import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  rectIntersection,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { LeadResponseDto } from '@/lib/api/leads';
import { useUpdateLeadStatus, useLeadsBoardSummary } from '@/lib/hooks/use-leads';
import LoadingSpinner from '@/components/loading-spinner';
import BoardColumnContainer from './lead-board-column-container';
import LeadCard from './lead-card';

const BOARD_COLUMNS: { status: string; label: string }[] = [
  { status: 'NEW', label: 'New' },
  { status: 'CONTACTED', label: 'Contacted' },
  { status: 'QUALIFIED', label: 'Qualified' },
  { status: 'IN_NEGOTIATION', label: 'In Negotiation' },
  { status: 'CONVERTED', label: 'Converted' },
  { status: 'LOST', label: 'Lost' },
  { status: 'UNRESPONSIVE', label: 'Unresponsive' },
];

export default function LeadBoardView() {
  const [activeLead, setActiveLead] = useState<LeadResponseDto | null>(null);
  const updateLeadStatus = useUpdateLeadStatus();
  // Seeds each column's cache with its first page — mounting columns before this
  // resolves would make each one fire its own page-1 fetch, defeating the point.
  const { isLoading: boardLoading } = useLeadsBoardSummary();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } }),
  );

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveLead((active.data.current?.lead as LeadResponseDto) ?? null);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveLead(null);
    if (!over) return;
    const lead = active.data.current?.lead as LeadResponseDto | undefined;
    const newStatus = over.id as string;
    if (!lead || newStatus === lead.status) return;

    updateLeadStatus.mutate({ lead, newStatus });
  };

  if (boardLoading) {
    return <LoadingSpinner message="Loading board..." />;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="overflow-x-auto pb-4 h-[calc(100vh-200px)]">
        <div className="flex gap-4 min-w-max h-full">
          {BOARD_COLUMNS.map(({ status, label }) => (
            <BoardColumnContainer key={status} status={status} label={label} />
          ))}
        </div>
      </div>

      <DragOverlay dropAnimation={{ duration: 150, easing: 'ease' }}>
        {activeLead ? <LeadCard lead={activeLead} isOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}
