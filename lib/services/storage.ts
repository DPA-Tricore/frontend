/**
 * LocalStorage Service
 * Handles all localStorage operations with type safety and SSR compatibility
 */

export interface StorageUser {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  isActive: boolean;
}

class StorageService {
  private readonly TOKEN_KEY = 'accessToken';
  private readonly USER_KEY = 'user';
  private readonly REFRESH_TOKEN_KEY = 'refreshToken';
  private readonly THEME_KEY = 'theme';

  /**
   * Check if running in browser environment
   */
  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  /**
   * Get access token from localStorage
   */
  getAccessToken(): string | null {
    if (!this.isBrowser()) return null;
    try {
      return localStorage.getItem(this.TOKEN_KEY);
    } catch (error) {
      console.error('Error reading access token from localStorage:', error);
      return null;
    }
  }

  /**
   * Set access token in localStorage
   */
  setAccessToken(token: string): void {
    if (!this.isBrowser()) return;
    try {
      localStorage.setItem(this.TOKEN_KEY, token);
    } catch (error) {
      console.error('Error writing access token to localStorage:', error);
    }
  }

  /**
   * Get refresh token from localStorage
   */
  getRefreshToken(): string | null {
    if (!this.isBrowser()) return null;
    try {
      return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Error reading refresh token from localStorage:', error);
      return null;
    }
  }

  /**
   * Set refresh token in localStorage
   */
  setRefreshToken(token: string): void {
    if (!this.isBrowser()) return;
    try {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
    } catch (error) {
      console.error('Error writing refresh token to localStorage:', error);
    }
  }

  /**
   * Get user from localStorage
   */
  getUser(): StorageUser | null {
    if (!this.isBrowser()) return null;
    try {
      const user = localStorage.getItem(this.USER_KEY);
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error reading user from localStorage:', error);
      return null;
    }
  }

  /**
   * Set user in localStorage
   */
  setUser(user: StorageUser): void {
    if (!this.isBrowser()) return;
    try {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error writing user to localStorage:', error);
    }
  }

  /**
   * Clear all auth-related data from localStorage
   */
  clearAuth(): void {
    if (!this.isBrowser()) return;
    try {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    } catch (error) {
      console.error('Error clearing auth from localStorage:', error);
    }
  }

  /**
   * Check if user is authenticated (has access token)
   */
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  /**
   * Get theme preference from localStorage
   */
  getTheme(): 'light' | 'dark' | null {
    if (!this.isBrowser()) return null;
    try {
      const theme = localStorage.getItem(this.THEME_KEY);
      return (theme as 'light' | 'dark') || null;
    } catch (error) {
      console.error('Error reading theme from localStorage:', error);
      return null;
    }
  }

  /**
   * Set theme preference in localStorage
   */
  setTheme(theme: 'light' | 'dark'): void {
    if (!this.isBrowser()) return;
    try {
      localStorage.setItem(this.THEME_KEY, theme);
    } catch (error) {
      console.error('Error writing theme to localStorage:', error);
    }
  }
}

// Export singleton instance
export const storageService = new StorageService();
