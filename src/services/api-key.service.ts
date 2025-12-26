// API Key Service

import { apiClient } from '@/lib/api-client';
import type { APIKey, CreateAPIKeyData, PaginatedResponse } from '@/types';

class APIKeyService {
  /**
   * Get list of API keys
   */
  async getAPIKeys(params?: {
    page?: number;
    page_size?: number;
    provider?: string;
  }): Promise<PaginatedResponse<APIKey>> {
    return apiClient.get<PaginatedResponse<APIKey>>('/api/v1/api-keys', {
      params,
    });
  }

  /**
   * Get single API key by ID
   */
  async getAPIKey(id: string): Promise<APIKey> {
    return apiClient.get<APIKey>(`/api/v1/api-keys/${id}`);
  }

  /**
   * Create a new API key
   */
  async createAPIKey(data: CreateAPIKeyData): Promise<APIKey> {
    return apiClient.post<APIKey>('/api/v1/api-keys', data);
  }

  /**
   * Update an API key
   */
  async updateAPIKey(id: string, data: Partial<CreateAPIKeyData>): Promise<APIKey> {
    return apiClient.put<APIKey>(`/api/v1/api-keys/${id}`, data);
  }

  /**
   * Delete an API key
   */
  async deleteAPIKey(id: string): Promise<void> {
    return apiClient.delete(`/api/v1/api-keys/${id}`);
  }

  /**
   * Test an API key
   */
  async testAPIKey(id: string): Promise<{ success: boolean; message: string }> {
    return apiClient.post(`/api/v1/api-keys/${id}/test`);
  }

  /**
   * Test all API keys
   */
  async testAllAPIKeys(): Promise<{ results: Record<string, boolean> }> {
    return apiClient.post('/api/v1/api-keys/test-all');
  }
}

export const apiKeyService = new APIKeyService();
