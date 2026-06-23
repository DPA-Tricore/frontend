'use client';

import { useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export default function SearchPageInput({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] focus-within:border-blue-500 transition-colors">
      <Search size={18} className="text-muted flex-shrink-0" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search leads, contacts, tasks, documents…"
        className="flex-1 bg-transparent text-base text-primary placeholder:text-muted outline-none"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="p-1 icon-btn text-muted hover:text-primary flex-shrink-0"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
