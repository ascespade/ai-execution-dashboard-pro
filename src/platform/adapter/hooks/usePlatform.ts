// React Query Hooks for Platform API
// Provides declarative data fetching with caching, retry logic, and intelligence integration

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  platformClient, 
  HealthResponseSchema, 
  ReadinessResponseSchema,
  OrchestrationListResponseSchema,
  TelemetryResponseSchema,
  CreateOrchestrationRequestSchema,
  type AppError,
  type HealthResponse,
  type ReadinessResponse,
  type TelemetryResponse,
} from '@/platform/adapter/apiClient';
import {
  mapHealthResponse,
  mapReadinessResponse,
  mapOrchestrationsResponse,
  mapOrchestration,
  mapTelemetryResponse,
  type UiHealthStatus,
  type UiReadinessStatus,
  type UiOrchestrationList,
  type UiOrchestration,
  type UiTelemetryCard,
  mapToIntelligenceTelemetry,
  mapToIntelligenceHealth,
  mapToIntelligenceOrchestration,
} from '@/platform/adapter/mappers';
import { useIntelligenceStore } from '@/intelligence/store';

// ============================================================================
// Query Keys
// ============================================================================

export const queryKeys = {
  health: ['platform', 'health'] as const,
  readiness: ['platform', 'readiness'] as const,
  orchestrations: (params?: { page?: number; pageSize?: number; status?: string }) => 
    ['platform', 'orchestrations', params] as const,
  orchestration: (id: string) => ['platform', 'orchestration', id] as const,
  telemetry: ['platform', 'telemetry'] as const,
  diagnostics: ['platform', 'diagnostics'] as const,
} as const;

// ============================================================================
// Health Hook
// ============================================================================

export function usePlatformHealth() {
  const addTelemetryPoint = useIntelligenceStore(state => state.addTelemetryPoint);
  const addHealthEvent = useIntelligenceStore(state => state.addHealthEvent);

  return useQuery({
    queryKey: queryKeys.health,
    queryFn: async (): Promise<UiHealthStatus> => {
      const response = await platformClient.request<HealthResponse>(
        '/health',
        { method: 'GET' },
        HealthResponseSchema
      );
      
      const uiHealth = mapHealthResponse(response);
      
      // Add to intelligence store
      addHealthEvent(mapToIntelligenceHealth(uiHealth));
      
      return uiHealth;
    },
    staleTime: 10000, // 10 seconds
    refetchInterval: 30000, // Auto-refresh every 30 seconds
    retry: 2,
  });
}

// ============================================================================
// Readiness Hook
// ============================================================================

export function usePlatformReadiness() {
  return useQuery({
    queryKey: queryKeys.readiness,
    queryFn: async (): Promise<UiReadinessStatus> => {
      const response = await platformClient.request<ReadinessResponse>(
        '/ready',
        { method: 'GET' },
        ReadinessResponseSchema
      );
      return mapReadinessResponse(response);
    },
    staleTime: 5000, // 5 seconds
    refetchInterval: 10000, // Auto-refresh every 10 seconds
    retry: 1,
  });
}

// ============================================================================
// Orchestrations Hooks
// ============================================================================

export function useOrchestrations(params?: { page?: number; pageSize?: number; status?: string }) {
  const addOrchestrationEvent = useIntelligenceStore(state => state.addOrchestrationEvent);

  return useQuery({
    queryKey: queryKeys.orchestrations(params),
    queryFn: async (): Promise<UiOrchestrationList> => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', params.page.toString());
      if (params?.pageSize) searchParams.set('page_size', params.pageSize.toString());
      if (params?.status) searchParams.set('status', params.status);

      const queryString = searchParams.toString();
      const endpoint = `/api/v1/orchestrations${queryString ? `?${queryString}` : ''}`;

      const response = await platformClient.request<unknown>(
        endpoint, 
        { method: 'GET' },
        OrchestrationListResponseSchema
      );

      const result = mapOrchestrationsResponse(response as Parameters<typeof mapOrchestrationsResponse>[0]);
      
      // Add orchestrations to intelligence store
      result.orchestrations.forEach(orch => {
        addOrchestrationEvent(mapToIntelligenceOrchestration(orch));
      });
      
      return result;
    },
    staleTime: 10000,
    retry: 2,
  });
}

export function useOrchestration(id: string | null) {
  return useQuery({
    queryKey: queryKeys.orchestration(id || ''),
    queryFn: async (): Promise<UiOrchestration | null> => {
      if (!id) return null;
      
      const response = await platformClient.request<unknown>(
        `/api/v1/orchestrations/${id}`, 
        { method: 'GET' }
      );
      
      return mapOrchestration(response as Parameters<typeof mapOrchestration>[0]);
    },
    enabled: !!id,
    staleTime: 5000,
    refetchInterval: (query) => {
      // Poll when running
      const data = query.state.data as UiOrchestration | null;
      if (data?.status === 'running') {
        return 5000;
      }
      return false;
    },
    retry: 1,
  });
}

// ============================================================================
// Telemetry Hook
// ============================================================================

