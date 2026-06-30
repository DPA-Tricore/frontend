import type { TaskResponseDto } from '@/lib/types/tasks';

const RESULT_TYPE_COLOR: Record<string, string> = {
  SUCCESS: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
  NO_ANSWER: 'bg-gray-500/15 text-gray-600 dark:text-gray-400',
  RESCHEDULED: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  FAILED: 'bg-red-500/15 text-red-600 dark:text-red-400',
};

interface TaskContentProps {
  task: TaskResponseDto;
}

export default function TaskContent({ task }: TaskContentProps) {
  const hasOutcome = task.outcome || task.resultType;
  const hasTags = task.tags && task.tags.length > 0;
  const hasCustomFields = task.customFields && Object.keys(task.customFields).length > 0;

  return (
    <div>
      {/* Description */}
      <p className="text-xs font-semibold text-subtle uppercase tracking-wide mb-3">Description</p>
      {task.description ? (
        <p className="text-sm text-primary leading-relaxed whitespace-pre-wrap">{task.description}</p>
      ) : (
        <p className="text-sm text-subtle italic">No description provided.</p>
      )}

      {/* Outcome */}
      {hasOutcome && (
        <>
          <div className="border-b border-[var(--border)] my-6" />
          <p className="text-xs font-semibold text-subtle uppercase tracking-wide mb-3">Outcome</p>
          {task.resultType && (
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs text-subtle">Result</span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${RESULT_TYPE_COLOR[task.resultType] ?? 'bg-gray-500/15 text-gray-600'}`}>
                {task.resultType.replace(/_/g, ' ')}
              </span>
            </div>
          )}
          {task.outcome && (
            <p className="text-sm text-primary leading-relaxed">{task.outcome}</p>
          )}
        </>
      )}

      {/* Tags */}
      {hasTags && (
        <>
          <div className="border-b border-[var(--border)] my-6" />
          <p className="text-xs font-semibold text-subtle uppercase tracking-wide mb-3">Tags</p>
          <div className="flex flex-wrap gap-2">
            {task.tags!.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full text-xs font-medium bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-[var(--border)]"
              >
                {tag}
              </span>
            ))}
          </div>
        </>
      )}

      {/* Custom fields */}
      {hasCustomFields && (
        <>
          <div className="border-b border-[var(--border)] my-6" />
          <p className="text-xs font-semibold text-subtle uppercase tracking-wide mb-3">Custom Fields</p>
          <div>
            {Object.entries(task.customFields!).map(([key, value]) => (
              <div
                key={key}
                className="flex justify-between items-start gap-2 py-2.5 border-b border-[var(--border)] last:border-0"
              >
                <span className="text-xs text-subtle capitalize">{key.replace(/_/g, ' ')}</span>
                <span className="text-xs text-primary font-medium text-right">{String(value)}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
