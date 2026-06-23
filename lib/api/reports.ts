import { axiosClient } from '@/lib/api/axios-client';
import type {
  PipelineReport,
  AgentPerformanceReport,
  LeadTrendReport,
  ActivityReport,
  ReportQueryParams,
} from '@/lib/types/reports';

function buildParams(query?: ReportQueryParams): string {
  if (!query) return '';
  const p = new URLSearchParams();
  if (query.startDate) p.append('startDate', query.startDate);
  if (query.endDate) p.append('endDate', query.endDate);
  if (query.agentId) p.append('agentId', query.agentId);
  if (query.teamId) p.append('teamId', query.teamId);
  const str = p.toString();
  return str ? `?${str}` : '';
}

export const reportsApi = {
  async getPipeline(query?: ReportQueryParams): Promise<PipelineReport> {
    const res = await axiosClient.get<PipelineReport>(`/reports/pipeline${buildParams(query)}`);
    return res.data;
  },

  async getAgentPerformance(query?: ReportQueryParams): Promise<AgentPerformanceReport> {
    const res = await axiosClient.get<AgentPerformanceReport>(`/reports/agent-performance${buildParams(query)}`);
    return res.data;
  },

  async getLeadTrend(query?: ReportQueryParams): Promise<LeadTrendReport> {
    const res = await axiosClient.get<LeadTrendReport>(`/reports/lead-trend${buildParams(query)}`);
    return res.data;
  },

  async getActivity(query?: ReportQueryParams): Promise<ActivityReport> {
    const res = await axiosClient.get<ActivityReport>(`/reports/activity${buildParams(query)}`);
    return res.data;
  },
};
