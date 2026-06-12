'use client';

import { useState, useEffect, useCallback } from 'react';
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
import { leadsApi, LeadResponseDto } from '@/lib/api/leads';
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

const LEADS_PER_COLUMN = 10;

interface ColumnState {
  leads: LeadResponseDto[];
  page: number;
  hasMore: boolean;
  isLoading: boolean;
  total: number;
}

type ColumnStates = Record<string, ColumnState>;

interface LeadBoardViewProps {
  onStatusChange: (leadId: string, newStatus: string, oldStatus: string) => void;
}

export default function LeadBoardView({ onStatusChange }: LeadBoardViewProps) {
  const [columnStates, setColumnStates] = useState<ColumnStates>(
    BOARD_COLUMNS.reduce(
      (acc, { status }) => ({
        ...acc,
        [status]: { leads: [], page: 1, hasMore: true, isLoading: true, total: 0 },
      }),
      {} as ColumnStates,
    ),
  );

  const [activeLeadId, setActiveLeadId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } }),
  );

  // Initial load for all columns
  useEffect(() => {
    BOARD_COLUMNS.forEach(({ status }) => {
      loadLeads(status, 1);
    });
  }, []);

  const loadLeads = useCallback(
    async (status: string, page: number) => {
      try {
        setColumnStates((prev) => ({
          ...prev,
          [status]: { ...prev[status], isLoading: true },
        }));

        const response = await leadsApi.getLeads({
          status,
          page,
          limit: LEADS_PER_COLUMN,
        });

        const paginatedResponse = response as any;
        const newLeads = paginatedResponse.data || [];
        const total = paginatedResponse.meta?.total || 0;
        const hasMore = (paginatedResponse.meta?.page || 1) * LEADS_PER_COLUMN < total;

        setColumnStates((prev) => ({
          ...prev,
          [status]: {
            leads: page === 1 ? newLeads : [...prev[status].leads, ...newLeads],
            page,
            hasMore,
            isLoading: false,
            total,
          },
        }));
      } catch (error) {
        console.error(`Failed to load leads for ${status}:`, error);
        setColumnStates((prev) => ({
          ...prev,
          [status]: { ...prev[status], isLoading: false },
        }));
      }
    },
    [],
  );

  const handleLoadMore = useCallback(
    (status: string) => {
      const state = columnStates[status];
      if (!state.isLoading && state.hasMore) {
        loadLeads(status, state.page + 1);
      }
    },
    [columnStates, loadLeads],
  );

  const allLeads = Object.values(columnStates).flatMap((s) => s.leads);
  const activeLead = allLeads.find((l) => l.id === activeLeadId) ?? null;

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveLeadId(active.id as string);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveLeadId(null);
    if (!over) return;
    const leadId = active.id as string;
    const newStatus = over.id as string;
    const oldStatus = active.data.current?.status as string;
    if (newStatus === oldStatus) return;

    // Find the lead in the old column
    const leadToMove = columnStates[oldStatus].leads.find((l) => l.id === leadId);
    if (!leadToMove) return;

    // Update local state immediately for smooth UI
    setColumnStates((prev) => ({
      ...prev,
      [oldStatus]: {
        ...prev[oldStatus],
        leads: prev[oldStatus].leads.filter((l) => l.id !== leadId),
        total: prev[oldStatus].total - 1,
      },
      [newStatus]: {
        ...prev[newStatus],
        leads: [{ ...leadToMove, status: newStatus }, ...prev[newStatus].leads],
        total: prev[newStatus].total + 1,
      },
    }));

    // Call API to persist the change
    onStatusChange(leadId, newStatus, oldStatus);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="overflow-x-auto pb-4 h-[calc(100vh-200px)]">
        <div className="flex gap-4 min-w-max h-full">
          {BOARD_COLUMNS.map(({ status, label }) => {
            const state = columnStates[status];
            return (
              <BoardColumn
                key={status}
                status={status}
                label={label}
                leads={state.leads}
                isLoading={state.isLoading}
                hasMore={state.hasMore}
                totalCount={state.total}
                onLoadMore={() => handleLoadMore(status)}
              />
            );
          })}
        </div>
      </div>

      <DragOverlay dropAnimation={{ duration: 150, easing: 'ease' }}>
        {activeLead ? <LeadCard lead={activeLead} isOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}
