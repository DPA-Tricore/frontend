'use client';

import { useState, useEffect, useCallback } from 'react';
import { automationsApi } from '@/lib/api/automations';
import type { AutomationResponseDto } from '@/lib/types/automations';
import { colors, getStatusColor } from '@/lib/theme/colors';
import PageHeader from '@/components/page-header';
import LoadingSpinner from '@/components/loading-spinner';
import EmptyState from '@/components/empty-state';
import { AnimatePresence, motion } from 'framer-motion';
import AutomationCreateModal from './components/automation-create-modal';
import AutomationTable from './components/automation-table';

const LEAD_STAGES = [
  { value: 'NEW', label: 'New' },
  { value: 'CONTACTED', label: 'Contacted' },
  { value: 'QUALIFIED', label: 'Qualified' },
  { value: 'IN_NEGOTIATION', label: 'In Negotiation' },
  { value: 'CONVERTED', label: 'Converted' },
  { value: 'LOST', label: 'Lost' },
  { value: 'UNRESPONSIVE', label: 'Unresponsive' },
];

export default function AutomationsPage() {
  const [automations, setAutomations] = useState<AutomationResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedStage, setSelectedStage] = useState<string | null>(null);

  const fetchAutomations = useCallback(async () => {
    try {
      setLoading(true);
      setAutomations(await automationsApi.getAutomations());
      setError(null);
    } catch {
      setError('Failed to fetch automations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAutomations(); }, [fetchAutomations]);

  const handleToggleActive = async (automation: AutomationResponseDto) => {
    try {
      await automationsApi.updateAutomation(automation.id, { isActive: !automation.isActive });
      setAutomations((prev) =>
        prev.map((a) => (a.id === automation.id ? { ...a, isActive: !a.isActive } : a)),
      );
    } catch {
      setError('Failed to update automation');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this automation? This will also cancel all active enrollments.')) return;
    setDeletingId(id);
    try {
      await automationsApi.deleteAutomation(id);
      setAutomations((prev) => prev.filter((a) => a.id !== id));
    } catch {
      setError('Failed to delete automation');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredAutomations = selectedStage
    ? automations.filter((a) => a.stage === selectedStage)
    : automations;

  const stageCounts = LEAD_STAGES.reduce(
    (acc, stage) => ({
      ...acc,
      [stage.value]: automations.filter((a) => a.stage === stage.value).length,
    }),
    {} as Record<string, number>,
  );

  return (
    <div className="flex min-h-screen">
      {/* Left Sidebar */}
      <div className="w-56 border-r border-[var(--border)] bg-[var(--bg)] p-6 sticky top-0 h-screen overflow-y-auto">
        <h2 className="text-sm font-semibold text-primary uppercase tracking-wider mb-6">Pipeline Stages</h2>

        {/* All button */}
        <button
          onClick={() => setSelectedStage(null)}
          className={`w-full text-left px-4 py-2.5 rounded-lg mb-1 transition-colors font-medium text-sm ${
            selectedStage === null
              ? 'bg-blue-600 text-white'
              : 'text-muted hover:text-primary hover:bg-[var(--hover-bg)]'
          }`}
        >
          <div className="flex justify-between items-center">
            <span>All Stages</span>
            <span className="text-xs opacity-70">{automations.length}</span>
          </div>
        </button>

        {/* Stage buttons */}
        <div className="space-y-1">
          {LEAD_STAGES.map((stage) => {
            const count = stageCounts[stage.value];
            const isActive = selectedStage === stage.value;

            return (
              <button
                key={stage.value}
                onClick={() => setSelectedStage(stage.value)}
                className={`w-full text-left px-4 py-2.5 rounded-lg transition-colors font-medium text-sm ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-muted hover:text-primary hover:bg-[var(--hover-bg)]'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span>{stage.label}</span>
                  <span className={`text-xs ${isActive ? 'opacity-90' : 'opacity-60'}`}>{count}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Stats */}
        <div className="mt-8 pt-6 border-t border-[var(--border)] text-xs text-subtle space-y-2">
          <div className="flex justify-between">
            <span>Total Automations</span>
            <span className="font-semibold text-primary">{automations.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Active</span>
            <span className="font-semibold text-green-600">{automations.filter((a) => a.isActive).length}</span>
          </div>
          <div className="flex justify-between">
            <span>Inactive</span>
            <span className="font-semibold text-gray-500">{automations.filter((a) => !a.isActive).length}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <PageHeader
          title="Automations"
          subtitle={selectedStage
            ? `Manage automations for ${LEAD_STAGES.find(s => s.value === selectedStage)?.label}`
            : 'Manage lifecycle automation sequences for your leads'
          }
          error={error}
          actions={
            <button onClick={() => setShowModal(true)} className={colors.button.primary}>
              + New Automation
            </button>
          }
        />

        {loading ? (
          <LoadingSpinner message="Loading automations..." />
        ) : filteredAutomations.length === 0 ? (
          <EmptyState
            message={selectedStage
              ? `No automations for ${LEAD_STAGES.find(s => s.value === selectedStage)?.label} stage yet.`
              : 'No automations yet. Create your first sequence to get started!'
            }
          />
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedStage}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15, ease: 'easeInOut' }}
            >
              <AutomationTable
                automations={filteredAutomations}
                deletingId={deletingId}
                onToggleActive={handleToggleActive}
                onDelete={handleDelete}
              />
            </motion.div>
          </AnimatePresence>
        )}

        <AutomationCreateModal isOpen={showModal} onClose={() => setShowModal(false)} />
      </div>
    </div>
  );
}
