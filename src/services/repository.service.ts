// Repository Service

import { apiClient } from '@/lib/api-client';
import type {
  RepositoryProfile,
  CreateRepositoryProfileData,
  UpdateRepositoryProfileData,
  PaginatedResponse,
} from '@/types';

class RepositoryService {
  /**
   * Get list of repository profiles
   */
  async getProfiles(params?: {
    page?: number;
    page_size?: number;
    search?: string;
  }): Promise<PaginatedResponse<RepositoryProfile>> {
    return apiClient.get<PaginatedResponse<RepositoryProfile>>('/api/v1/repository-profiles', {
      params,
    });
  }

  /**
   * Get single repository profile by ID
   */
  async getProfile(id: string): Promise<RepositoryProfile> {
    return apiClient.get<RepositoryProfile>(`/api/v1/repository-profiles/${id}`);
  }

  /**
   * Create a new repository profile
   */
  async createProfile(data: CreateRepositoryProfileData): Promise<RepositoryProfile> {
    return apiClient.post<RepositoryProfile>('/api/v1/repository-profiles', data);
  }

  /**
   * Update a repository profile
   */
  async updateProfile(id: string, data: UpdateRepositoryProfileData): Promise<RepositoryProfile> {
    return apiClient.put<RepositoryProfile>(`/api/v1/repository-profiles/${id}`, data);
  }

  /**
   * Delete a repository profile
   */
  async deleteProfile(id: string): Promise<void> {
    return apiClient.delete(`/api/v1/repository-profiles/${id}`);
  }
}

export const repositoryService = new RepositoryService();
