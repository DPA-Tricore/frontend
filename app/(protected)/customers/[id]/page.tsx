'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCustomer } from '@/lib/hooks/use-customer-detail';
import LoadingSpinner from '@/components/loading-spinner';
import CustomerTopBar from './components/customer-top-bar';
import CustomerHero from './components/customer-hero';
import CustomerPropertiesPanel from './components/customer-properties-panel';
import CustomerActivityTab from './components/customer-activity-tab';
import CustomerPoliciesTab from './components/customer-policies-tab';
import CustomerLeadsTab from './components/customer-leads-tab';
import EntityInvoicesTab from '@/components/invoices/entity-invoices-tab';

type Tab = 'activity' | 'policies' | 'invoices' | 'leads';

const TABS: { id: Tab; label: string }[] = [
  { id: 'activity', label: 'Activity' },
  { id: 'policies', label: 'Policies' },
  { id: 'invoices', label: 'Invoices' },
  { id: 'leads', label: 'Leads' },
];

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<Tab>('activity');
  const { data: customer, isLoading, isError } = useCustomer(id);

  useEffect(() => {
    if (isError) router.push('/customers');
  }, [isError, router]);

  if (isLoading) return <LoadingSpinner message="Loading customer..." />;
  if (!customer) return null;

  return (
    <div className="min-h-screen">
      <CustomerTopBar onBack={() => router.back()} />

      <div className="px-8 py-10 max-w-6xl mx-auto">
        <CustomerHero customer={customer} />

        <div className="border-b border-[var(--border)] my-8" />

        <div className="grid grid-cols-3 gap-10 items-start">
          <div className="col-span-2 min-w-0">
            {/* Tab bar */}
            <div className="border-b border-[var(--border)] mb-6">
              <nav className="flex gap-6">
                {TABS.map(({ id: tabId, label }) => (
                  <button
                    key={tabId}
                    onClick={() => setActiveTab(tabId)}
                    className={`pb-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                      activeTab === tabId
                        ? 'border-gray-900 text-primary dark:border-white'
                        : 'border-transparent text-subtle hover:text-primary'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab content */}
            {activeTab === 'activity' && <CustomerActivityTab customerId={id} />}
            {activeTab === 'policies' && <CustomerPoliciesTab customerId={id} />}
            {activeTab === 'invoices' && (
              <EntityInvoicesTab
                billTo={{ type: 'customer', id, name: `${customer.firstName} ${customer.lastName}` }}
              />
            )}
            {activeTab === 'leads' && <CustomerLeadsTab customerId={id} />}
          </div>

          <CustomerPropertiesPanel customer={customer} />
        </div>
      </div>
    </div>
  );
}
