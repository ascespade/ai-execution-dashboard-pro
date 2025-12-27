// Platform API Mappers - Transform API responses to UI models
// Part of the Adapter Pattern for platform API integration

import type {
  HealthResponse,
  ReadinessResponse,
  OrchestrationSummary,
  OrchestrationListResponse,
  TelemetryResponse,
} from './apiClient';

// ============================================================================
// Health Endpoint Mapping
// ============================================================================

export interface UiHealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  latency: number;
  timestamp: string;
  version?: string;
  uptime?: number;
  checks: {
    api: boolean;
    database: boolean;
    cache: boolean;
  };
}

/**
 * Transform platform /health response to UI model
 */
export function mapHealthResponse(response: HealthResponse): UiHealthStatus {
  const isHealthy = response.status === 'ok';
  return {
    status: isHealthy ? 'healthy' : 'unhealthy',
    latency: response.latency,
    timestamp: response.timestamp,
    version: response.version,
    uptime: response.uptime,
    checks: {
      api: isHealthy,
      database: true, // Placeholder - would come from actual response
      cache: true, // Placeholder - would come from actual response
    },
  };
}

// ============================================================================
// Readiness Endpoint Mapping
// ============================================================================

export interface UiReadinessStatus {
  isReady: boolean;
  pendingDependencies: string[];
  timestamp: string;
}

/**
 * Transform platform /ready response to UI model
 */
export function mapReadinessResponse(response: ReadinessResponse): UiReadinessStatus {
  return {
    isReady: response.isReady,
    pendingDependencies: response.pendingDependencies,
    timestamp: new Date().toISOString(),
  };
}

// ============================================================================
// Orchestrations Endpoint Mapping
// ============================================================================

export interface UiOrchestration {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
  progress: number;
  repositoryUrl: string;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
  model?: string;
  duration?: number;
  errorMessage?: string;
  durationDisplay: string;
}

export interface UiOrchestrationList {
  orchestrations: UiOrchestration[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Transform platform orchestration status to UI model
 */
function mapOrchestrationStatus(status: string): UiOrchestration['status'] {
  const statusMap: Record<string, UiOrchestration['status']> = {
    PENDING: 'pending',
    RUNNING: 'running',
    COMPLETED: 'completed',
    FAILED: 'failed',
    PAUSED: 'paused',
  };
  return statusMap[status] || 'pending';
}

/**
 * Calculate duration display string
 */
function calculateDuration(seconds?: number): string {
  if (!seconds) return '--';
  
  if (seconds < 60) {
    return `${seconds}s`;
  } else if (seconds < 3600) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${mins}m`;
  }
}

/**
 * Transform platform orchestrations response to UI model
 */
export function mapOrchestrationsResponse(
  response: OrchestrationListResponse
): UiOrchestrationList {
  const orchestrations: UiOrchestration[] = response.data.map(orch => ({
    id: orch.id,
    name: orch.name,
    status: mapOrchestrationStatus(orch.status),
    progress: orch.progress,
    repositoryUrl: orch.repository_url,
    createdAt: orch.created_at,
    updatedAt: orch.updated_at,
    startedAt: orch.started_at,
    completedAt: orch.completed_at,
    model: orch.model,
    duration: orch.duration_seconds,
    errorMessage: orch.error_message,
    durationDisplay: calculateDuration(orch.duration_seconds),
  }));

  return {
    orchestrations,
    total: response.total,
    page: response.page,
    pageSize: response.page_size,
    totalPages: Math.ceil(response.total / response.page_size),
  };
}

/**
 * Map single orchestration response
 */
export function mapOrchestration(orch: OrchestrationSummary): UiOrchestration {
  return {
    id: orch.id,
    name: orch.name,
    status: mapOrchestrationStatus(orch.status),
    progress: orch.progress,
    repositoryUrl: orch.repository_url,
    createdAt: orch.created_at,
    updatedAt: orch.updated_at,
    startedAt: orch.started_at,
    completedAt: orch.completed_at,
    model: orch.model,
    duration: orch.duration_seconds,
    errorMessage: orch.error_message,
    durationDisplay: calculateDuration(orch.duration_seconds),
  };
}

// ============================================================================
// Telemetry Endpoint Mapping
// ============================================================================

export interface UiTelemetryCard {
  cpuUsage: number;
  memoryUsage: number;
  activeRequests: number;
  queueDepth: number;
  timestamp: string;
  status: 'normal' | 'warning' | 'critical';
}

/**
 * Transform platform telemetry response to UI model
 */
export function mapTelemetryResponse(data: TelemetryResponse): UiTelemetryCard {
  const cpuStatus = data.cpuUsage > 90 ? 'critical' : data.cpuUsage > 70 ? 'warning' : 'normal';
  const memStatus = data.memoryUsage > 90 ? 'critical' : data.memoryUsage > 70 ? 'warning' : 'normal';
  
  return {
    cpuUsage: data.cpuUsage,
    memoryUsage: data.memoryUsage,
    activeRequests: data.activeRequests,
    queueDepth: data.queueDepth,
    timestamp: data.timestamp,
    status: cpuStatus === 'critical' || memStatus === 'critical' ? 'critical' : 
            cpuStatus === 'warning' || memStatus === 'warning' ? 'warning' : 'normal',
  };
}

// ============================================================================
// Diagnostic Mapping
// ============================================================================

export interface SchemaMismatchDetail {
  endpoint: string;
  expectedFields: string[];
  missingFields: string[];
  receivedFields: string[];
}

export function mapSchemaMismatch(
  endpoint: string,
  expected: string[],
  received: Record<string, unknown>
): SchemaMismatchDetail {
  const receivedKeys = Object.keys(received);
  const missingFields = expected.filter(field => !receivedKeys.includes(field));

  return {
    endpoint,
    expectedFields: expected,
    missingFields,
    receivedFields: receivedKeys,
  };
}

// ============================================================================
// Intelligence Layer Types
// ============================================================================

import type {
  TelemetryPoint,
  OrchestrationEvent,
  RequestEvent,
  HealthEvent,
  TrendAnalysis,
  DegradationWarning,
  RootCauseHint,
  RemediationAction,
  ReliabilityScore,
  DiagnosticResult,
} from '@/intelligence/engine';

/**
 * Map orchestration summary to intelligence orchestration event
 */
export function mapToIntelligenceOrchestration(
  orch: UiOrchestration
): OrchestrationEvent {
  return {
    id: orch.id,
    name: orch.name,
    status: orch.status,
    createdAt: orch.createdAt,
    completedAt: orch.completedAt,
    duration_seconds: orch.duration,
    error_message: orch.errorMessage,
  };
}

/**
 * Map telemetry response to intelligence telemetry point
 */
export function mapToIntelligenceTelemetry(
  data: TelemetryResponse
): TelemetryPoint {
  return {
    timestamp: data.timestamp,
    cpuUsage: data.cpuUsage,
    memoryUsage: data.memoryUsage,
    activeRequests: data.activeRequests,
    queueDepth: data.queueDepth,
  };
}

/**
 * Map health response to intelligence health event
 */
export function mapToIntelligenceHealth(
  health: UiHealthStatus
): HealthEvent {
  return {
    status: health.status,
    latency: health.latency,
    timestamp: health.timestamp,
  };
}

// Re-export intelligence types
export type {
  TrendAnalysis,
  DegradationWarning,
  RootCauseHint,
  RemediationAction,
  ReliabilityScore,
  DiagnosticResult,
  TelemetryPoint,
  OrchestrationEvent,
  RequestEvent,
  HealthEvent,
};
