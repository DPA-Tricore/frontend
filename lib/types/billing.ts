import type { PaginationMeta } from './common';

export type BillingInterval = 'MONTH' | 'QUARTER' | 'YEAR';
export type BillingScheduleStatus = 'PENDING_PAYMENT_METHOD' | 'ACTIVE' | 'SUSPENDED' | 'SUPERSEDED';
export type InvoiceStatus = 'PENDING' | 'PAID' | 'FAILED' | 'OVERDUE';

export interface PlanDto {
  id: string;
  name: string;
  amountCents: number;
  includedUsers: number | null;
  extraUserAmountCents: number | null;
  currency: string;
  interval: BillingInterval;
  isActive: boolean;
}

export interface BillingScheduleResponseDto {
  id: string;
  organizationId: string;
  planId: string | null;
  customAmountCents: number | null;
  discountPercent: number | null;
  freeUntil: string | null;
  interval: BillingInterval;
  nextBillingDate: string;
  status: BillingScheduleStatus;
  stripeCustomerId: string | null;
  effectiveAmountCents: number;
  activeUserCount: number;
  plan: PlanDto | null;
}

export interface InvoiceResponseDto {
  id: string;
  organizationId: string;
  billingScheduleId: string;
  amountCents: number;
  currency: string;
  status: InvoiceStatus;
  dueDate: string;
  paidAt: string | null;
  stripeInvoiceId: string | null;
  failureReason: string | null;
}

export interface PaginatedInvoiceResponse {
  data: InvoiceResponseDto[];
  meta: PaginationMeta;
}

export interface ListInvoicesParams {
  page?: number;
  limit?: number;
}

export interface SetupPaymentMethodResponse {
  url: string;
}
