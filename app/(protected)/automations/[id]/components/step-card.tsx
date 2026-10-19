'use client';

import type { AutomationStepResponseDto } from '@/lib/types/automations';
import type { EmailTemplateResponseDto } from '@/lib/types/emails';
import { useEmailTemplates } from '@/lib/hooks/use-email-templates';

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

function configSummary(step: AutomationStepResponseDto, templates: EmailTemplateResponseDto[]): string {
  const c = step.actionConfig;
  if (c.templateId) {
    const template = templates.find((t) => t.id === c.templateId);
    return template ? `Template: ${template.name}` : 'Template (deleted or inactive — this step will be skipped)';
  }
  if (c.subject) return c.subject;
  if (c.message) return c.message;
  if (c.title) return c.title;
  if (c.tagName) return `#${c.tagName}`;
  return '—';
}

interface StepCardProps {
  step: AutomationStepResponseDto;
  deletingStepId: string | null;
  onEdit: (step: AutomationStepResponseDto) => void;
  onDelete: (stepId: string) => void;
}

export default function StepCard({
  step,
  deletingStepId,
  onEdit,
  onDelete,
}: StepCardProps) {
  const { data: templates = [] } = useEmailTemplates();
  return (
    <div className="surface border border-[var(--border)] rounded-lg px-5 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium shrink-0 ${ACTION_TYPE_COLORS[step.actionType]}`}>
          {ACTION_TYPE_LABELS[step.actionType]}
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-sm text-primary font-medium truncate">{configSummary(step, templates)}</div>
          {step.actionConfig.body && (
            <div
              className="text-xs text-subtle mt-0.5 truncate"
              dangerouslySetInnerHTML={{
                __html: step.actionConfig.body.replace(/<[^>]+>/g, ' ').trim(),
              }}
            />
          )}
          {step.condition && (
            <div className="text-xs text-subtle mt-0.5">Has condition</div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0 ml-4">
        <button
          onClick={() => onEdit(step)}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(step.id)}
          disabled={deletingStepId === step.id}
          className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors disabled:opacity-50"
        >
          {deletingStepId === step.id ? '...' : 'Remove'}
        </button>
      </div>
    </div>
  );
}
