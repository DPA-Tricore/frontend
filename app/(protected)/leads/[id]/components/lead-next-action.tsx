'use client';

import { Phone, Mail, Calendar, CheckSquare, Bell, CalendarClock, type LucideIcon } from 'lucide-react';
import { useLeadNextAction } from '@/lib/hooks/use-lead-detail';
import { formatDate, formatTime } from '@/lib/utils/date';

const TASK_TYPE_ICONS: Record<string, LucideIcon> = {
  CALL: Phone,
  EMAIL: Mail,
  MEETING: Calendar,
  FOLLOW_UP: CheckSquare,
  CUSTOM: CheckSquare,
};

interface LeadNextActionProps {
  leadId: string;
  onJump: (tab: 'tasks' | 'reminders') => void;
}

export default function LeadNextAction({ leadId, onJump }: LeadNextActionProps) {
  const { nextAction, isLoading } = useLeadNextAction(leadId);

  if (isLoading) return null;

  if (!nextAction) {
    return (
      <div className="flex items-center gap-2.5 text-sm text-subtle px-4 py-3 rounded-xl border border-dashed border-[var(--border)] mb-6">
        <CalendarClock size={16} className="shrink-0" />
        <span>No upcoming task or reminder — this lead has no scheduled follow-up.</span>
      </div>
    );
  }

  const overdue = new Date(nextAction.dueDate) < new Date();
  const Icon = nextAction.kind === 'reminder' ? Bell : (TASK_TYPE_ICONS[nextAction.taskType ?? ''] ?? CheckSquare);

  return (
    <button
      onClick={() => onJump(nextAction.kind === 'reminder' ? 'reminders' : 'tasks')}
      className={`w-full flex items-center gap-3 text-left px-4 py-3 rounded-xl border mb-6 transition-colors ${
        overdue
          ? 'bg-red-500/5 border-red-300/40 hover:bg-red-500/10 dark:border-red-800/40'
          : 'callout hover:opacity-90'
      }`}
    >
      <span
        className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          overdue ? 'bg-red-500/15 text-red-600 dark:text-red-400' : 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
        }`}
      >
        <Icon size={15} />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-medium text-primary truncate">{nextAction.title}</span>
        <span className={`block text-xs mt-0.5 ${overdue ? 'text-red-600 dark:text-red-400 font-medium' : 'text-subtle'}`}>
          {overdue ? 'Overdue · ' : 'Next up · '}
          Due {formatDate(nextAction.dueDate)} at {formatTime(nextAction.dueDate)}
        </span>
      </span>
    </button>
  );
}
