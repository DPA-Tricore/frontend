'use client';

import {
  TrendingUp,
  Phone,
  CheckSquare,
  Paperclip,
  GitBranch,
  Bell,
  Zap,
} from 'lucide-react';
import type { SearchResultItem as SearchResultItemType, SearchEntityType } from '@/lib/types/search';

const ENTITY_ICONS: Record<SearchEntityType, React.ElementType> = {
  lead: TrendingUp,
  contact: Phone,
  task: CheckSquare,
  document: Paperclip,
  automation: GitBranch,
  reminder: Bell,
  automationStep: Zap,
};

interface Props {
  item: SearchResultItemType;
  onSelect: (url: string) => void;
}

export default function SearchResultItem({ item, onSelect }: Props) {
  const Icon = ENTITY_ICONS[item.entityType];

  return (
    <button
      type="button"
      onClick={() => onSelect(item.url)}
      className="w-full flex items-center gap-3 px-4 py-2.5 text-left interactive rounded-lg group"
    >
      <span className="flex-shrink-0 p-1.5 rounded-md bg-[var(--bg-secondary)] text-muted group-hover:text-primary transition-colors">
        <Icon size={14} />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-medium text-primary truncate">{item.label}</span>
        {item.sublabel && (
          <span className="block text-xs text-muted truncate">{item.sublabel}</span>
        )}
      </span>
    </button>
  );
}
