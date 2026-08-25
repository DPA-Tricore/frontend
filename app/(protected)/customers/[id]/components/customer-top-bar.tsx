'use client';

interface CustomerTopBarProps {
  onBack: () => void;
}

export default function CustomerTopBar({ onBack }: CustomerTopBarProps) {
  return (
    <div className="sticky top-0 z-10 [background:var(--bg)] border-b border-[var(--border)] px-8 py-3.5">
      <button
        onClick={onBack}
        className="text-sm text-subtle hover:text-primary transition-colors"
      >
        ← Customers
      </button>
    </div>
  );
}
