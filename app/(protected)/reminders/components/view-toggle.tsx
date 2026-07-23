'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { List, Calendar as CalendarIcon } from 'lucide-react';

export type ViewMode = 'list' | 'calendar';

export default function ViewToggle() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const view: ViewMode = searchParams.get('view') === 'list' ? 'list' : 'calendar';

  const setView = (next: ViewMode) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next === 'calendar') {
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
        onClick={() => setView('calendar')}
        title="Calendar view"
        className={`px-3 py-2 text-sm transition-colors ${
          view === 'calendar' ? 'bg-gray-900 text-white' : 'surface text-muted hover:text-primary'
        }`}
      >
        <CalendarIcon className="w-4 h-4" />
      </button>
      <button
        onClick={() => setView('list')}
        title="List view"
        className={`px-3 py-2 text-sm border-l border-[var(--border)] transition-colors ${
          view === 'list' ? 'bg-gray-900 text-white' : 'surface text-muted hover:text-primary'
        }`}
      >
        <List className="w-4 h-4" />
      </button>
    </div>
  );
}
