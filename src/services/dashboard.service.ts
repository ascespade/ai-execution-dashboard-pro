// Dashboard Service

import { apiClient } from '@/lib/api-client';
import type { DashboardStats, ActivityData } from '@/types';

class DashboardService {
  /**
   * Get dashboard statistics
   */
  async getStats(): Promise<DashboardStats> {
    return apiClient.get<DashboardStats>('/api/v1/dashboard/stats');
  }

  /**
   * Get recent activity
   */
  async getRecentActivity(limit?: number): Promise<Record<string, unknown>[]> {
    return apiClient.get<Record<string, unknown>[]>('/api/v1/dashboard/recent-activity', {
      params: { limit },
    });
  }

  /**
   * Get active agents
   */
  async getActiveAgents(): Promise<Record<string, unknown>[]> {
    return apiClient.get<Record<string, unknown>[]>('/api/v1/dashboard/active-agents');
  }

  /**
   * Get chart data
   */
  async getChartData(chartType: string, params?: Record<string, unknown>): Promise<Record<string, unknown>> {
    return apiClient.get<Record<string, unknown>>(`/api/v1/dashboard/charts/${chartType}`, {
      params,
    });
  }
}

export const dashboardService = new DashboardService();
