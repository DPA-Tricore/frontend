import axios, { AxiosInstance } from 'axios';
import { storageService } from '@/lib/services/storage';
import {
  CREDENTIAL_ENDPOINTS,
  ORG_SUSPENDED_CODE,
  SUSPENDED_ADMIN_PATH,
  SUSPENDED_USER_PATH,
} from '@/lib/constants/auth';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

class AxiosClient {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 5000, // 5 seconds timeout
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to attach token
    this.instance.interceptors.request.use(
      (config) => {
        if (typeof window !== 'undefined') {
          const token = storageService.getAccessToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.instance.interceptors.response.use(
      (response) => response,
      (error) => {
        const isCredentialCheck = CREDENTIAL_ENDPOINTS.includes(error.config?.url ?? '');
        if (error.response?.status === 401 && !isCredentialCheck) {
          // Session expired - clear token and redirect to login
          if (typeof window !== 'undefined') {
            storageService.clearAuth();
            window.location.href = '/login';
          }
        }
        if (error.response?.status === 403 && error.response.data?.code === ORG_SUSPENDED_CODE) {
          // Agency suspended for billing - the admin can pay on the billing page
          if (typeof window !== 'undefined') {
            const target =
              storageService.getUser()?.role === 'ORG_ADMIN' ? SUSPENDED_ADMIN_PATH : SUSPENDED_USER_PATH;
            if (window.location.pathname !== target) window.location.href = target;
          }
        }
        return Promise.reject(error);
      }
    );
  }

  getClient() {
    return this.instance;
  }
}

export const axiosClient = new AxiosClient().getClient();
