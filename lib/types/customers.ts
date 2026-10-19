import { PaginationMeta } from './common';
import { ContactResponseDto } from './leads';

export enum CustomerStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  CHURNED = 'CHURNED',
}

export interface CustomerResponseDto {
  id: string;
  firstName: string;
  lastName: string;
  status: CustomerStatus;
  organizationId: string;
  teamId?: string;
  ownerId?: string;
  createdAt: string;
  updatedAt: string;
  contacts?: ContactResponseDto[];
}

export interface PaginatedCustomerResponse {
  data: CustomerResponseDto[];
  meta: PaginationMeta;
}

export interface ListCustomersParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'firstName' | 'lastName' | 'createdAt' | 'status';
  sortOrder?: 'asc' | 'desc';
  status?: string;
}

export interface CreateCustomerRequest {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  status?: CustomerStatus;
  teamId?: string;
  ownerId?: string;
}

export enum PolicyStatus {
  ACTIVE = 'ACTIVE',
  LAPSED = 'LAPSED',
  CANCELLED = 'CANCELLED',
  RENEWED = 'RENEWED',
}

export enum BillingInterval {
  MONTH = 'MONTH',
  QUARTER = 'QUARTER',
  YEAR = 'YEAR',
}

export interface PolicyResponseDto {
  id: string;
  customerId: string;
  leadId?: string;
  organizationId: string;
  policyNumber: string;
  productId?: string;
  // The linked product's current name, for display.
  productName?: string;
  productType?: string;
  premiumAmountCents: number;
  billingInterval: BillingInterval;
  effectiveDate: string;
  expirationDate: string;
  status: PolicyStatus;
  renewalLeadId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePolicyRequest {
  policyNumber: string;
  productId?: string;
  productType?: string;
  premiumAmountCents: number;
  billingInterval?: BillingInterval;
  effectiveDate: string;
  expirationDate: string;
  status?: PolicyStatus;
  leadId?: string;
}

// Two-phase conversion: first call (no customerId/forceNew) either converts outright or comes
// back POTENTIAL_MATCH_FOUND for the agent to confirm. See leadsApi.convertLead.
export enum ConvertLeadStatus {
  CONVERTED = 'CONVERTED',
  POTENTIAL_MATCH_FOUND = 'POTENTIAL_MATCH_FOUND',
}

export interface PotentialCustomerMatchDto {
  customer: CustomerResponseDto;
  matchedOn: { type: string; value: string }[];
}

export interface ConvertLeadResponseDto {
  status: ConvertLeadStatus;
  customer?: CustomerResponseDto;
  potentialMatches?: PotentialCustomerMatchDto[];
}

export interface ConvertLeadRequest {
  customerId?: string;
  forceNew?: boolean;
}
