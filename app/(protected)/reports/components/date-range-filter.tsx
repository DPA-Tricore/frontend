'use client';

interface DateRangeFilterProps {
  startDate: string;
  endDate: string;
  onChange: (startDate: string, endDate: string) => void;
}

const toISO = (d: Date) => d.toISOString().split('T')[0];

const PRESETS = [
  {
    label: '7d',
    apply: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 6);
      return { start: toISO(start), end: toISO(end) };
    },
  },
  {
    label: '30d',
    apply: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 29);
      return { start: toISO(start), end: toISO(end) };
    },
  },
  {
    label: '3m',
    apply: () => {
      const end = new Date();
      const start = new Date();
      start.setMonth(end.getMonth() - 3);
      return { start: toISO(start), end: toISO(end) };
    },
  },
  {
    label: 'This year',
    apply: () => {
      const end = new Date();
      const start = new Date(end.getFullYear(), 0, 1);
      return { start: toISO(start), end: toISO(end) };
    },
  },
];

export default function DateRangeFilter({ startDate, endDate, onChange }: DateRangeFilterProps) {
  const activePreset = PRESETS.find(({ apply }) => {
    const p = apply();
    return p.start === startDate && p.end === endDate;
  });

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex items-center gap-1 border border-[var(--border)] rounded-lg p-1 bg-[var(--surface)]">
        {PRESETS.map((preset) => {
          const isActive = activePreset?.label === preset.label;
          return (
            <button
              key={preset.label}
              onClick={() => {
                const p = preset.apply();
                onChange(p.start, p.end);
              }}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                isActive
                  ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                  : 'text-[var(--muted)] hover:text-primary'
              }`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="date"
          value={startDate}
          onChange={(e) => onChange(e.target.value, endDate)}
          className="text-sm border border-[var(--border)] rounded-lg px-3 py-1.5 bg-[var(--surface)] text-primary"
        />
        <span className="text-xs text-[var(--muted)]">→</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => onChange(startDate, e.target.value)}
          className="text-sm border border-[var(--border)] rounded-lg px-3 py-1.5 bg-[var(--surface)] text-primary"
        />
      </div>

      {(startDate || endDate) && (
        <button
          onClick={() => onChange('', '')}
          className="text-xs text-[var(--muted)] hover:text-primary underline"
        >
          Clear
        </button>
      )}
    </div>
  );
}
