'use client';

interface DateRangeFilterProps {
  startDate: string;
  endDate: string;
  onChange: (startDate: string, endDate: string) => void;
}

export default function DateRangeFilter({ startDate, endDate, onChange }: DateRangeFilterProps) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <label className="text-xs text-[var(--muted)]">From</label>
      <input
        type="date"
        value={startDate}
        onChange={(e) => onChange(e.target.value, endDate)}
        className="text-sm border border-[var(--border)] rounded-lg px-3 py-1.5 bg-[var(--surface)] text-primary"
      />
      <label className="text-xs text-[var(--muted)]">To</label>
      <input
        type="date"
        value={endDate}
        onChange={(e) => onChange(startDate, e.target.value)}
        className="text-sm border border-[var(--border)] rounded-lg px-3 py-1.5 bg-[var(--surface)] text-primary"
      />
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
