'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import { reportsApi, ReportType } from '@/lib/api/reports';
import type { ReportQueryParams } from '@/lib/types/reports';

interface ExportButtonProps {
  type: ReportType;
  query?: ReportQueryParams;
}

export default function ExportButton({ type, query }: ExportButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      await reportsApi.exportCsv(type, query);
    } catch {
      // silent — file just won't download
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="flex items-center gap-2 px-3 py-1.5 text-sm border border-[var(--border)] rounded-lg text-primary hover:opacity-70 transition-opacity disabled:opacity-40"
    >
      <Download size={14} />
      {loading ? 'Exporting…' : 'Export CSV'}
    </button>
  );
}
