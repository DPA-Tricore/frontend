import { axiosClient } from './axios-client';
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
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || 'Signup failed';
      throw new Error(message);
    }
  }

  async login(data: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await axiosClient.post<LoginResponse>(
        '/auth/login',
        data
      );
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || 'Login failed';
      throw new Error(message);
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
