// Template Service

import { apiClient } from '@/lib/api-client';
import type {
  PromptTemplate,
  CreatePromptTemplateData,
  PaginatedResponse,
} from '@/types';

class TemplateService {
  /**
   * Get list of prompt templates
   */
  async getTemplates(params?: {
    page?: number;
    page_size?: number;
    category?: string;
    search?: string;
    is_public?: boolean;
  }): Promise<PaginatedResponse<PromptTemplate>> {
    return apiClient.get<PaginatedResponse<PromptTemplate>>('/api/v1/prompt-templates', {
      params,
    });
  }

  /**
   * Get single template by ID
   */
  async getTemplate(id: string): Promise<PromptTemplate> {
    return apiClient.get<PromptTemplate>(`/api/v1/prompt-templates/${id}`);
  }

  /**
   * Create a new template
   */
  async createTemplate(data: CreatePromptTemplateData): Promise<PromptTemplate> {
    return apiClient.post<PromptTemplate>('/api/v1/prompt-templates', data);
  }

  /**
   * Update a template
   */
  async updateTemplate(id: string, data: Partial<CreatePromptTemplateData>): Promise<PromptTemplate> {
    return apiClient.put<PromptTemplate>(`/api/v1/prompt-templates/${id}`, data);
  }

  /**
   * Delete a template
   */
  async deleteTemplate(id: string): Promise<void> {
    return apiClient.delete(`/api/v1/prompt-templates/${id}`);
  }

  /**
   * Use a template (increment usage count)
   */
  async useTemplate(id: string): Promise<PromptTemplate> {
    return apiClient.post<PromptTemplate>(`/api/v1/prompt-templates/${id}/use`);
  }
}

export const templateService = new TemplateService();
