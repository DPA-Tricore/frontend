'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { authAPI } from '@/lib/api/auth';
import { SignupRequest, LoginRequest } from '@/lib/api/types/auth-request';

export interface User {
  id: string;
  email: string;
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      // You can add logic here to validate the token with the backend
      // For now, we'll just keep them logged in if token exists
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
  }, []);

  const signup = useCallback(async (data: SignupRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authAPI.signup(data);
      setUser({
        id: response.id!,
        email: response.email!,
        createdAt: response.createdAt!,
        isActive: response.isActive!,
      });
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

      // Store token
      localStorage.setItem('accessToken', accessToken);

      // Decode JWT to get user info (simple decoding without verification)
      const decoded = JSON.parse(atob(accessToken.split('.')[1]));
      const userData: User = {
        id: decoded.sub || decoded.id,
        email: decoded.email || data.email,
        createdAt: new Date().toISOString(),
        isActive: true,
      };

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
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
      setUser(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Logout failed';
      setError(message);
    } finally {
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
