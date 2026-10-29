'use client';

import { useEffect, useRef, useState } from 'react';
import SlideModal from '@/components/slide-modal';
import { colors } from '@/lib/theme/colors';
import { useConvertLead } from '@/lib/hooks/use-leads';
import { useResetOnOpen } from '@/lib/hooks/use-reset-on-open';
import type { PotentialCustomerMatchDto } from '@/lib/api/leads';

interface ConvertLeadModalProps {
  leadId: string;
  isOpen: boolean;
  onClose: () => void;
  onConverted: (customerId: string) => void;
}

/**
 * Two-phase flow driven by POST /leads/:id/convert: first call checks for a contact-info
 * match against existing customers. No match converts immediately. A match comes back
 * unconverted for the agent to confirm — re-calling with customerId links it, forceNew
 * creates a new customer anyway. See lead.service.ts#convert for the server-side logic.
 */
export default function ConvertLeadModal({ leadId, isOpen, onClose, onConverted }: ConvertLeadModalProps) {
  const convertLead = useConvertLead();
  const [matches, setMatches] = useState<PotentialCustomerMatchDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const firedRef = useRef(false);

  // State only changes once the request settles, so the effect below can start it.
  const convert = async (data?: { customerId?: string; forceNew?: boolean }) => {
    try {
      const result = await convertLead.mutateAsync({ id: leadId, data });
      if (result.status === 'CONVERTED' && result.customer) {
        onConverted(result.customer.id);
      } else if (result.status === 'POTENTIAL_MATCH_FOUND') {
        setMatches(result.potentialMatches ?? []);
      }
    } catch {
      setError('Failed to convert lead');
    }
  };

  const runConvert = (data: { customerId?: string; forceNew?: boolean }) => {
    setError(null);
    convert(data);
  };

  useResetOnOpen(isOpen, () => {
    setMatches(null);
    setError(null);
  });

  // Opening the modal is what starts the conversion. The ref stops a second
  // request when an effect re-runs (e.g. Strict Mode) while it stays open.
  useEffect(() => {
    if (!isOpen) {
      firedRef.current = false;
      return;
    }
    if (firedRef.current) return;
    firedRef.current = true;
    convert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return (
    <SlideModal isOpen={isOpen} onClose={onClose} title="Convert to Customer">
      <div className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
        )}

        {!matches && convertLead.isPending && (
          <p className="text-sm text-subtle">Checking for an existing customer...</p>
        )}

        {matches && matches.length > 0 && (
          <div className="space-y-4">
            <p className="text-sm text-muted">
              This lead&apos;s contact info matches {matches.length === 1 ? 'an existing customer' : 'existing customers'} already
              in the system. Confirm before creating a new one.
            </p>
            {matches.map((m) => (
              <div key={m.customer.id} className="surface border border-[var(--border)] rounded-xl p-4">
                <p className="text-sm font-semibold text-primary">
                  {m.customer.firstName} {m.customer.lastName}
                </p>
                <p className="text-xs text-subtle mt-1">
                  Matched on {m.matchedOn.map((mo) => `${mo.type.toLowerCase()}: ${mo.value}`).join(', ')}
                </p>
                <button
                  onClick={() => runConvert({ customerId: m.customer.id })}
                  disabled={convertLead.isPending}
                  className={`${colors.button.primary} w-full mt-3`}
                >
                  Link to this customer
                </button>
              </div>
            ))}
            <button
              onClick={() => runConvert({ forceNew: true })}
              disabled={convertLead.isPending}
              className={`${colors.button.secondary} w-full`}
            >
              No, this is a different person — create new
            </button>
          </div>
        )}
      </div>
    </SlideModal>
  );
}
