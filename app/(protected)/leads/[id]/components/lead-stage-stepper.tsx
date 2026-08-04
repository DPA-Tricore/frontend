'use client';

import { Fragment } from 'react';
import { getStatusColor } from '@/lib/theme/colors';
import { LEAD_STAGES, LEAD_STAGE_DOT_COLORS } from '@/lib/constants/leads';

interface LeadStageStepperProps {
  status: string;
  onChange: (status: string) => void;
  disabled?: boolean;
}

export default function LeadStageStepper({ status, onChange, disabled }: LeadStageStepperProps) {
  const currentIndex = LEAD_STAGES.indexOf(status as (typeof LEAD_STAGES)[number]);
  const isBranchState = currentIndex === -1;

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center flex-1 max-w-md">
        {LEAD_STAGES.map((stage, i) => (
          <Fragment key={stage}>
            {i > 0 && (
              <div
                className={`h-0.5 flex-1 mt-[7px] transition-colors ${
                  !isBranchState && i <= currentIndex ? 'bg-gray-900 dark:bg-white' : 'bg-[var(--border)]'
                }`}
              />
            )}
            <button
              type="button"
              onClick={() => onChange(stage)}
              disabled={disabled}
              className="flex flex-col items-center gap-1.5 shrink-0 group disabled:cursor-not-allowed"
            >
              <span
                className={`w-3.5 h-3.5 rounded-full border-2 transition-colors ${
                  isBranchState
                    ? 'bg-transparent border-[var(--border)] group-hover:border-gray-400'
                    : i < currentIndex
                      ? 'bg-gray-900 border-gray-900 dark:bg-white dark:border-white'
                      : i === currentIndex
                        ? `${LEAD_STAGE_DOT_COLORS[stage]} border-transparent ring-4 ring-black/5 dark:ring-white/10`
                        : 'bg-transparent border-[var(--border)] group-hover:border-gray-400'
                }`}
              />
              <span
                className={`text-[11px] font-medium whitespace-nowrap ${
                  !isBranchState && i === currentIndex ? 'text-primary' : 'text-subtle'
                }`}
              >
                {stage.replace(/_/g, ' ')}
              </span>
            </button>
          </Fragment>
        ))}
      </div>

      {isBranchState && (
        <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
          {status.replace(/_/g, ' ')}
        </span>
      )}
    </div>
  );
}
