'use client';

import SearchResultItem from './SearchResultItem';
import { ENTITY_LABELS } from '@/lib/types/search';
import type { SearchResultItem as SearchResultItemType, SearchEntityType } from '@/lib/types/search';

interface Props {
  entityType: SearchEntityType;
  items: SearchResultItemType[];
  onSelect: (url: string) => void;
}

export default function SearchResultGroup({ entityType, items, onSelect }: Props) {
  if (items.length === 0) return null;

  return (
    <div>
      <p className="px-4 py-1.5 text-xs font-semibold text-muted uppercase tracking-wider">
        {ENTITY_LABELS[entityType]}
      </p>
      <div className="space-y-0.5">
        {items.map((item) => (
          <SearchResultItem key={item.id} item={item} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}
