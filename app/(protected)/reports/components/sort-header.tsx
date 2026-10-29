import type { AgentSortKey } from '@/lib/types/reports';

interface SortHeaderProps {
  label: string;
  column: AgentSortKey;
  sortKey: AgentSortKey;
  sortDesc: boolean;
  onSort: (column: AgentSortKey) => void;
}

export default function SortHeader({ label, column, sortKey, sortDesc, onSort }: SortHeaderProps) {
  return (
    <th
      className="px-4 py-3 font-medium text-right cursor-pointer select-none hover:text-primary"
      onClick={() => onSort(column)}
    >
      {label} {sortKey === column ? (sortDesc ? '↓' : '↑') : ''}
    </th>
  );
}
