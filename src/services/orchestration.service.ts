// Orchestration Service

import { apiClient } from '@/lib/api-client';
import type {
  Orchestration,
  OrchestrationSummary,
  CreateOrchestrationData,
  OrchestrationUpdate,
  PaginatedResponse,
  Task,
} from '@/types';

class OrchestrationService {
  /**
   * Get list of orchestrations with pagination
   */
  async getOrchestrations(params?: {
    page?: number;
    page_size?: number;
    status?: string;
    search?: string;
  }): Promise<PaginatedResponse<OrchestrationSummary>> {
    return apiClient.get<PaginatedResponse<OrchestrationSummary>>('/api/v1/orchestrations', {
      params,
    });
  }

  /**
   * Get single orchestration by ID
   */
  async getOrchestration(id: string): Promise<Orchestration> {
    return apiClient.get<Orchestration>(`/api/v1/orchestrations/${id}`);
  }

  /**
   * Create a new orchestration
   */
  async createOrchestration(data: CreateOrchestrationData): Promise<Orchestration> {
    return apiClient.post<Orchestration>('/api/v1/orchestrations', data);
  }

  /**
   * Update an orchestration
   */
  async updateOrchestration(id: string, data: OrchestrationUpdate): Promise<Orchestration> {
    return apiClient.put<Orchestration>(`/api/v1/orchestrations/${id}`, data);
  }

  /**
   * Delete an orchestration
   */
  async deleteOrchestration(id: string): Promise<void> {
    return apiClient.delete(`/api/v1/orchestrations/${id}`);
  }

  /**
   * Start an orchestration
   */
  async startOrchestration(id: string): Promise<Orchestration> {
    return apiClient.post<Orchestration>(`/api/v1/orchestrations/${id}/start`);
  }

  /**
   * Pause a running orchestration
   */
  async pauseOrchestration(id: string): Promise<Orchestration> {
    return apiClient.post<Orchestration>(`/api/v1/orchestrations/${id}/pause`);
  }

  /**
   * Resume a paused orchestration
   */
  async resumeOrchestration(id: string): Promise<Orchestration> {
    return apiClient.post<Orchestration>(`/api/v1/orchestrations/${id}/resume`);
  }

  /**
   * Cancel a running orchestration
   */
  async cancelOrchestration(id: string): Promise<Orchestration> {
    return apiClient.post<Orchestration>(`/api/v1/orchestrations/${id}/cancel`);
  }

  /**
   * Get tasks for an orchestration
   */
  async getOrchestrationTasks(id: string): Promise<Task[]> {
    return apiClient.get<Task[]>(`/api/v1/orchestrations/${id}/tasks`);
  }

  /**
   * Get logs for an orchestration
   */
  async getOrchestrationLogs(id: string, params?: {
    level?: string;
    limit?: number;
    offset?: number;
  }): Promise<Record<string, unknown>[]> {
    return apiClient.get<Record<string, unknown>[]>(`/api/v1/orchestrations/${id}/logs`, {
      params,
    });
  }

  /**
   * Get artifacts for an orchestration
   */
  async getOrchestrationArtifacts(id: string): Promise<Record<string, unknown>[]> {
    return apiClient.get<Record<string, unknown>[]>(`/api/v1/orchestrations/${id}/artifacts`);
  }

  /**
   * Run a dry run of an orchestration
   */
  async dryRunOrchestration(id: string): Promise<Record<string, unknown>> {
    return apiClient.post<Record<string, unknown>>(`/api/v1/orchestrations/${id}/dry-run`);
  }
}

export const orchestrationService = new OrchestrationService();
