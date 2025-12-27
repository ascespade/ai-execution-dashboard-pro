// Platform API Client - Production-grade with Zod validation, circuit breaker, and telemetry
// Part of the Adapter Pattern for platform API integration

import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

// ============================================================================
// Zod Schemas for Runtime Validation
// ============================================================================

// Health Response Schema
export const HealthResponseSchema = z.object({
  status: z.enum(['ok', 'error']),
  latency: z.number().positive(),
  timestamp: z.string().datetime(),
  version: z.string().optional(),
  uptime: z.number().optional(),
});

export type HealthResponse = z.infer<typeof HealthResponseSchema>;

// Readiness Response Schema
export const ReadinessResponseSchema = z.object({
  isReady: z.boolean(),
  pendingDependencies: z.array(z.string()),
  checks: z.record(z.boolean()),
});

export type ReadinessResponse = z.infer<typeof ReadinessResponseSchema>;

// Orchestration Summary Schema
export const OrchestrationSummarySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  status: z.enum(['PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'PAUSED']),
  progress: z.number().min(0).max(100),
  repository_url: z.string().url(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  started_at: z.string().datetime().optional(),
  completed_at: z.string().datetime().optional(),
  model: z.string().optional(),
  duration_seconds: z.number().optional(),
  error_message: z.string().optional(),
});

export type OrchestrationSummary = z.infer<typeof OrchestrationSummarySchema>;

// Orchestration List Response Schema
export const OrchestrationListResponseSchema = z.object({
  data: z.array(OrchestrationSummarySchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  page_size: z.number().int().positive().max(100),
});

export type OrchestrationListResponse = z.infer<typeof OrchestrationListResponseSchema>;

// Telemetry Response Schema
export const TelemetryResponseSchema = z.object({
  cpuUsage: z.number().min(0).max(100),
  memoryUsage: z.number().min(0).max(100),
  activeRequests: z.number().int().nonnegative(),
  queueDepth: z.number().int().nonnegative(),
  timestamp: z.string().datetime(),
});

export type TelemetryResponse = z.infer<typeof TelemetryResponseSchema>;

// Create Orchestration Request Schema
export const CreateOrchestrationRequestSchema = z.object({
  name: z.string().min(1).max(255),
  repository_url: z.string().url(),
  execution_mode: z.enum(['EXECUTE_ONE', 'SEQUENTIAL', 'PARALLEL']),
  tasks: z.array(z.object({
    name: z.string().min(1),
    command: z.string().min(1),
    timeout_seconds: z.number().int().positive().optional(),
  })).optional(),
  parameters: z.record(z.unknown()).optional(),
});

export type CreateOrchestrationRequest = z.infer<typeof CreateOrchestrationRequestSchema>;

// ============================================================================
// Error Types
// ============================================================================

export type ErrorKind = 
  | 'AUTH_REQUIRED'
  | 'AUTH_FORBIDDEN'
  | 'RATE_LIMIT'
  | 'NETWORK'
  | 'TIMEOUT'
  | 'VALIDATION'
  | 'NOT_FOUND'
  | 'SERVER_5XX'
  | 'SCHEMA_DRIFT'
  | 'UNKNOWN';

export interface AppError {
  kind: ErrorKind;
  message: string;
  status?: number;
  retryAfter?: number;
  requestId?: string;
  details?: {
    attempt: number;
    timestamp: string;
    schemaErrors?: string[];
  };
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
}

// ============================================================================
// Circuit Breaker State
// ============================================================================

interface CircuitBreakerState {
  failures: number;
  lastFailure: number;
  state: 'closed' | 'open' | 'half-open';
  failuresThreshold: number;
  resetTimeoutMs: number;
}

const defaultCircuitBreaker: CircuitBreakerState = {
  failures: 0,
  lastFailure: 0,
  state: 'closed',
  failuresThreshold: 5,
  resetTimeoutMs: 30000, // 30 seconds
};

// ============================================================================
// Configuration Store (inline for simplicity)
// ============================================================================

interface PlatformConfig {
  baseUrl: string;
  apiKey: string;
  requestTimeout: number;
  maxRetries: number;
}

const getConfig = (): PlatformConfig => {
  if (typeof window !== 'undefined') {
    return {
      baseUrl: localStorage.getItem('platform_api_url') || '',
      apiKey: localStorage.getItem('platform_api_key') || '',
      requestTimeout: 15000, // 15 seconds as per spec
      maxRetries: 3,
    };
  }
  return {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'https://ai-execution-platform-production.up.railway.app',
    apiKey: process.env.NEXT_PUBLIC_API_KEY || '',
    requestTimeout: 15000,
    maxRetries: 3,
  };
};

// ============================================================================
// API Client Implementation
// ============================================================================

class PlatformApiClient {
  private config: PlatformConfig;
  private circuitBreaker: CircuitBreakerState;
  private requestLog: Array<{
    method: string;
    path: string;
    status?: number;
    error?: ErrorKind;
    latency: number;
    requestId: string;
    timestamp: string;
  }> = [];

  constructor() {
    this.config = getConfig();
    this.circuitBreaker = { ...defaultCircuitBreaker };
  }

  /**
   * Update configuration and persist to localStorage
   */
  configure(baseUrl: string, apiKey: string): void {
    this.config.baseUrl = baseUrl;
    this.config.apiKey = apiKey;
    this.circuitBreaker = { ...defaultCircuitBreaker }; // Reset circuit breaker on config change
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('platform_api_url', baseUrl);
      localStorage.setItem('platform_api_key', apiKey);
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): PlatformConfig {
    return { ...this.config };
  }

  /**
   * Check if client is configured
   */
  isConfigured(): boolean {
    return !!(this.config.baseUrl && this.config.apiKey);
  }

  /**
   * Clear configuration
   */
  reset(): void {
    this.config.baseUrl = '';
    this.config.apiKey = '';
    this.circuitBreaker = { ...defaultCircuitBreaker };
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('platform_api_url');
      localStorage.removeItem('platform_api_key');
    }
  }

  /**
   * Get recent request log (last 50 entries)
   */
  getRequestLog(): Array<{
    method: string;
    path: string;
    status?: number;
    error?: ErrorKind;
    latency: number;
    requestId: string;
    timestamp: string;
  }> {
    return this.requestLog.slice(-50);
  }

  /**
   * Clear request log
   */
  clearRequestLog(): void {
    this.requestLog = [];
  }

  /**
   * Get circuit breaker status
   */
  getCircuitBreakerStatus(): CircuitBreakerState {
    return { ...this.circuitBreaker };
  }

  /**
   * Check if circuit is open
   */
  isCircuitOpen(): boolean {
    if (this.circuitBreaker.state === 'open') {
      const timeSinceFailure = Date.now() - this.circuitBreaker.lastFailure;
      if (timeSinceFailure >= this.circuitBreaker.resetTimeoutMs) {
        // Attempt to half-open
        this.circuitBreaker.state = 'half-open';
        return false;
      }
      return true;
    }
    return false;
  }

  /**
   * Main request method with full error handling, validation, and circuit breaker
   */
  async request<T>(
    endpoint: string,
    options: RequestOptions = {},
    schema?: z.ZodSchema<T>
  ): Promise<T> {
    const startTime = Date.now();
    const {
      method = 'GET',
      body = null,
      headers = {},
      timeout = this.config.requestTimeout,
      retries = this.config.maxRetries,
    } = options;

    const url = `${this.config.baseUrl}${endpoint}`;
    const requestId = uuidv4();
    let lastError: AppError | null = null;

    // Check circuit breaker
    if (this.isCircuitOpen()) {
      throw {
        kind: 'SERVER_5XX' as const,
        message: 'Circuit breaker is open - service temporarily unavailable',
        status: 503,
        requestId,
        details: {
          attempt: 0,
          timestamp: new Date().toISOString(),
        },
      };
    }

    // Build headers with authentication and tracing
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-request-id': requestId,
      ...headers,
    };

    if (this.config.apiKey) {
      requestHeaders['x-api-key'] = this.config.apiKey;
    }

    // Retry loop with exponential backoff
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await this.executeRequest<T>(
          url,
          method,
          body,
          requestHeaders,
          timeout,
          attempt,
          schema
        );

        const latency = Date.now() - startTime;
        
        // Log successful request
        this.logRequest({
          method,
          path: endpoint,
          status: 200,
          latency,
          requestId,
        });

        // Reset circuit breaker on success
        if (this.circuitBreaker.failures > 0) {
          this.circuitBreaker.failures = 0;
          this.circuitBreaker.state = 'closed';
        }

        return response;
      } catch (error) {
        lastError = error as AppError;
        const latency = Date.now() - startTime;
        
        // Log failed request
        this.logRequest({
          method,
          path: endpoint,
          error: lastError.kind,
          latency,
          requestId,
        });

        // Record failure for circuit breaker
        if (lastError.status && lastError.status >= 500) {
          this.circuitBreaker.failures++;
          this.circuitBreaker.lastFailure = Date.now();
          
          if (this.circuitBreaker.failures >= this.circuitBreaker.failuresThreshold) {
            this.circuitBreaker.state = 'open';
          }
        }
        
        // Don't retry on client errors (4xx) except 429
        if (lastError.status && lastError.status < 500 && lastError.status !== 429) {
          throw lastError;
        }

        // Don't retry on final attempt
        if (attempt >= retries) {
          throw lastError;
        }

        // Calculate backoff delay
        const delay = Math.pow(2, attempt) * 1000;
        
        // Handle rate limiting
        if (lastError.retryAfter) {
          await this.sleep(lastError.retryAfter * 1000);
        } else {
          await this.sleep(delay);
        }
      }
    }

    throw lastError;
  }

  /**
   * Log a request for the trace viewer
   */
  private logRequest(entry: {
    method: string;
    path: string;
    status?: number;
    error?: ErrorKind;
    latency: number;
    requestId: string;
  }): void {
    this.requestLog.push({
      ...entry,
      timestamp: new Date().toISOString(),
    });
    
    // Keep only last 100 entries
    if (this.requestLog.length > 100) {
      this.requestLog = this.requestLog.slice(-100);
    }
  }

  /**
   * Execute the actual HTTP request with Zod validation
   */
  private async executeRequest<T>(
    url: string,
    method: string,
    body: unknown,
    headers: Record<string, string>,
    timeout: number,
    attempt: number,
    schema?: z.ZodSchema<T>
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : null,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      return this.handleResponse<T>(response, attempt, schema);
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return this.createError('TIMEOUT', 'Request timeout', undefined, undefined, attempt);
        }
        return this.createError('NETWORK', error.message, undefined, undefined, attempt);
      }
      
      return this.createError('UNKNOWN', 'Unknown error', undefined, undefined, attempt);
    }
  }

  /**
   * Handle response and parse with Zod validation
   */
  private handleResponse<T>(
    response: Response,
    attempt: number,
    schema?: z.ZodSchema<T>
  ): T {
    const { status } = response;

    // Success case
    if (status >= 200 && status < 300) {
      // Handle empty responses
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        return {} as T;
      }

      // Parse JSON
      const parseResult = response.json();

      // If schema provided, validate
      if (schema) {
        const validationResult = schema.safeParse(parseResult);
        
        if (validationResult.success) {
          return validationResult.data;
        } else {
          // Schema drift detected
          const error: AppError = {
            kind: 'SCHEMA_DRIFT',
            message: 'API response schema does not match expected format',
            details: {
              attempt,
              timestamp: new Date().toISOString(),
              schemaErrors: validationResult.error.errors.map(e => 
                `${e.path.join('.')}: ${e.message}`
              ),
            },
          };
          throw error;
        }
      }

      return parseResult as T;
    }

    // Error cases
    const retryAfter = response.headers.get('retry-after');
    const retryAfterSeconds = retryAfter 
      ? parseInt(retryAfter, 10) 
      : undefined;

    switch (status) {
      case 400:
        return this.createError(
          'VALIDATION',
          'Invalid request parameters',
          status,
          retryAfterSeconds,
          attempt
        );

      case 401:
        return this.createError(
          'AUTH_REQUIRED',
          'Unauthorized - invalid or missing API key',
          status,
          retryAfterSeconds,
          attempt
        );

      case 403:
        return this.createError(
          'AUTH_FORBIDDEN',
          'Forbidden - insufficient permissions',
          status,
          retryAfterSeconds,
          attempt
        );

      case 404:
        return this.createError(
          'NOT_FOUND',
          'Resource not found',
          status,
          retryAfterSeconds,
          attempt
        );

      case 429:
        return this.createError(
          'RATE_LIMIT',
          'Rate limit exceeded. Please retry after the specified time.',
          status,
          retryAfterSeconds,
          attempt
        );

      case 502:
      case 503:
      case 504:
        return this.createError(
          'SERVER_5XX',
          `Server error (${status}). The platform may be temporarily unavailable.`,
          status,
          retryAfterSeconds,
          attempt
        );

      default:
        return this.createError(
          'SERVER_5XX',
          `Unexpected error (${status})`,
          status,
          retryAfterSeconds,
          attempt
        );
    }
  }

  /**
   * Create standardized error object
   */
  private createError(
    kind: ErrorKind,
    message: string,
    status?: number,
    retryAfter?: number,
    attempt?: number
  ): never {
    const error: AppError = {
      kind,
      message,
      status,
      retryAfter,
      details: {
        attempt: attempt || 0,
        timestamp: new Date().toISOString(),
      },
    };
    throw error;
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const platformClient = new PlatformApiClient();
