import { BillingInterval } from '@/lib/types/customers';

export const BILLING_INTERVAL_OPTIONS: { value: BillingInterval; label: string }[] = [
  { value: BillingInterval.MONTH, label: 'Monthly' },
  { value: BillingInterval.QUARTER, label: 'Quarterly' },
  { value: BillingInterval.YEAR, label: 'Yearly' },
];

// Short suffix shown after a price, e.g. "$120.00 / mo".
export const BILLING_INTERVAL_SUFFIX: Record<BillingInterval, string> = {
  [BillingInterval.MONTH]: 'mo',
  [BillingInterval.QUARTER]: 'qtr',
  [BillingInterval.YEAR]: 'yr',
};

export const PRODUCT_MANAGER_ROLES = ['ORG_ADMIN', 'MANAGER'];

export const PRODUCT_FORM_DEFAULTS = {
  name: '',
  productType: '',
  description: '',
  premium: '',
  billingInterval: BillingInterval.MONTH as string,
  isActive: true,
};

// Picker value for "no catalog product" — the agent types the details in.
export const NO_PRODUCT = '';
