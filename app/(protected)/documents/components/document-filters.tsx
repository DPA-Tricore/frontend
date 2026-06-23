'use client';

type SortField = 'originalName' | 'fileSize' | 'createdAt';

interface DocumentFiltersProps {
  search: string;
  sortBy: SortField;
  onSearch: (value: string) => void;
  onSortChange: (value: SortField) => void;
}

export default function DocumentFilters({
  search,
  sortBy,
  onSearch,
  onSortChange,
}: DocumentFiltersProps) {
  return (
    <div className="mb-6 surface rounded-lg border border-[var(--border)] p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="Search by file name..."
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm surface text-primary"
        />
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as SortField)}
          className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm surface text-primary"
        >
          <option value="createdAt">Sort: Date Uploaded</option>
          <option value="originalName">Sort: File Name</option>
          <option value="fileSize">Sort: File Size</option>
        </select>
      </div>
    </div>
  );
}
