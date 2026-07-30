'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Download, UploadCloud, ArrowLeft, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { leadsApi } from '@/lib/api/leads';
import type { ImportResultDto, ImportRowResultDto, ImportRowStatus } from '@/lib/types/leads';
import { colors } from '@/lib/theme/colors';
import PageHeader from '@/components/page-header';
import LoadingSpinner from '@/components/loading-spinner';

// Upload -> review (dry-run) -> result (committed). `file` is kept in state through
// the review step because commit re-sends the same File to POST /leads/import —
// there's no server-side import session to reference instead.
type Step = 'upload' | 'review' | 'result';

const ROW_STATUS_STYLES: Record<ImportRowStatus, { label: string; classes: string }> = {
  valid: { label: 'Ready', classes: 'bg-blue-500/15 text-blue-600 dark:text-blue-400' },
  created: { label: 'Created', classes: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400' },
  duplicate: { label: 'Duplicate', classes: 'bg-amber-500/15 text-amber-600 dark:text-amber-400' },
  error: { label: 'Error', classes: 'bg-red-500/15 text-red-600 dark:text-red-400' },
};

function RowStatusBadge({ status }: { status: ImportRowStatus }) {
  const s = ROW_STATUS_STYLES[status];
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${s.classes}`}>
      {s.label}
    </span>
  );
}

function SummaryCard({ label, value, tone }: { label: string; value: number; tone: 'neutral' | 'good' | 'warn' | 'bad' }) {
  const toneClasses = {
    neutral: 'text-primary',
    good: 'text-emerald-600 dark:text-emerald-400',
    warn: 'text-amber-600 dark:text-amber-400',
    bad: 'text-red-600 dark:text-red-400',
  }[tone];
  return (
    <div className="surface border border-[var(--border)] rounded-lg px-4 py-3">
      <div className={`text-2xl font-bold ${toneClasses}`}>{value}</div>
      <div className="text-xs text-muted mt-0.5">{label}</div>
    </div>
  );
}

export default function LeadImportPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [validating, setValidating] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [result, setResult] = useState<ImportResultDto | null>(null);
  const [showAllRows, setShowAllRows] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setStep('upload');
    setFile(null);
    setResult(null);
    setShowAllRows(false);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Dry-run validation — runs automatically on file select, nothing is written yet.
  const validateFile = useCallback(async (selected: File) => {
    setFile(selected);
    setError(null);
    setValidating(true);
    try {
      const dryRunResult = await leadsApi.importLeads(selected, true);
      setResult(dryRunResult);
      setStep('review');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to validate this file.');
    } finally {
      setValidating(false);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) validateFile(selected);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) validateFile(dropped);
  };

  // Re-sends the same File from the dry-run step with dryRun=false to actually write the leads.
  const handleCommit = async () => {
    if (!file) return;
    setCommitting(true);
    setError(null);
    try {
      const commitResult = await leadsApi.importLeads(file, false);
      setResult(commitResult);
      setStep('result');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Import failed.');
    } finally {
      setCommitting(false);
    }
  };

  // Default view hides valid/created rows — with up to 1,000 rows per file, an
  // all-green table is just noise; only surface rows that need a human look.
  const attentionRows = result?.rows.filter((r) => r.status !== 'valid' && r.status !== 'created') ?? [];
  const visibleRows: ImportRowResultDto[] = result ? (showAllRows ? result.rows : attentionRows) : [];

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <PageHeader
        title="Import Leads"
        subtitle="Bulk-create leads from a CSV file"
        error={error}
        actions={
          <button
            onClick={() => router.push('/leads')}
            className="flex items-center gap-2 px-3 py-1.5 text-sm border rounded-lg border-[var(--border)] text-primary hover:opacity-70"
          >
            <ArrowLeft size={14} />
            Back to Leads
          </button>
        }
      />

      {step === 'upload' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between surface border border-[var(--border)] rounded-lg px-4 py-3">
            <p className="text-sm text-muted">
              Required columns: <span className="text-primary font-medium">firstName, lastName, leadType</span>.
              Up to 1,000 rows per file.
            </p>
            <button
              onClick={() => leadsApi.downloadImportTemplate()}
              className="flex items-center gap-2 px-3 py-1.5 text-sm border rounded-lg border-[var(--border)] text-primary hover:opacity-70 shrink-0 ml-4"
            >
              <Download size={14} />
              Download template
            </button>
          </div>

          <div
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`surface border-2 border-dashed rounded-lg py-16 flex flex-col items-center justify-center cursor-pointer transition-colors ${
              dragActive ? 'border-blue-400 bg-blue-500/5' : 'border-[var(--border)] hover:opacity-80'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />
            {validating ? (
              <LoadingSpinner message="Validating file…" />
            ) : (
              <>
                <UploadCloud size={32} className="text-muted mb-3" />
                <p className="text-primary font-medium">Drop a CSV file here, or click to browse</p>
                <p className="text-sm text-subtle mt-1">.csv files only</p>
              </>
            )}
          </div>
        </div>
      )}

      {step === 'review' && result && (
        <div className="space-y-6">
          <div className="grid grid-cols-4 gap-3">
            <SummaryCard label="Total Rows" value={result.totalRows} tone="neutral" />
            <SummaryCard label="Ready to Import" value={result.validCount} tone="good" />
            <SummaryCard label="Duplicates (skipped)" value={result.duplicateCount} tone="warn" />
            <SummaryCard label="Errors" value={result.errorCount} tone="bad" />
          </div>

          {attentionRows.length > 0 && (
            <button
              onClick={() => setShowAllRows((v) => !v)}
              className="text-sm text-primary font-medium interactive"
            >
              {showAllRows ? 'Show only rows needing attention' : `Show all ${result.totalRows} rows`}
            </button>
          )}

          {visibleRows.length > 0 ? (
            <div className="surface border border-[var(--border)] rounded-lg overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-left text-muted">
                    <th className="px-4 py-2 font-medium">Row</th>
                    <th className="px-4 py-2 font-medium">Name</th>
                    <th className="px-4 py-2 font-medium">Contact</th>
                    <th className="px-4 py-2 font-medium">Status</th>
                    <th className="px-4 py-2 font-medium">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.map((row) => (
                    <tr key={row.row} className="border-b border-[var(--border)] last:border-0">
                      <td className="px-4 py-2 text-muted">{row.row}</td>
                      <td className="px-4 py-2 text-primary">
                        {[row.firstName, row.lastName].filter(Boolean).join(' ') || '—'}
                      </td>
                      <td className="px-4 py-2 text-muted">{row.email || row.phone || '—'}</td>
                      <td className="px-4 py-2"><RowStatusBadge status={row.status} /></td>
                      <td className="px-4 py-2 text-subtle">
                        {[...row.errors, ...row.warnings].join('; ') || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="surface border border-[var(--border)] rounded-lg px-4 py-8 text-center">
              <CheckCircle2 className="mx-auto text-emerald-600 dark:text-emerald-400 mb-2" size={24} />
              <p className="text-primary font-medium">All {result.totalRows} rows look good.</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button onClick={reset} className={colors.button.secondary}>
              Start Over
            </button>
            <button
              onClick={handleCommit}
              disabled={result.validCount === 0 || committing}
              className={`${colors.button.primary} disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              {committing ? 'Importing…' : `Import ${result.validCount} Lead${result.validCount === 1 ? '' : 's'}`}
            </button>
          </div>
        </div>
      )}

      {step === 'result' && result && (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-3">
            <SummaryCard label="Leads Created" value={result.createdCount} tone="good" />
            <SummaryCard label="Duplicates Skipped" value={result.duplicateCount} tone="warn" />
            <SummaryCard label="Errors" value={result.errorCount} tone="bad" />
          </div>

          <div className="surface border border-[var(--border)] rounded-lg px-4 py-8 text-center">
            {result.errorCount === 0 ? (
              <CheckCircle2 className="mx-auto text-emerald-600 dark:text-emerald-400 mb-2" size={28} />
            ) : (
              <AlertTriangle className="mx-auto text-amber-600 dark:text-amber-400 mb-2" size={28} />
            )}
            <p className="text-primary font-medium">
              Imported {result.createdCount} lead{result.createdCount === 1 ? '' : 's'}.
            </p>
            {result.errorCount > 0 && (
              <p className="text-sm text-subtle mt-1">
                {result.errorCount} row{result.errorCount === 1 ? '' : 's'} had errors and were not imported. See details below, fix, and re-import them.
              </p>
            )}
          </div>

          {result.errorCount > 0 && (
            <div className="surface border border-[var(--border)] rounded-lg overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-left text-muted">
                    <th className="px-4 py-2 font-medium">Row</th>
                    <th className="px-4 py-2 font-medium">Name</th>
                    <th className="px-4 py-2 font-medium">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {result.rows.filter((r) => r.status === 'error').map((row) => (
                    <tr key={row.row} className="border-b border-[var(--border)] last:border-0">
                      <td className="px-4 py-2 text-muted">{row.row}</td>
                      <td className="px-4 py-2 text-primary">
                        {[row.firstName, row.lastName].filter(Boolean).join(' ') || '—'}
                      </td>
                      <td className="px-4 py-2 text-subtle">{row.errors.join('; ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button onClick={reset} className={colors.button.secondary}>
              Import Another File
            </button>
            <button onClick={() => router.push('/leads')} className={colors.button.primary}>
              Back to Leads
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
