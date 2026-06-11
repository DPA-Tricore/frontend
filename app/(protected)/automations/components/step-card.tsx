import type { AutomationStepResponseDto } from '@/lib/types/automations';

const ACTION_TYPE_LABELS: Record<string, string> = {
  EMAIL: 'Email',
  SMS: 'SMS',
  CALL_TASK: 'Call Task',
  TODO: 'To-Do',
  REMINDER: 'Reminder',
  TAG: 'Tag',
};

const ACTION_TYPE_COLORS: Record<string, string> = {
  EMAIL: 'bg-green-100 text-green-800',
  SMS: 'bg-yellow-100 text-yellow-800',
  CALL_TASK: 'bg-purple-100 text-purple-800',
  TODO: 'bg-blue-100 text-blue-800',
  REMINDER: 'bg-orange-100 text-orange-800',
  TAG: 'bg-gray-100 text-gray-800',
};

function configSummary(step: AutomationStepResponseDto): string {
  const c = step.actionConfig;
  if (c.subject) return c.subject;
  if (c.message) return c.message;
  if (c.title) return c.title;
  if (c.tagName) return `#${c.tagName}`;
  return '—';
}

interface StepCardProps {
  step: AutomationStepResponseDto;
  isLast: boolean;
  deletingStepId: string | null;
  onEdit: (step: AutomationStepResponseDto) => void;
  onDelete: (stepId: string) => void;
}

export default function StepCard({ step, isLast, deletingStepId, onEdit, onDelete }: StepCardProps) {
  return (
    <div className="flex items-stretch gap-4">
      <div className="flex flex-col items-center">
        <div className="w-16 shrink-0 text-center">
          <div className="text-xs text-subtle">Day</div>
          <div className="text-lg font-bold text-primary leading-tight">{step.dayOffset}</div>
        </div>
        {!isLast && <div className="w-px flex-1 bg-[var(--border)] mt-1 min-h-4" />}
      </div>

      <div className="flex-1 surface border border-[var(--border)] rounded-lg px-5 py-4 flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${ACTION_TYPE_COLORS[step.actionType]}`}>
            {ACTION_TYPE_LABELS[step.actionType]}
          </span>
          <span className="text-sm text-primary">{configSummary(step)}</span>
          {step.condition && (
            <span className="text-xs text-subtle border border-[var(--border)] px-2 py-0.5 rounded-full">
              conditional
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onEdit(step)}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(step.id)}
            disabled={deletingStepId === step.id}
            className="text-sm text-red-500 hover:text-red-700 font-medium disabled:opacity-50"
          >
            {deletingStepId === step.id ? '...' : 'Remove'}
          </button>
        </div>
      </div>
    </div>
  );
}
