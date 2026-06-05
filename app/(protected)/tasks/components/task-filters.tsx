'use client';

type SortField = 'title' | 'createdAt' | 'dueDate' | 'status' | 'priority' | 'type';

interface TaskFiltersProps {
  search: string;
  statusFilter: string;
  priorityFilter: string;
  typeFilter: string;
  sortBy: SortField;
  onSearch: (value: string) => void;
  onStatusFilter: (value: string) => void;
  onPriorityFilter: (value: string) => void;
  onTypeFilter: (value: string) => void;
  onSortChange: (value: SortField) => void;
}

export default function TaskFilters({
  search,
  statusFilter,
  priorityFilter,
  typeFilter,
  sortBy,
  onSearch,
  onStatusFilter,
  onPriorityFilter,
  onTypeFilter,
  onSortChange,
}: TaskFiltersProps) {
  return (
    <div className="mb-6 surface rounded-lg border border-[var(--border)] p-4">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <input
          type="text"
          placeholder="Search tasks..."
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
          <option value="PENDING">Pending</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => onPriorityFilter(e.target.value)}
          className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm surface text-primary"
        >
          <option value="">Priority</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="URGENT">Urgent</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => onTypeFilter(e.target.value)}
          className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm surface text-primary"
        >
          <option value="">Type</option>
          <option value="CALL">Call</option>
          <option value="EMAIL">Email</option>
          <option value="MEETING">Meeting</option>
          <option value="FOLLOW_UP">Follow Up</option>
          <option value="CUSTOM">Custom</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as SortField)}
          className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm surface text-primary"
        >
          <option value="dueDate">Due Date</option>
          <option value="title">Title</option>
          <option value="createdAt">Created</option>
          <option value="status">Status</option>
          <option value="priority">Priority</option>
        </select>
      </div>
    </div>
  );
}
