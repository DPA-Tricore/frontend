'use client';

interface LeadTopBarProps {
  onBack: () => void;
}

export default function LeadTopBar({ onBack }: LeadTopBarProps) {
  return (
    <div className="sticky top-0 z-10 [background:var(--bg)] border-b border-[var(--border)] px-8 py-3.5">
      <button
        onClick={onBack}
        className="text-sm text-subtle hover:text-primary transition-colors"
      >
        ← Leads
      </button>
    </div>
  );
}
