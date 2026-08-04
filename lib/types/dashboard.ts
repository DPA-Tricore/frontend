import type { LeadResponseDto } from './leads';
import type { TaskResponseDto } from './tasks';

export interface DashboardSummaryDto {
  totalLeads: number;
  revenueThisMonth: number;
  recentLeads: LeadResponseDto[];
  dueTodayCount: number;
  dueTasks: TaskResponseDto[];
}
