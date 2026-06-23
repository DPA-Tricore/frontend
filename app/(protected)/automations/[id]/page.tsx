'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { automationsApi } from '@/lib/api/automations';
import type { AutomationResponseDto, AutomationStepResponseDto } from '@/lib/types/automations';
import { getStatusColor, getScopeColor } from '@/lib/theme/colors';
import { colors } from '@/lib/theme/colors';
import LoadingSpinner from '@/components/loading-spinner';
import StepTimeline from './components/step-timeline';
import StepFormModal from './components/step-form-modal';

export default function AutomationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [automation, setAutomation] = useState<AutomationResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showStepModal, setShowStepModal] = useState(false);
  const [editingStep, setEditingStep] = useState<AutomationStepResponseDto | null>(null);
  const [deletingStepId, setDeletingStepId] = useState<string | null>(null);

  const fetchAutomation = useCallback(async () => {
    try {
      setLoading(true);
      setAutomation(await automationsApi.getAutomation(id));
      setError(null);
    } catch {
      setError('Failed to load automation');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchAutomation(); }, [fetchAutomation]);

  const handleDeleteStep = async (stepId: string) => {
    if (!confirm('Remove this step?')) return;
    setDeletingStepId(stepId);
    try {
      await automationsApi.deleteStep(id, stepId);
      setAutomation((prev) =>
        prev ? { ...prev, steps: prev.steps?.filter((s) => s.id !== stepId) } : prev,
      );
    } catch {
      setError('Failed to delete step');
    } finally {
      setDeletingStepId(null);
    }
  };

  if (loading) return <div className="p-8"><LoadingSpinner message="Loading automation..." /></div>;
  if (!automation) return <div className="p-8 text-muted">Automation not found.</div>;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <button
          onClick={() => router.push('/automations')}
          className="text-sm text-muted hover:text-primary transition-colors"
        >
          ← Automations
        </button>
      </div>

      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary">{automation.name}</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(automation.stage)}`}>
              {automation.stage.replace('_', ' ')}
            </span>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getScopeColor(automation.scope)}`}>
              {automation.scope}
            </span>
            {automation.shotClockDays && (
              <span className="text-xs text-subtle">Shot clock: {automation.shotClockDays} days</span>
            )}
          </div>
        </div>
        <button
          onClick={() => { setEditingStep(null); setShowStepModal(true); }}
          className={colors.button.primary}
        >
          + Add Step
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
      )}

      {/* Timeline */}
      <StepTimeline
        steps={automation.steps ?? []}
        deletingStepId={deletingStepId}
        onEdit={(s) => { setEditingStep(s); setShowStepModal(true); }}
        onDelete={handleDeleteStep}
      />

      <StepFormModal
        isOpen={showStepModal}
        onClose={() => { setShowStepModal(false); setEditingStep(null); }}
        automationId={id}
        existingStep={editingStep}
        nextOrder={(automation.steps?.length ?? 0) + 1}
        onSaved={fetchAutomation}
      />
    </div>
  );
}
