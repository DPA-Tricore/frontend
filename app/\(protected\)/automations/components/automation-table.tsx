'use client';

import { useRouter } from 'next/navigation';
import type { AutomationResponseDto } from '@/lib/types/automations';
import { getStatusColor, getScopeColor } from '@/lib/theme/colors';

interface AutomationTableProps {
  automations: AutomationResponseDto[];
  deletingId: string | null;
  onToggleActive: (automation: AutomationResponseDto) => void;
  onDelete: (id: string) => void;
}

export default function AutomationTable({
  automations,
  deletingId,
  onToggleActive,
  onDelete,
}: AutomationTableProps) {
  const router = useRouter();

  return (
    <div className="overflow-x-auto surface rounded-lg border border-[var(--border)]">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[var(--border)] [background:var(--bg)]">
            <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Name</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Stage</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Scope</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Steps</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Shot Clock</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Active</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Actions</th>
          </tr>
        </thead>
        <tbody>
          {automations.map((automation) => (
            <tr key={automation.id} className="border-b border-[var(--border)] hover:[background:var(--bg)]">
              <td className="px-6 py-4">
                <div className="text-sm font-medium text-primary">{automation.name}</div>
              </td>
              <td className="px-6 py-4">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(automation.stage)}`}>
                  {automation.stage.replace('_', ' ')}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getScopeColor(automation.scope)}`}>
                  {automation.scope}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className="text-sm text-muted">{automation.steps?.length ?? 0} steps</span>
              </td>
              <td className="px-6 py-4">
                <span className="text-sm text-muted">
                  {automation.shotClockDays ? `${automation.shotClockDays} days` : '—'}
                </span>
              </td>
              <td className="px-6 py-4">
                <button
                  onClick={() => onToggleActive(automation)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    automation.isActive ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                    automation.isActive ? 'translate-x-4.5' : 'translate-x-0.5'
                  }`} />
                </button>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => router.push(`/automations/${automation.id}`)}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(automation.id)}
                    disabled={deletingId === automation.id}
                    className="text-sm text-red-500 hover:text-red-700 font-medium disabled:opacity-50"
                  >
                    {deletingId === automation.id ? '...' : 'Delete'}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
