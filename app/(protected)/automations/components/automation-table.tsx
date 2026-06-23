'use client';

import type { AutomationResponseDto } from '@/lib/types/automations';
import AutomationTableHeader from './automation-table-header';
import AutomationTableRow from './automation-table-row';

interface AutomationTableProps {
  automations: AutomationResponseDto[];
  deletingId: string | null;
  onToggleActive: (automation: AutomationResponseDto) => void;
  onDelete: (id: string) => void;
}

export default function AutomationTable({ automations, deletingId, onToggleActive, onDelete }: AutomationTableProps) {
  return (
    <div className="overflow-x-auto surface rounded-lg border border-[var(--border)]">
      <table className="w-full">
        <AutomationTableHeader />
        <tbody>
          {automations.map((automation) => (
            <AutomationTableRow
              key={automation.id}
              automation={automation}
              isDeleting={deletingId === automation.id}
              onToggleActive={onToggleActive}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
