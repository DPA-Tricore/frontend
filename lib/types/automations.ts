export enum AutomationScope {
  GLOBAL = 'GLOBAL',
  USER = 'USER',
}

export enum AutomationActionType {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  CALL_TASK = 'CALL_TASK',
  TODO = 'TODO',
  REMINDER = 'REMINDER',
  TAG = 'TAG',
}

export enum EnrollmentStatus {
  ACTIVE = 'ACTIVE',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export enum ScheduledActionStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  SKIPPED = 'SKIPPED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export interface AutomationStepResponseDto {
  id: string;
  automationId: string;
  dayOffset: number;
  actionType: AutomationActionType;
  actionConfig: Record<string, any>;
  condition: Record<string, any> | null;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface AutomationResponseDto {
  id: string;
  name: string;
  stage: string;
  scope: AutomationScope;
  ownerId: string | null;
  isActive: boolean;
  shotClockDays: number | null;
  createdAt: string;
  updatedAt: string;
  steps?: AutomationStepResponseDto[];
}

export interface CreateAutomationRequest {
  name: string;
  stage: string;
  scope?: AutomationScope;
  isActive?: boolean;
  shotClockDays?: number;
}

export interface UpsertStepRequest {
  id?: string;
  dayOffset: number;
  actionType: AutomationActionType;
  actionConfig: Record<string, any>;
  condition?: Record<string, any>;
  order: number;
}
