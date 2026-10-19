import { formatDateTime } from '@/lib/utils/date';
import { TASK_PRIORITIES } from '@/lib/constants/tasks';
import type { TaskResponseDto } from '@/lib/types/tasks';
import type { UserResponseDto } from '@/lib/api/users';
import { userDisplayName } from '@/lib/utils/user-name';

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex justify-between items-start gap-3 py-2.5 border-b border-[var(--border)] last:border-0">
      <span className="text-xs text-subtle shrink-0">{label}</span>
      <span className="text-xs text-primary font-medium text-right">{value}</span>
    </div>
  );
}

const selectClass =
  'w-full text-xs px-3 py-2 rounded-lg border border-[var(--border)] bg-transparent text-primary cursor-pointer focus:ring-2 focus:ring-blue-500 disabled:opacity-60';

interface TaskPropertiesPanelProps {
  task: TaskResponseDto;
  users: UserResponseDto[];
  getUserName: (id: string) => string;
  updating: boolean;
  onChange: (data: { assignedToId?: string; priority?: string }) => void;
}

export default function TaskPropertiesPanel({ task, users, getUserName, updating, onChange }: TaskPropertiesPanelProps) {
  const assignable = users.filter((u) => u.isActive || u.id === task.assignedToId);

  return (
    <aside className="surface border border-[var(--border)] rounded-xl p-5 space-y-0">
      <p className="text-xs font-semibold text-subtle uppercase tracking-wide mb-2">Assigned To</p>
      <select
        value={task.assignedToId}
        onChange={(e) => onChange({ assignedToId: e.target.value })}
        disabled={updating}
        className={selectClass}
      >
        {assignable.map((u) => (
          <option key={u.id} value={u.id}>{userDisplayName(u)}</option>
        ))}
      </select>

      <p className="text-xs font-semibold text-subtle uppercase tracking-wide mb-2 mt-4">Priority</p>
      <select
        value={task.priority}
        onChange={(e) => onChange({ priority: e.target.value })}
        disabled={updating}
        className={selectClass}
      >
        {TASK_PRIORITIES.map((p) => (
          <option key={p} value={p}>{p.charAt(0) + p.slice(1).toLowerCase()}</option>
        ))}
      </select>

      <div className="border-b border-[var(--border)] my-4" />

      <p className="text-xs font-semibold text-subtle uppercase tracking-wide mb-1">Timeline</p>
      <Row label="Due" value={formatDateTime(task.dueDate)} />
      {task.startDate && <Row label="Start" value={formatDateTime(task.startDate)} />}
      {task.completedAt && <Row label="Completed" value={formatDateTime(task.completedAt)} />}
      <Row label="Created" value={formatDateTime(task.createdAt)} />
      <Row label="Created by" value={getUserName(task.createdById)} />
      <Row label="Updated" value={formatDateTime(task.updatedAt)} />

      <div className="border-b border-[var(--border)] my-4" />
      <p className="text-xs text-subtle font-mono break-all">{task.id}</p>
    </aside>
  );
}
