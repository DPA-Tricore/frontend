'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { authAPI } from '@/lib/api/auth';
import { SignupRequest, LoginRequest } from '@/lib/api/types/auth-request';
import { storageService } from '@/lib/services/storage';
import { decodeJwt, isJwtExpired } from '@/lib/utils/jwt';

export interface User {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  isActive: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  signup: (data: SignupRequest) => Promise<void>;
  login: (data: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Restore user session from localStorage on mount
  useEffect(() => {
    const restoreSession = () => {
      try {
        const storedUser = storageService.getUser();
        const token = storageService.getAccessToken();

        // Only restore a session the server will still accept. An expired token
        // would render the app for a moment, then bounce to login on the first 401.
        if (storedUser && token && !isJwtExpired(token)) {
          setUser(storedUser);
        } else {
          storageService.clearAuth();
        }
      } catch (err) {
        console.error('Failed to restore session:', err);
        // Clear corrupted data
        storageService.clearAuth();
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const signup = useCallback(async (data: SignupRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authAPI.signup(data);
      const userData: User = {
        id: response.id!,
        email: response.email!,
        role: 'AGENT',
        createdAt: response.createdAt!,
        isActive: response.isActive!,
      };
      setUser(userData);
      storageService.setUser(userData);
      // Note: Signup doesn't return a token, user needs to login
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (data: LoginRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authAPI.login(data);
      const accessToken = response.accessToken;
      const refreshToken = response.refreshToken;

      // Store tokens in localStorage
      storageService.setAccessToken(accessToken);
      if (refreshToken) {
        storageService.setRefreshToken(refreshToken);
      }

      // Decode JWT to get user info (simple decoding without verification)
      const decoded = decodeJwt(accessToken);
      if (!decoded?.sub) throw new Error('Invalid access token');
      const userData: User = {
        id: decoded.sub,
        email: decoded.email || data.email,
        role: decoded.role ?? 'AGENT',
        createdAt: new Date().toISOString(),
        isActive: true,
      };

      setUser(userData);
      storageService.setUser(userData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await authAPI.logout();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Logout failed';
      setError(message);
    } finally {
      // Clear user state and storage regardless of logout API result
      setUser(null);
      storageService.clearAuth();
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    signup,
    login,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