export function usePlatformTelemetry() {
  const addTelemetryPoint = useIntelligenceStore(state => state.addTelemetryPoint);

  return useQuery({
    queryKey: queryKeys.telemetry,
    queryFn: async (): Promise<UiTelemetryCard> => {
      const response = await platformClient.request<TelemetryResponse>(
        '/api/v1/telemetry',
        { method: 'GET' },
        TelemetryResponseSchema
      );
      
      const telemetry = mapTelemetryResponse(response);
      
      // Add to intelligence store
      addTelemetryPoint(mapToIntelligenceTelemetry(response));
      
      return telemetry;
    },
    staleTime: 5000,
    refetchInterval: 10000,
    retry: 1,
  });
}

// ============================================================================
// Create Orchestration Hook
// ============================================================================

export function useCreateOrchestration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      repository_url: string;
      execution_mode: 'EXECUTE_ONE' | 'SEQUENTIAL' | 'PARALLEL';
      tasks?: Array<{
        name: string;
        command: string;
        timeout_seconds?: number;
      }>;
    }) => {
      // Validate request with Zod
      const validatedData = CreateOrchestrationRequestSchema.parse(data);
      
      return platformClient.request<{ id: string; status: string; created_at: string }>(
        '/api/v1/orchestrations',
        {
          method: 'POST',
          body: validatedData,
        }
      );
    },
    onSuccess: () => {
      // Invalidate orchestrations list to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.orchestrations() });
    },
  });
}

// ============================================================================
// Cancel Orchestration Hook
// ============================================================================

export function useCancelOrchestration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return platformClient.request<{ id: string; status: string; cancelled_at: string }>(
        `/api/v1/orchestrations/${id}/cancel`,
        { method: 'POST' }
      );
    },
    onSuccess: (_, id) => {
      // Invalidate both list and detail
      queryClient.invalidateQueries({ queryKey: queryKeys.orchestrations() });
      queryClient.invalidateQueries({ queryKey: queryKeys.orchestration(id) });
    },
  });
}

// ============================================================================
// Connection Test Hook
// ============================================================================

export function useTestConnection() {
  return useMutation({
    mutationFn: async (): Promise<{ success: boolean; message: string; latency?: number }> => {
      const startTime = Date.now();
      
      try {
        await platformClient.request('/health', { method: 'GET', timeout: 10000 });
        const latency = Date.now() - startTime;
        
        return {
          success: true,
          message: 'Connection successful',
          latency,
        };
      } catch (error) {
        const appError = error as AppError;
        return {
          success: false,
          message: appError.message || 'Connection failed',
        };
      }
    },
  });
}

// ============================================================================
// Error Handling Hooks
// ============================================================================

/**
 * Hook to get recent error count for reliability scoring
 */
export function useRecentErrors(windowMs = 60000) {
  // This would typically be connected to a real error logging service
  // For now, we return a placeholder
  return useQuery({
    queryKey: ['platform', 'recent-errors', windowMs],
    queryFn: async (): Promise<{ count: number; errors: AppError[] }> => {
      // Placeholder - would integrate with actual error tracking
      return { count: 0, errors: [] };
    },
    staleTime: 30000,
  });
}

// ============================================================================
// Typed Error Interface for Components
// ============================================================================

export interface UsePlatformQueryResult<T> {
  data: T | undefined;
  isLoading: boolean;
  isError: boolean;
  error: AppError | null;
  refetch: () => Promise<void>;
  isFetching: boolean;
}

// Helper to get error kind for display
export function getErrorKind(error: AppError | null): string {
  if (!error) return '';
  
  const kindMessages: Record<string, string> = {
    AUTH_REQUIRED: 'Authentication Required',
    AUTH_FORBIDDEN: 'Access Denied',
    RATE_LIMIT: 'Rate Limited',
    NETWORK: 'Network Error',
    TIMEOUT: 'Request Timeout',
    VALIDATION: 'Invalid Request',
    NOT_FOUND: 'Not Found',
    SERVER_5XX: 'Server Error',
    SCHEMA_DRIFT: 'API Schema Mismatch',
    UNKNOWN: 'Unknown Error',
  };
  
  return kindMessages[error.kind] || error.kind;
}

// Helper to get error action hint
export function getErrorAction(error: AppError | null): string {
  if (!error) return '';
  
  const actionHints: Record<string, string> = {
    AUTH_REQUIRED: 'Configure your API key in Settings',
    AUTH_FORBIDDEN: 'Contact platform administrator for permissions',
    RATE_LIMIT: `Wait ${error.retryAfter || 60} seconds before retrying`,
    NETWORK: 'Check your internet connection',
    TIMEOUT: 'The platform may be slow; retry later',
    VALIDATION: 'Review your request parameters',
    NOT_FOUND: 'Verify the resource ID or endpoint',
    SERVER_5XX: 'Platform may be experiencing issues',
    SCHEMA_DRIFT: 'Check the API contract map for changes',
    UNKNOWN: 'Review the error details and try again',
  };
  
  return actionHints[error.kind] || error.message;
}
