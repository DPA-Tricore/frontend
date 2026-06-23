'use client';

import Link from 'next/link';
import { useDraggable } from '@dnd-kit/core';
import { LeadResponseDto, ContactResponseDto } from '@/lib/api/leads';
import { getStatusColor } from '@/lib/theme/colors';

export const getPrimaryContact = (contacts?: ContactResponseDto[]): ContactResponseDto | null => {
  if (!contacts || contacts.length === 0) return null;
  return contacts.find((c) => c.isPrimary) || contacts[0] || null;
};

export interface LeadCardProps {
  lead: LeadResponseDto;
  isOverlay?: boolean;
}

export default function LeadCard({ lead, isOverlay = false }: LeadCardProps) {
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
      <Link
        href={`/leads/${lead.id}`}
        onClick={(e) => e.stopPropagation()}
        className="text-xs text-subtle hover:text-primary mt-2 inline-block transition-colors"
      >
        View →
      </Link>
    </div>
  );
}
