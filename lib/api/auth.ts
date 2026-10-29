import { axiosClient } from './axios-client';
import { apiErrorMessage } from '@/lib/utils/api-error';
import { SignupRequest, LoginRequest } from './types/auth-request';
import { SignupResponse, LoginResponse } from './types/auth-response';

class AuthAPI {
  async signup(data: SignupRequest): Promise<SignupResponse> {
    try {
      const response = await axiosClient.post<SignupResponse>(
        '/auth/signup',
        data
      );
      return response.data;
    } catch (error) {
      throw new Error(apiErrorMessage(error, error instanceof Error ? error.message : 'Signup failed'));
    }
  }

  async login(data: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await axiosClient.post<LoginResponse>(
        '/auth/login',
        data
      );
      return response.data;
    } catch (error) {
      throw new Error(apiErrorMessage(error, error instanceof Error ? error.message : 'Login failed'));
    }
  }

  async logout(): Promise<void> {
    // Clear token from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
    }
  }
}

export const authAPI = new AuthAPI();
