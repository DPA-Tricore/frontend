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
import BoardColumn from './lead-board-column';
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

interface LeadBoardViewProps {
  leads: LeadResponseDto[];
  onStatusChange: (leadId: string, newStatus: string, oldStatus: string) => void;
}

export default function LeadBoardView({ leads, onStatusChange }: LeadBoardViewProps) {
  const [activeLeadId, setActiveLeadId] = useState<string | null>(null);
  const activeLead = leads.find((l) => l.id === activeLeadId) ?? null;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } }),
  );

  const grouped = BOARD_COLUMNS.map(({ status, label }) => ({
    status,
    label,
    leads: leads.filter((l) => l.status === status),
  }));

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveLeadId(active.id as string);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveLeadId(null);
    if (!over) return;
    const newStatus = over.id as string;
    const oldStatus = active.data.current?.status as string;
    if (newStatus === oldStatus) return;
    onStatusChange(active.id as string, newStatus, oldStatus);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {grouped.map(({ status, label, leads: columnLeads }) => (
            <BoardColumn key={status} status={status} label={label} leads={columnLeads} />
          ))}
        </div>
      </div>

      <DragOverlay dropAnimation={{ duration: 150, easing: 'ease' }}>
        {activeLead ? <LeadCard lead={activeLead} isOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}
