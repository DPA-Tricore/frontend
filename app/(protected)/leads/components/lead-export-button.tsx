'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import { leadsApi } from '@/lib/api/leads';
import type { ExportLeadsParams } from '@/lib/types/leads';

interface LeadExportButtonProps {
  params?: ExportLeadsParams;
}

export default function LeadExportButton({ params }: LeadExportButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    setError(false);
    try {
      await leadsApi.exportCsv(params);
    } catch {
      setError(true);
      setTimeout(() => setError(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className={`flex items-center gap-2 px-3 py-1.5 text-sm border rounded-lg transition-colors disabled:opacity-40 ${
        error
          ? 'border-red-300 text-red-500 dark:border-red-800'
          : 'border-[var(--border)] text-primary hover:opacity-70'
      }`}
    >
      <Download size={14} />
      {loading ? 'Exporting…' : error ? 'Export failed' : 'Export CSV'}
    </button>
  );
}
