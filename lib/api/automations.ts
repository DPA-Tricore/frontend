import { axiosClient } from '@/lib/api/axios-client';
import type {
  AutomationResponseDto,
  CreateAutomationRequest,
  UpsertStepRequest,
  AutomationStepResponseDto,
} from '@/lib/types/automations';

export type { AutomationResponseDto, AutomationStepResponseDto } from '@/lib/types/automations';
export { AutomationScope, AutomationActionType } from '@/lib/types/automations';

export const automationsApi = {
  async getAutomations(): Promise<AutomationResponseDto[]> {
    const res = await axiosClient.get<AutomationResponseDto[]>('/automations');
    return res.data;
  },

  async getAutomation(id: string): Promise<AutomationResponseDto> {
    const res = await axiosClient.get<AutomationResponseDto>(`/automations/${id}`);
    return res.data;
  },

  async createAutomation(data: CreateAutomationRequest): Promise<AutomationResponseDto> {
    const res = await axiosClient.post<AutomationResponseDto>('/automations', data);
    return res.data;
  },

  async updateAutomation(id: string, data: Partial<CreateAutomationRequest>): Promise<AutomationResponseDto> {
    const res = await axiosClient.patch<AutomationResponseDto>(`/automations/${id}`, data);
    return res.data;
  },

  async deleteAutomation(id: string): Promise<void> {
    await axiosClient.delete(`/automations/${id}`);
  },

  async upsertStep(automationId: string, data: UpsertStepRequest): Promise<AutomationStepResponseDto> {
    const res = await axiosClient.post<AutomationStepResponseDto>(`/automations/${automationId}/steps`, data);
    return res.data;
  },

  async deleteStep(automationId: string, stepId: string): Promise<void> {
    await axiosClient.delete(`/automations/${automationId}/steps/${stepId}`);
  },
};
