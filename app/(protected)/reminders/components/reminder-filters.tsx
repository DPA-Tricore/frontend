'use client';

type SortField = 'reminderTime' | 'dueDate' | 'title' | 'status' | 'createdAt';

interface ReminderFiltersProps {
  search: string;
  statusFilter: string;
  sortBy: SortField;
  onSearch: (value: string) => void;
  onStatusFilter: (value: string) => void;
  onSortChange: (value: SortField) => void;
}

export default function ReminderFilters({
  search,
  statusFilter,
  sortBy,
  onSearch,
  onStatusFilter,
  onSortChange,
}: ReminderFiltersProps) {
  return (
    <div className="mb-6 surface rounded-lg border border-[var(--border)] p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="Search by title or description..."
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm surface text-primary"
        />
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilter(e.target.value)}
          className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm surface text-primary"
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="TRIGGERED">Triggered</option>
          <option value="ACKNOWLEDGED">Acknowledged</option>
          <option value="DISMISSED">Dismissed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as SortField)}
          className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm surface text-primary"
        >
          <option value="reminderTime">Reminder Time</option>
          <option value="dueDate">Due Date</option>
          <option value="title">Title</option>
          <option value="status">Status</option>
          <option value="createdAt">Created At</option>
        </select>
      </div>
    </div>
  );
}
