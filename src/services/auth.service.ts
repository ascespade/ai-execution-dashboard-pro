// Auth Service

import { apiClient } from '@/lib/api-client';
import type { 
  LoginCredentials, 
  RegisterData, 
  AuthResponse, 
  User 
} from '@/types';

class AuthService {
  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/v1/auth/login', credentials);
    if (response.access_token) {
      apiClient.setToken(response.access_token);
    }
    return response;
  }

  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/v1/auth/register', data);
    if (response.access_token) {
      apiClient.setToken(response.access_token);
    }
    return response;
  }

  /**
   * Logout the current user
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/api/v1/auth/logout');
    } finally {
      apiClient.clearTokens();
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User> {
    return apiClient.get<User>('/api/v1/users/me');
  }

  /**
   * Update current user profile
   */
  async updateProfile(data: Partial<User>): Promise<User> {
    return apiClient.put<User>('/api/v1/users/me', data);
  }

  /**
   * Request password reset
   */
  async forgotPassword(email: string): Promise<void> {
    return apiClient.post('/api/v1/auth/forgot-password', { email });
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    return apiClient.post('/api/v1/auth/reset-password', { token, new_password: newPassword });
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<void> {
    return apiClient.post(`/api/v1/auth/verify-email/${token}`);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return apiClient.isAuthenticated();
  }

  /**
   * Get current token
   */
  getToken(): string | undefined {
    return apiClient.getToken();
  }
}

export const authService = new AuthService();
