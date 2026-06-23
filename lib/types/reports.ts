export interface PipelineStage {
  status: string;
  count: number;
}

export interface PipelineReport {
  stages: PipelineStage[];
  total: number;
  convertedCount: number;
  lostCount: number;
  conversionRate: number;
}

export interface AgentMetrics {
  agentId: string;
  agentEmail: string;
  totalLeads: number;
  convertedLeads: number;
  lostLeads: number;
  activeLeads: number;
  conversionRate: number;
  tasksCompleted: number;
  tasksPending: number;
}

export interface AgentPerformanceReport {
  agents: AgentMetrics[];
}

export interface LeadTrendPoint {
  month: string;
  count: number;
}

export interface LeadTrendReport {
  trend: LeadTrendPoint[];
}

export interface TaskTypeBreakdown {
  type: string;
  completed: number;
  pending: number;
  cancelled: number;
  total: number;
}

export interface ActivityReport {
  byType: TaskTypeBreakdown[];
  totalCompleted: number;
  totalPending: number;
  totalOverdue: number;
}

export interface ReportQueryParams {
  startDate?: string;
  endDate?: string;
  agentId?: string;
  teamId?: string;
}
