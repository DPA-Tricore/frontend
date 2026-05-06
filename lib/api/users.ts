import { axiosClient } from '@/lib/api/axios-client';

export interface UserResponseDto {
  id: string;
  email: string;
  isActive: boolean;
  createdAt: Date;
}

export const usersApi = {
  /**
   * Get all active users
   */
  async getUsers(): Promise<UserResponseDto[]> {
    const response = await axiosClient.get<UserResponseDto[]>('/users');
    return response.data;
  },

  /**
   * Get a single user by ID
   */
  async getUser(id: string): Promise<UserResponseDto> {
    const response = await axiosClient.get<UserResponseDto>(`/users/${id}`);
    return response.data;
  },
};
