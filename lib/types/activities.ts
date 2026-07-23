export type ActivityEntityType = 'LEAD' | 'TASK' | 'REMINDER';

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
