// Platform Adapter Index - Export all platform integration components

// API Client
export {
  platformClient,
  type AppError,
  type RequestOptions,
  type HealthResponse,
  type ReadinessResponse,
  type OrchestrationSummary,
  type OrchestrationListResponse,
  type TelemetryResponse,
  type CreateOrchestrationRequest,
} from './apiClient';

// Mappers
export {
  type UiHealthStatus,
  type UiReadinessStatus,
  type UiOrchestration,
  type UiOrchestrationList,
  type UiTelemetryCard,
  type SchemaMismatchDetail,
  mapHealthResponse,
  mapReadinessResponse,
  mapOrchestrationsResponse,
  mapOrchestration,
  mapTelemetryResponse,
  mapSchemaMismatch,
} from './mappers';

// Hooks
export {
  queryKeys,
  usePlatformHealth,
  usePlatformReadiness,
  useOrchestrations,
  useOrchestration,
  usePlatformTelemetry,
  useTestConnection,
  useRecentErrors,
  type UsePlatformQueryResult,
} from './hooks/usePlatform';

// Stores
export {
  useConfigStore,
  selectBaseUrl,
  selectApiKey,
  selectIsConfigured,
  selectConnectionStatus,
  getMaskedApiKey,
  validateApiKey,
  validateBaseUrl,
} from '../stores/configStore';

export {
  useReliabilityStore,
  selectScore,
  selectSuccessRate,
  selectIsHealthy,
  selectRecentErrors,
  getHealthStatus,
  getHealthStatusColor,
  getHealthStatusBg,
  type HealthStatus,
} from '../stores/reliabilityStore';
