'use client';

import type { AutomationStepResponseDto } from '@/lib/types/automations';
import { colors } from '@/lib/theme/colors';
import StepCard from './step-card';

const DAY_HEIGHT = 80;

interface StepTimelineProps {
  steps: AutomationStepResponseDto[];
  deletingStepId: string | null;
  onEdit: (step: AutomationStepResponseDto) => void;
  onDelete: (stepId: string) => void;
}

export default function StepTimeline({
  steps,
  deletingStepId,
  onEdit,
  onDelete,
}: StepTimelineProps) {
  if (steps.length === 0) {
    return (
      <div className="ml-8 p-8 surface border border-dashed border-[var(--border)] rounded-lg text-center text-muted text-sm">
        No steps yet. Click &ldquo;+ Add Step&rdquo; to build your sequence.
      </div>
    );
  }

  const sortedSteps = [...steps].sort((a, b) => a.dayOffset - b.dayOffset || a.order - b.order);
  const maxDay = Math.max(...sortedSteps.map((s) => s.dayOffset), 0);
  const uniqueDays = Array.from(new Set(sortedSteps.map((s) => s.dayOffset))).sort((a, b) => a - b);

  return (
    <div className="flex gap-8">
      {/* Left sidebar: Day markers */}
      <div className="w-16 flex-shrink-0">
        <div className="text-xs font-semibold text-subtle uppercase tracking-wider mb-8">By Day</div>
        {/* START marker */}
        <div className="h-8 flex items-center justify-center text-xs font-bold text-green-600">
          START
        </div>

        {/* Day numbers */}
        <div className="space-y-1">
          {uniqueDays.map((day) => (
            <div
              key={day}
              className="h-14 flex items-start justify-center pt-1 text-sm font-bold text-primary"
            >
              {day}
            </div>
          ))}
        </div>

        {/* END marker */}
        <div className="h-8 flex items-center justify-center text-xs font-bold text-red-600 mt-4">
          END
        </div>
      </div>

      {/* Right side: Timeline with steps */}
      <div className="flex-1 relative">
        {/* Vertical line */}
        <div className="absolute left-6 top-0 bottom-0 w-px bg-[var(--border)]" />

        {/* START circle */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative z-10 w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
            ✓
          </div>
          <span className="text-sm text-muted">Lead enters stage</span>
        </div>

        {/* Steps */}
        <div className="space-y-4 ml-2">
          {sortedSteps.map((step) => (
            <div
              key={step.id}
              className="relative flex items-start gap-4"
              style={{
                marginTop: `${DAY_HEIGHT * 0.5}px`,
              }}
            >
              {/* Day connector circle */}
              <div className="relative z-10 w-4 h-4 rounded-full bg-white border-2 border-blue-600 flex-shrink-0 mt-2" />

              {/* Step card */}
              <div className="flex-1">
                <StepCard
                  step={step}
                  deletingStepId={deletingStepId}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              </div>
            </div>
          ))}
        </div>

        {/* END circle */}
        <div className="flex items-center gap-4 mt-8 ml-2">
          <div className="relative z-10 w-12 h-12 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-bold shrink-0">
            ✕
          </div>
          <span className="text-sm text-muted">Lead exits stage</span>
        </div>
      </div>
    </div>
  );
}
