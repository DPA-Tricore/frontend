'use client';

import { useState, useEffect, useCallback } from 'react';
import { leadsApi } from '@/lib/api/leads';
import SlideModal from '@/components/slide-modal';
import { colors, getStatusColor } from '@/lib/theme/colors';

interface Contact {
  id: string;
  type: string;
  value: string;
  isPrimary: boolean;
  isVerified: boolean;
  doNotContact: boolean;
  lastUsedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  leadType: string;
  status: string;
  email?: string;
  source?: string;
  contacts?: Contact[];
  createdAt?: string;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface PaginatedResponse {
  data: Lead[];
  meta: PaginationMeta;
}

const getPrimaryContact = (contacts?: Contact[]): Contact | null => {
  if (!contacts || contacts.length === 0) return null;
  return contacts.find((c) => c.isPrimary) || contacts[0] || null;
};

const getContactDisplay = (contact: Contact | null): string => {
  if (!contact) return '—';
  const typeLabel = contact.type.toLowerCase();
  return `${typeLabel}: ${contact.value}`;
};

function formatDateTime(isoString: string): string {
  return new Date(isoString).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Pagination and filtering state
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<
    'createdAt' | 'firstName' | 'lastName' | 'status' | 'leadType'
  >('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [statusFilter, setStatusFilter] = useState('');
  const [leadTypeFilter, setLeadTypeFilter] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    leadType: 'PROSPECT',
    status: 'NEW',
  });

  // Reminder state
  const [reminderTimes, setReminderTimes] = useState<string[]>([]);
  const [reminderTimeInput, setReminderTimeInput] = useState('');
  const [demoMode, setDemoMode] = useState(false);

  const addReminderTime = () => {
    if (reminderTimeInput && !reminderTimes.includes(reminderTimeInput)) {
      setReminderTimes((prev) => [...prev, reminderTimeInput]);
      setReminderTimeInput('');
    }
  };

  const removeReminderTime = (time: string) => {
    setReminderTimes((prev) => prev.filter((t) => t !== time));
  };

