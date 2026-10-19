'use client';

import type { EmailTemplateResponseDto } from '@/lib/types/emails';
import { formatDate } from '@/lib/utils/date';

interface EmailTemplateListProps {
  templates: EmailTemplateResponseDto[];
  onSelect: (template: EmailTemplateResponseDto) => void;
}

export default function EmailTemplateList({ templates, onSelect }: EmailTemplateListProps) {
  return (
    <div className="overflow-x-auto surface rounded-lg border border-[var(--border)]">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[var(--border)] [background:var(--bg)]">
            <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Name</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Subject</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Updated</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Status</th>
          </tr>
        </thead>
        <tbody>
          {templates.map((t) => (
            <tr
              key={t.id}
              onClick={() => onSelect(t)}
              className={`border-b border-[var(--border)] last:border-b-0 hover:[background:var(--bg)] cursor-pointer ${
                t.isActive ? '' : 'opacity-60'
              }`}
            >
              <td className="px-6 py-4 text-sm font-medium text-primary">{t.name}</td>
              <td className="px-6 py-4 text-sm text-muted truncate max-w-md">{t.subject}</td>
              <td className="px-6 py-4 text-sm text-muted whitespace-nowrap">{formatDate(t.updatedAt)}</td>
              <td className="px-6 py-4">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    t.isActive ? 'bg-green-500/15 text-green-600' : 'bg-gray-500/15 text-[var(--muted)]'
                  }`}
                >
                  {t.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
