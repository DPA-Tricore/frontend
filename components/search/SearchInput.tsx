'use client';

import { useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';

interface Props {
  value: string;
  onChange: (v: string) => void;
  isLoading: boolean;
  onClear: () => void;
}

export default function SearchInput({ value, onChange, isLoading, onClear }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border)]">
      {isLoading ? (
        <Loader2 size={16} className="text-muted flex-shrink-0 animate-spin" />
      ) : (
        <Search size={16} className="text-muted flex-shrink-0" />
      )}
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search leads, contacts, tasks..."
        className="flex-1 bg-transparent text-sm text-primary placeholder:text-muted outline-none"
      />
      {value && (
        <button
          type="button"
          onClick={onClear}
          className="p-1 icon-btn text-muted hover:text-primary"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
