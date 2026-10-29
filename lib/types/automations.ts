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

/** Text fields per action type (templateId, subject, body, title, message, tagName); the worker reads them as strings. */
export type AutomationActionConfig = Record<string, string>;

export interface AutomationStepResponseDto {
  id: string;
  automationId: string;
  dayOffset: number;
  actionType: AutomationActionType;
  actionConfig: AutomationActionConfig;
  condition: Record<string, unknown> | null;
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
  actionConfig: AutomationActionConfig;
  condition?: Record<string, unknown>;
  order: number;
}
