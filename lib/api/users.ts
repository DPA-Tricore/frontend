import { axiosClient } from '@/lib/api/axios-client';
import type { OrgUserResponseDto, UpdateOrgUserRequest } from '@/lib/types/users';

export type { OrgUserResponseDto as UserResponseDto, UpdateOrgUserRequest } from '@/lib/types/users';
export type { UserRole, AssignableRole } from '@/lib/types/users';

export const usersApi = {
  /**
   * Get all users in the current org
   */
  async getUsers(): Promise<OrgUserResponseDto[]> {
    const response = await axiosClient.get<OrgUserResponseDto[]>('/users');
    return response.data;
  },

  /**
   * Get a single user by ID
   */
  async getUser(id: string): Promise<OrgUserResponseDto> {
    const response = await axiosClient.get<OrgUserResponseDto>(`/users/${id}`);
    return response.data;
  },

  /**
   * Update a user's role, team, or active status (Org Admin only)
   */
  async updateUser(id: string, data: UpdateOrgUserRequest): Promise<OrgUserResponseDto> {
    const response = await axiosClient.patch<OrgUserResponseDto>(`/users/${id}`, data);
    return response.data;
  },
};
