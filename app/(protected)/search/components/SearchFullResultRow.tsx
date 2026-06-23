'use client';

import { useRouter } from 'next/navigation';
import {
  TrendingUp,
  Phone,
  CheckSquare,
  Paperclip,
  GitBranch,
  Bell,
  Zap,
  ChevronRight,
} from 'lucide-react';
import type { SearchResultItem, SearchEntityType } from '@/lib/types/search';

const ENTITY_ICONS: Record<SearchEntityType, React.ElementType> = {
  lead: TrendingUp,
  contact: Phone,
  task: CheckSquare,
  document: Paperclip,
  automation: GitBranch,
  reminder: Bell,
  automationStep: Zap,
};

const ENTITY_COLORS: Record<SearchEntityType, string> = {
  lead: 'bg-blue-100 text-blue-600',
  contact: 'bg-green-100 text-green-600',
  task: 'bg-orange-100 text-orange-600',
  document: 'bg-purple-100 text-purple-600',
  automation: 'bg-pink-100 text-pink-600',
  reminder: 'bg-yellow-100 text-yellow-600',
  automationStep: 'bg-cyan-100 text-cyan-600',
};

interface Props {
  item: SearchResultItem;
}

export default function SearchFullResultRow({ item }: Props) {
  const router = useRouter();
  const Icon = ENTITY_ICONS[item.entityType];
  const colorClass = ENTITY_COLORS[item.entityType];

  return (
    <button
      type="button"
      onClick={() => router.push(item.url)}
      className="w-full flex items-center gap-4 px-4 py-3.5 text-left interactive rounded-xl group border border-transparent hover:border-[var(--border)] transition-all"
    >
      <span className={`flex-shrink-0 p-2.5 rounded-xl ${colorClass}`}>
        <Icon size={16} />
      </span>

      <span className="flex-1 min-w-0">
        <span className="block text-sm font-semibold text-primary truncate">{item.label}</span>
        {item.sublabel && (
          <span className="block text-xs text-muted truncate mt-0.5">{item.sublabel}</span>
        )}
      </span>

      <ChevronRight size={16} className="text-muted flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
}
