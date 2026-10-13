'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { X } from 'lucide-react';
import { customersApi } from '@/lib/api/customers';
import { leadsApi } from '@/lib/api/leads';
import { useDebouncedValue } from '@/lib/hooks/use-debounced-value';
import { BILL_TO_SEARCH_LIMIT } from '@/lib/constants/invoices';
import { FORM_INPUT_CLASS } from '@/lib/constants/forms';
import type { BillTo } from '@/lib/types/invoices';

interface BillToPickerProps {
  value: BillTo | null;
  onChange: (value: BillTo | null) => void;
}

export default function BillToPicker({ value, onChange }: BillToPickerProps) {
  const [type, setType] = useState<BillTo['type']>('customer');
  const [query, setQuery] = useState('');
  const search = useDebouncedValue(query, 300);

  const { data: results = [], isFetching } = useQuery({
    queryKey: ['billToSearch', type, search],
    enabled: search.trim().length > 0,
    queryFn: async (): Promise<BillTo[]> => {
      const params = { search, limit: BILL_TO_SEARCH_LIMIT, page: 1 };
      const rows =
        type === 'customer'
          ? (await customersApi.getCustomers(params)).data
          : await leadsApi.getLeads(params).then((r) => (Array.isArray(r) ? r : r.data));
      return rows.map((row) => ({ type, id: row.id, name: `${row.firstName} ${row.lastName}` }));
    },
  });

  if (value) {
    return (
      <div className="flex items-center justify-between px-4 py-2 border border-[var(--border)] rounded-lg surface">
        <span className="text-sm text-primary">
          {value.name} <span className="text-xs text-subtle ml-1">{value.type === 'customer' ? 'Customer' : 'Lead'}</span>
        </span>
        <button type="button" onClick={() => onChange(null)} aria-label="Change" className="text-subtle hover:text-primary">
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="inline-flex rounded-lg border border-[var(--border)] p-0.5 text-sm">
        {(['customer', 'lead'] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setType(option)}
            className={`px-3 py-1 rounded-md transition-colors ${
              type === option ? 'bg-[var(--surface-2)] text-primary font-medium' : 'text-muted hover:text-primary'
            }`}
          >
            {option === 'customer' ? 'Customer' : 'Lead'}
          </button>
        ))}
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={`Search ${type === 'customer' ? 'customers' : 'leads'} by name`}
        className={FORM_INPUT_CLASS}
      />
      {search.trim() && (
        <div className="border border-[var(--border)] rounded-lg overflow-hidden">
          {isFetching && results.length === 0 ? (
            <p className="px-4 py-2 text-sm text-subtle">Searching…</p>
          ) : results.length === 0 ? (
            <p className="px-4 py-2 text-sm text-subtle">No matches</p>
          ) : (
            results.map((result) => (
              <button
                key={result.id}
                type="button"
                onClick={() => onChange(result)}
                className="block w-full text-left px-4 py-2 text-sm text-primary hover:bg-[var(--surface-2)]"
              >
                {result.name}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
