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
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { LeadResponseDto, ContactResponseDto } from '@/lib/api/leads';
import { getStatusColor } from '@/lib/theme/colors';

type Lead = LeadResponseDto;

const BOARD_COLUMNS: { status: string; label: string }[] = [
  { status: 'NEW', label: 'New' },
  { status: 'CONTACTED', label: 'Contacted' },
  { status: 'QUALIFIED', label: 'Qualified' },
  { status: 'IN_NEGOTIATION', label: 'In Negotiation' },
  { status: 'CONVERTED', label: 'Converted' },
  { status: 'LOST', label: 'Lost' },
  { status: 'UNRESPONSIVE', label: 'Unresponsive' },
];

const getPrimaryContact = (contacts?: ContactResponseDto[]) => {
  if (!contacts || contacts.length === 0) return null;
  return contacts.find((c) => c.isPrimary) || contacts[0] || null;
};

// ── Card ──────────────────────────────────────────────────────────────────────

interface LeadCardProps {
  lead: Lead;
  isOverlay?: boolean;
}

function LeadCard({ lead, isOverlay = false }: LeadCardProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: lead.id,
    data: { status: lead.status },
  });

  const contact = getPrimaryContact(lead.contacts);

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={[
        'surface rounded-lg border border-[var(--border)] p-3 cursor-grab active:cursor-grabbing transition-all select-none',
        isDragging ? 'opacity-40' : 'hover:border-blue-400',
        isOverlay ? 'rotate-1 shadow-xl scale-105' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-sm font-medium text-primary leading-tight">
          {lead.firstName} {lead.lastName}
        </span>
        <span
          className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(lead.status)}`}
        >
          {lead.leadType.replace(/_/g, ' ')}
        </span>
      </div>
      {contact && (
        <p className="text-xs text-muted truncate">
          {contact.type.toLowerCase()}: {contact.value}
        </p>
      )}
      {lead.source && (
        <p className="text-xs text-subtle mt-1 truncate">via {lead.source}</p>
      )}
      {lead.createdAt && (
        <p className="text-xs text-subtle mt-1">
          {new Date(lead.createdAt).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}

// ── Column ────────────────────────────────────────────────────────────────────

interface BoardColumnProps {
  status: string;
  label: string;
  leads: Lead[];
}

function BoardColumn({ status, label, leads }: BoardColumnProps) {
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

// ── Board ─────────────────────────────────────────────────────────────────────

interface LeadBoardViewProps {
  leads: Lead[];
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
