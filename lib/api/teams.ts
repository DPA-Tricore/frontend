import { axiosClient } from '@/lib/api/axios-client';
import type { TeamResponseDto, CreateTeamRequest, UpdateTeamRequest } from '@/lib/types/teams';

export type { TeamResponseDto, CreateTeamRequest, UpdateTeamRequest } from '@/lib/types/teams';

export const teamsApi = {
  async getTeams(): Promise<TeamResponseDto[]> {
    const response = await axiosClient.get<TeamResponseDto[]>('/teams');
    return response.data;
  },

  async createTeam(data: CreateTeamRequest): Promise<TeamResponseDto> {
    const response = await axiosClient.post<TeamResponseDto>('/teams', data);
    return response.data;
  },

  async updateTeam(id: string, data: UpdateTeamRequest): Promise<TeamResponseDto> {
    const response = await axiosClient.patch<TeamResponseDto>(`/teams/${id}`, data);
    return response.data;
  },

  async deleteTeam(id: string): Promise<void> {
    await axiosClient.delete(`/teams/${id}`);
  },
};
