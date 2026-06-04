'use client';

interface LeadFiltersProps {
  search: string;
  statusFilter: string;
  leadTypeFilter: string;
  sortBy: string;
  onSearch: (value: string) => void;
  onStatusFilter: (value: string) => void;
  onLeadTypeFilter: (value: string) => void;
  onSortChange: (value: string) => void;
}

export default function LeadFilters({
  search,
  statusFilter,
  leadTypeFilter,
  sortBy,
  onSearch,
  onStatusFilter,
  onLeadTypeFilter,
  onSortChange,
}: LeadFiltersProps) {
  return (
    <div className="mb-6 surface rounded-lg border border-[var(--border)] p-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="Search by name or source..."
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
          <option value="NEW">New</option>
          <option value="CONTACTED">Contacted</option>
          <option value="QUALIFIED">Qualified</option>
          <option value="IN_NEGOTIATION">In Negotiation</option>
          <option value="CONVERTED">Converted</option>
          <option value="LOST">Lost</option>
          <option value="UNRESPONSIVE">Unresponsive</option>
        </select>
        <select
          value={leadTypeFilter}
          onChange={(e) => onLeadTypeFilter(e.target.value)}
          className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm surface text-primary"
        >
          <option value="">Types</option>
          <option value="PROSPECT">Prospect</option>
          <option value="WARM_LEAD">Warm Lead</option>
          <option value="QUALIFIED_LEAD">Qualified Lead</option>
          <option value="OPPORTUNITY">Opportunity</option>
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
          <option value="leadType">Lead Type</option>
        </select>
      </div>
    </div>
  );
}
