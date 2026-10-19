'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { colors } from '@/lib/theme/colors';
import { EMAIL_TEMPLATE_MANAGER_ROLES } from '@/lib/constants/emails';
import { useEmailTemplates } from '@/lib/hooks/use-email-templates';
import type { EmailTemplateResponseDto } from '@/lib/types/emails';
import type { UserRole } from '@/lib/types/users';
import LoadingSpinner from '@/components/loading-spinner';
import EmptyState from '@/components/empty-state';
import PageHeader from '@/components/page-header';
import EmailTemplateList from './components/email-template-list';
import EmailTemplateFormModal from './components/email-template-form-modal';

export default function EmailTemplatesPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const canManage = !!user?.role && EMAIL_TEMPLATE_MANAGER_ROLES.includes(user.role as UserRole);

  const [showInactive, setShowInactive] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selected, setSelected] = useState<EmailTemplateResponseDto | null>(null);

  const { data: templates = [], isLoading, isError } = useEmailTemplates(showInactive, { enabled: canManage });

  useEffect(() => {
    if (!isAuthLoading && !canManage) router.replace('/dashboard');
  }, [isAuthLoading, canManage, router]);

  if (isAuthLoading || !canManage) return <LoadingSpinner fullPage />;

  const openForm = (template: EmailTemplateResponseDto | null) => {
    setSelected(template);
    setIsFormOpen(true);
  };

  return (
    <div className="p-8">
      <PageHeader
        title="Email Templates"
        error={isError ? 'Failed to fetch templates' : null}
        actions={
          <button onClick={() => openForm(null)} className={colors.button.primary}>
            + New Template
          </button>
        }
      />

      <label className="mb-4 inline-flex items-center gap-2 text-sm text-muted cursor-pointer select-none">
        <input
          type="checkbox"
          checked={showInactive}
          onChange={(e) => setShowInactive(e.target.checked)}
          className="rounded border-[var(--border)]"
        />
        Show inactive
      </label>

      {isLoading ? (
        <LoadingSpinner message="Loading templates..." />
      ) : templates.length === 0 ? (
        <EmptyState message="No templates yet. Write the emails your team sends most, once." />
      ) : (
        <EmailTemplateList templates={templates} onSelect={openForm} />
      )}

      <EmailTemplateFormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} template={selected} />
    </div>
  );
}
