// API Client Configuration

import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';
import { TOKEN_KEY, API_BASE_URL, API_TIMEOUT } from '@/lib/constants';

class ApiClient {
  private instance: AxiosInstance;
  private isRefreshing = false;
  private failedRequests: Array<(token: string) => void> = [];

  constructor() {
    this.instance = axios.create({
      baseURL: API_BASE_URL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = Cookies.get(TOKEN_KEY);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.instance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Handle 401 unauthorized errors
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = Cookies.get('cursor_monitor_refresh_token');
            
            if (refreshToken) {
              const response = await this.refreshAccessToken(refreshToken);
              const { access_token } = response.data;

              this.setToken(access_token);
              originalRequest.headers.Authorization = `Bearer ${access_token}`;
              
              return this.instance(originalRequest);
            } else {
              this.clearTokens();
              window.location.href = '/login';
            }
          } catch (refreshError) {
            this.clearTokens();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Set authentication token
   */
  public setToken(token: string): void {
    Cookies.set(TOKEN_KEY, token, { expires: 7 });
  }

  /**
   * Clear authentication tokens
   */
  public clearTokens(): void {
    Cookies.remove(TOKEN_KEY);
    Cookies.remove('cursor_monitor_refresh_token');
  }

  /**
   * Get current token
   */
  public getToken(): string | undefined {
    return Cookies.get(TOKEN_KEY);
  }

  /**
   * Check if user is authenticated
   */
  public isAuthenticated(): boolean {
    return !!Cookies.get(TOKEN_KEY);
  }

  /**
   * Refresh access token
   */
  private async refreshAccessToken(refreshToken: string) {
    return this.instance.post('/api/v1/auth/refresh-token', { refresh_token: refreshToken });
  }

  /**
   * Make a GET request
   */
  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.get<T>(url, config);
    return response.data;
  }

  /**
   * Make a POST request
   */
  public async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.post<T>(url, data, config);
    return response.data;
  }

  /**
   * Make a PUT request
   */
  public async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.put<T>(url, data, config);
    return response.data;
  }

  /**
   * Make a PATCH request
   */
  public async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.patch<T>(url, data, config);
    return response.data;
  }

  /**
   * Make a DELETE request
   */
  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.delete<T>(url, config);
    return response.data;
  }

  /**
   * Get the axios instance for advanced usage
   */
  public getInstance(): AxiosInstance {
    return this.instance;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export for direct axios usage if needed
export { axios };