  const resetForm = () => {
    setFormData({ firstName: '', lastName: '', leadType: 'PROSPECT', status: 'NEW' });
    setReminderTimes([]);
    setReminderTimeInput('');
    setDemoMode(false);
  };

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        sortBy,
        sortOrder,
        ...(statusFilter && { status: statusFilter }),
        ...(leadTypeFilter && { leadType: leadTypeFilter }),
      });

      const response = await leadsApi.getLeads({
        page,
        limit,
        ...(search && { search }),
        sortBy,
        sortOrder,
        ...(statusFilter && { status: statusFilter }),
        ...(leadTypeFilter && { leadType: leadTypeFilter }),
      });

      if ((response as any).data) {
        setLeads((response as any).data);
        setMeta((response as any).meta);
      } else {
        setLeads(response as any);
        setMeta(null);
      }
      setError(null);
    } catch (err) {
      setError('Failed to fetch leads');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, sortBy, sortOrder, statusFilter, leadTypeFilter]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await leadsApi.createLead({
        ...formData,
        ...(reminderTimes.length > 0 && {
          reminderTimes: reminderTimes.map((t) => new Date(t).toISOString()),
        }),
        ...(demoMode && { demoMode: true }),
      });
      resetForm();
      setShowForm(false);
      setPage(1);
      fetchLeads();
    } catch (err) {
      setError('Failed to create lead');
      console.error(err);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field as any);
      setSortOrder('desc');
    }
    setPage(1);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setPage(1);
  };

  const handleLeadTypeFilter = (leadType: string) => {
    setLeadTypeFilter(leadType);
    setPage(1);
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortBy !== field) return <span className="text-subtle">⇅</span>;
    return sortOrder === 'asc' ? <span>↑</span> : <span>↓</span>;
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary">Leads Management</h1>
          <p className="text-muted mt-2">Track and manage your sales pipeline</p>
        </div>
        <button onClick={() => setShowForm(true)} className={colors.button.primary}>
          + Add Lead
        </button>
      </div>

      {/* Error Message */}
      {error ? (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      ) : null}

      {/* Add Lead Modal */}
      <SlideModal isOpen={showForm} onClose={() => { setShowForm(false); resetForm(); }} title="Create New Lead">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-muted mb-2">First Name</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent surface text-primary"
              placeholder="John"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted mb-2">Last Name</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent surface text-primary"
              placeholder="Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted mb-2">Lead Type</label>
            <select
              name="leadType"
              value={formData.leadType}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent surface text-primary"
            >
              <option value="PROSPECT">Prospect</option>
              <option value="WARM_LEAD">Warm Lead</option>
              <option value="QUALIFIED_LEAD">Qualified Lead</option>
              <option value="OPPORTUNITY">Opportunity</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted mb-2">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent surface text-primary"
            >
              <option value="NEW">New</option>
              <option value="CONTACTED">Contacted</option>
              <option value="QUALIFIED">Qualified</option>
              <option value="IN_NEGOTIATION">In Negotiation</option>
              <option value="CONVERTED">Converted</option>
              <option value="LOST">Lost</option>
              <option value="UNRESPONSIVE">Unresponsive</option>
            </select>
          </div>

          {/* Follow-up Reminders */}
          <div>
            <label className="block text-sm font-medium text-muted mb-3">
              Follow-up Reminders <span className="text-xs text-subtle font-normal">(optional)</span>
            </label>

            <div className="flex gap-2 items-center">
              <input
                type="datetime-local"
                value={reminderTimeInput}
                onChange={(e) => setReminderTimeInput(e.target.value)}
                className="flex-1 px-3 py-1.5 text-sm border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent surface text-primary"
              />
              <button
                type="button"
                onClick={addReminderTime}
                disabled={!reminderTimeInput}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-[var(--border)] text-muted hover:border-blue-400 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                + Add
              </button>
            </div>

            {reminderTimes.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {reminderTimes.map((time) => (
                  <span
                    key={time}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-600 text-white"
                  >
                    {formatDateTime(time)}
                    <button
                      type="button"
                      onClick={() => removeReminderTime(time)}
                      className="hover:opacity-70 ml-0.5"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            {reminderTimes.length > 0 && (
              <label className="inline-flex items-center gap-2 mt-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={demoMode}
                  onChange={(e) => setDemoMode(e.target.checked)}
                  className="w-4 h-4 rounded accent-orange-500"
                />
                <span className="text-xs text-orange-600 font-medium">
                  Fire immediately (demo mode)
                </span>
              </label>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={() => { setShowForm(false); resetForm(); }} className={colors.button.secondary}>
              Cancel
            </button>
            <button type="submit" className={colors.button.primary}>
              Create Lead
            </button>
          </div>
        </form>
      </SlideModal>

      {/* Search and Filter Bar */}
      <div className="mb-6 surface rounded-lg border border-[var(--border)] p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <input
              type="text"
              placeholder="Search by name or source..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm surface text-primary"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value)}
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
          </div>

          {/* Lead Type Filter */}
          <div>
            <select
              value={leadTypeFilter}
              onChange={(e) => handleLeadTypeFilter(e.target.value)}
              className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm surface text-primary"
            >
              <option value="">Types</option>
              <option value="PROSPECT">Prospect</option>
              <option value="WARM_LEAD">Warm Lead</option>
              <option value="QUALIFIED_LEAD">Qualified Lead</option>
              <option value="OPPORTUNITY">Opportunity</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
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
      </div>

      {/* Results Count */}
      {meta ? (
        <div className="mb-4 text-sm text-muted">
          Showing {(page - 1) * limit + 1} to {Math.min(page * limit, meta.total)} of {meta.total}{' '}
          leads
        </div>
      ) : null}

      {/* Leads List */}
      {loading ? (
        <div className="text-center py-12">
          <svg
            className={`animate-spin h-8 w-8 mx-auto ${colors.text.primary} mb-4`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="text-muted">Loading leads...</p>
        </div>
      ) : leads.length === 0 ? (
        <div className="text-center py-12 surface rounded-lg border border-[var(--border)]">
          <p className="text-muted">
            No leads found. {search ? 'Try adjusting your search.' : 'Create your first lead to get started!'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto surface rounded-lg border border-[var(--border)]">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)] [background:var(--bg)]">
                  <th
                    className="px-6 py-3 text-left text-sm font-semibold text-primary cursor-pointer hover:opacity-70"
                    onClick={() => handleSort('firstName')}
                  >
                    <div className="flex items-center gap-2">
                      Name
                      <SortIcon field="firstName" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-sm font-semibold text-primary cursor-pointer hover:opacity-70"
                    onClick={() => handleSort('leadType')}
                  >
                    <div className="flex items-center gap-2">
                      Lead Type
                      <SortIcon field="leadType" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-sm font-semibold text-primary cursor-pointer hover:opacity-70"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center gap-2">
                      Status
                      <SortIcon field="status" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Source</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Contact</th>
                  <th
                    className="px-6 py-3 text-left text-sm font-semibold text-primary cursor-pointer hover:opacity-70"
                    onClick={() => handleSort('createdAt')}
                  >
                    <div className="flex items-center gap-2">
                      Created
                      <SortIcon field="createdAt" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id} className="border-b border-[var(--border)] hover:[background:var(--bg)]">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-primary">
                        {lead.firstName} {lead.lastName}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-muted">{lead.leadType}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          lead.status,
                        )}`}
                      >
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-muted">{lead.source || '—'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-muted">
                        {getContactDisplay(getPrimaryContact(lead.contacts))}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-muted">
                        {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className={colors.button.text}>Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {meta && meta.totalPages > 1 ? (
            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-muted">
                Page {meta.page} of {meta.totalPages}
              </div>
              <div className="flex gap-2 items-center">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={!meta.hasPrevPage}
                  className={colors.pagination.button}
                >
                  ← Previous
                </button>

                <div className="flex gap-1">
                  {(() => {
                    const pages: React.ReactNode[] = [];
                    const maxPagesToShow = 7;
                    let startPage = Math.max(1, meta.page - Math.floor(maxPagesToShow / 2));
                    const endPage = Math.min(meta.totalPages, startPage + maxPagesToShow - 1);

                    if (endPage - startPage + 1 < maxPagesToShow) {
                      startPage = Math.max(1, endPage - maxPagesToShow + 1);
                    }

                    if (startPage > 1) {
                      pages.push(
                        <button
                          key={1}
                          onClick={() => setPage(1)}
                          className="px-3 py-2 rounded-lg text-sm font-medium border border-[var(--border)] text-primary hover:opacity-70"
                        >
                          1
                        </button>,
                      );
                      if (startPage > 2) {
                        pages.push(
                          <span key="dots-start" className="px-2 py-2 text-subtle">
                            ...
                          </span>,
                        );
                      }
                    }

                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(
                        <button
                          key={i}
                          onClick={() => setPage(i)}
                          className={
                            i === meta.page ? colors.pagination.active : colors.pagination.inactive
                          }
                        >
                          {i}
                        </button>,
                      );
                    }

                    if (endPage < meta.totalPages) {
                      if (endPage < meta.totalPages - 1) {
                        pages.push(
                          <span key="dots-end" className="px-2 py-2 text-subtle">
                            ...
                          </span>,
                        );
                      }
                      pages.push(
                        <button
                          key={meta.totalPages}
                          onClick={() => setPage(meta.totalPages)}
                          className="px-3 py-2 rounded-lg text-sm font-medium border border-[var(--border)] text-primary hover:opacity-70"
                        >
                          {meta.totalPages}
                        </button>,
                      );
                    }

                    return pages;
                  })()}
                </div>

                <button
                  onClick={() => setPage(page + 1)}
                  disabled={!meta.hasNextPage}
                  className={colors.pagination.button}
                >
                  Next →
                </button>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
