import type { PaginationMeta } from './common';

export type ActivityEntityType = 'LEAD' | 'TASK' | 'REMINDER' | 'USER' | 'TEAM' | 'ORGANIZATION' | 'CUSTOMER' | 'POLICY';

export interface ActivityResponseDto {
  id: string;
  entityType: ActivityEntityType;
  entityId: string;
  action: string;
  message: string | null;
  metadata: Record<string, unknown> | null;
  actorId: string | null;
  createdAt: string;
}

export interface ListActivitiesParams {
  entityType: ActivityEntityType;
  entityId: string;
}

export interface AuditLogEntryDto extends ActivityResponseDto {
  actorEmail: string | null;
}

export interface PaginatedAuditLogResponse {
  data: AuditLogEntryDto[];
  meta: PaginationMeta;
}

export interface ListAuditLogParams {
  page?: number;
  limit?: number;
}
