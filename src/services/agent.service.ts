// Agent Service

import { apiClient } from '@/lib/api-client';
import type { Agent, AgentSummary, PaginatedResponse } from '@/types';

class AgentService {
  /**
   * Get list of all agents
   */
  async getAgents(params?: {
    page?: number;
    page_size?: number;
    category?: string;
    search?: string;
  }): Promise<PaginatedResponse<Agent>> {
    return apiClient.get<PaginatedResponse<Agent>>('/api/v1/agents', {
      params,
    });
  }

  /**
   * Get single agent by ID
   */
  async getAgent(id: string): Promise<Agent> {
    return apiClient.get<Agent>(`/api/v1/agents/${id}`);
  }

  /**
   * Get available agents (those ready to take tasks)
   */
  async getAvailableAgents(): Promise<AgentSummary[]> {
    return apiClient.get<AgentSummary[]>('/api/v1/agents/available');
  }

  /**
   * Get agent categories
   */
  async getCategories(): Promise<{ id: string; name: string; count: number }[]> {
    return apiClient.get<{ id: string; name: string; count: number }[]>('/api/v1/agents/categories');
  }
}

export const agentService = new AgentService();
