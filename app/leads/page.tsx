'use client';

import { useState, useEffect, useCallback } from 'react';
import { axiosClient } from '@/lib/api/axios-client';
import SlideModal from '@/components/slide-modal';
import { colors, getStatusColor } from '@/lib/theme/colors';

interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  leadType: string;
  status: string;
  email?: string;
  source?: string;
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

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Pagination and filtering state
  const [page, setPage] = useState(1);
  const [limit] = useState(10); // Fixed limit for pagination testing
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

      const response = await axiosClient.get<PaginatedResponse>(`/leads?${params}`);

      if ((response.data as any).data) {
        // Handle paginated response
        setLeads((response.data as any).data);
        setMeta((response.data as any).meta);
      } else {
        // Handle legacy response format
        setLeads(response.data as any);
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
      await axiosClient.post('/leads', formData);
      setFormData({ firstName: '', lastName: '', leadType: 'PROSPECT', status: 'NEW' });
      setShowForm(false);
      // Reset to first page when creating new lead
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
    setPage(1); // Reset to first page on search
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      // Toggle sort order if same field is clicked
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to descending
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
    if (sortBy !== field) return <span className="text-gray-400">⇅</span>;
    return sortOrder === 'asc' ? <span>↑</span> : <span>↓</span>;
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leads Management</h1>
          <p className="text-gray-600 mt-2">Track and manage your sales pipeline</p>
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
      <SlideModal isOpen={showForm} onClose={() => setShowForm(false)} title="Create New Lead">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="John"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Lead Type</label>
            <select
              name="leadType"
              value={formData.leadType}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="PROSPECT">Prospect</option>
              <option value="WARM_LEAD">Warm Lead</option>
              <option value="QUALIFIED_LEAD">Qualified Lead</option>
              <option value="OPPORTUNITY">Opportunity</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={() => setShowForm(false)} className={colors.button.secondary}>
              Cancel
            </button>
            <button type="submit" className={colors.button.primary}>
              Create Lead
            </button>
          </div>
        </form>
      </SlideModal>

      {/* Search and Filter Bar */}
      <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <input
              type="text"
              placeholder="Search by name or source..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
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
        <div className="mb-4 text-sm text-gray-600">
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
          <p className="text-gray-600">Loading leads...</p>
        </div>
      ) : leads.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-600">
            No leads found. {search ? 'Try adjusting your search.' : 'Create your first lead to get started!'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th
                    className="px-6 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('firstName')}
                  >
                    <div className="flex items-center gap-2">
                      Name
                      <SortIcon field="firstName" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('leadType')}
                  >
                    <div className="flex items-center gap-2">
                      Lead Type
                      <SortIcon field="leadType" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center gap-2">
                      Status
                      <SortIcon field="status" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Source</th>
                  <th
                    className="px-6 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('createdAt')}
                  >
                    <div className="flex items-center gap-2">
                      Created
                      <SortIcon field="createdAt" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {lead.firstName} {lead.lastName}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{lead.leadType}</span>
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
                      <span className="text-sm text-gray-600">{lead.source || '—'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
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
              <div className="text-sm text-gray-600">
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

                {/* Generate page numbers */}
                <div className="flex gap-1">
                  {(() => {
                    const pages: React.ReactNode[] = [];
                    const maxPagesToShow = 7;
                    let startPage = Math.max(1, meta.page - Math.floor(maxPagesToShow / 2));
                    const endPage = Math.min(meta.totalPages, startPage + maxPagesToShow - 1);

                    if (endPage - startPage + 1 < maxPagesToShow) {
                      startPage = Math.max(1, endPage - maxPagesToShow + 1);
                    }

                    // First page
                    if (startPage > 1) {
                      pages.push(
                        <button
                          key={1}
                          onClick={() => setPage(1)}
                          className="px-3 py-2 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          1
                        </button>,
                      );
                      if (startPage > 2) {
                        pages.push(
                          <span key="dots-start" className="px-2 py-2 text-gray-500">
                            ...
                          </span>,
                        );
                      }
                    }

                    // Middle pages
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

                    // Last page
                    if (endPage < meta.totalPages) {
                      if (endPage < meta.totalPages - 1) {
                        pages.push(
                          <span key="dots-end" className="px-2 py-2 text-gray-500">
                            ...
                          </span>,
                        );
                      }
                      pages.push(
                        <button
                          key={meta.totalPages}
                          onClick={() => setPage(meta.totalPages)}
                          className="px-3 py-2 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50"
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

