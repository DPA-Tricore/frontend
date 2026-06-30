'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';

export type ViewMode = 'board' | 'list';

export default function ViewToggle() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const view: ViewMode = searchParams.get('view') === 'list' ? 'list' : 'board';

  const setView = (next: ViewMode) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next === 'board') {
      params.delete('view');
    } else {
      params.set('view', next);
    }
    const qs = params.toString();
    router.replace(pathname + (qs ? `?${qs}` : ''));
  };

  return (
    <div className="flex items-center border border-[var(--border)] rounded-lg overflow-hidden">
      <button
        onClick={() => setView('board')}
        title="Board view"
        className={`px-3 py-2 text-sm transition-colors ${
          view === 'board' ? 'bg-gray-900 text-white' : 'surface text-muted hover:text-primary'
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="5" height="18" rx="1" />
          <rect x="10" y="3" width="5" height="12" rx="1" />
          <rect x="17" y="3" width="5" height="15" rx="1" />
        </svg>
      </button>
      <button
        onClick={() => setView('list')}
        title="List view"
        className={`px-3 py-2 text-sm border-l border-[var(--border)] transition-colors ${
          view === 'list' ? 'bg-gray-900 text-white' : 'surface text-muted hover:text-primary'
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <line x1="3" y1="6" x2="3.01" y2="6" />
          <line x1="3" y1="12" x2="3.01" y2="12" />
          <line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
      </button>
    </div>
  );
}
