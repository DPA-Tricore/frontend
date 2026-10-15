import { Phone, Mail, Calendar, CheckSquare, type LucideIcon } from 'lucide-react';

export const TASK_STATUSES = ['TODO', 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const;

export const CLOSED_TASK_STATUSES = ['COMPLETED', 'CANCELLED'];

export const TASK_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;

export const TASK_STATUS_COLOR: Record<string, string> = {
  TODO: 'bg-purple-500/15 text-purple-600 dark:text-purple-400',
  PENDING: 'bg-gray-500/15 text-gray-600 dark:text-gray-400',
  IN_PROGRESS: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
  COMPLETED: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
  CANCELLED: 'bg-red-500/15 text-red-600 dark:text-red-400',
};

export const TASK_RESULT_TYPES = [
  { value: 'SUCCESS', label: 'Success' },
  { value: 'NO_ANSWER', label: 'No answer' },
  { value: 'RESCHEDULED', label: 'Rescheduled' },
  { value: 'FAILED', label: 'Failed' },
] as const;

export const TASK_RESULT_TYPE_COLOR: Record<string, string> = {
  SUCCESS: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
  NO_ANSWER: 'bg-gray-500/15 text-gray-600 dark:text-gray-400',
  RESCHEDULED: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  FAILED: 'bg-red-500/15 text-red-600 dark:text-red-400',
};

export const TASK_TYPE_ICONS: Record<string, LucideIcon> = {
  CALL: Phone,
  EMAIL: Mail,
  MEETING: Calendar,
  FOLLOW_UP: CheckSquare,
  CUSTOM: CheckSquare,
};
