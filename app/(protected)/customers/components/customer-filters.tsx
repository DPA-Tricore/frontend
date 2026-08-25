'use client';

interface CustomerFiltersProps {
  search: string;
  statusFilter: string;
  sortBy: string;
  onSearch: (value: string) => void;
  onStatusFilter: (value: string) => void;
  onSortChange: (value: string) => void;
}

export default function CustomerFilters({
  search,
  statusFilter,
  sortBy,
  onSearch,
  onStatusFilter,
  onSortChange,
}: CustomerFiltersProps) {
  return (
    <div className="mb-6 surface rounded-lg border border-[var(--border)] p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="Search by name or contact..."
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm surface text-primary"
        />
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilter(e.target.value)}
          className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm surface text-primary"
        >
          <option value="">Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="CHURNED">Churned</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm surface text-primary"
        >
          <option value="createdAt">Sort</option>
          <option value="firstName">First Name</option>
          <option value="lastName">Last Name</option>
          <option value="status">Status</option>
        </select>
      </div>
    </div>
  );
}
