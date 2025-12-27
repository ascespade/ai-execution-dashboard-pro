# Platform Contract Map

**Document Version:** 1.0.0
**Last Updated:** December 27, 2025
**API Base URL:** https://ai-execution-platform-production.up.railway.app
**API Version:** v1

This document defines the complete contract between the Dashboard and the AI Execution Platform API. All integrations must adhere to these specifications.

---

## Table of Contents

1. [Authentication](#authentication)
2. [Error Taxonomy](#error-taxonomy)
3. [Health & Readiness Endpoints](#health--readiness-endpoints)
4. [Orchestrations Endpoints](#orchestrations-endpoints)
5. [Telemetry Endpoints](#telemetry-endpoints)
6. [Schema Specifications](#schema-specifications)
7. [Contract Evolution Policy](#contract-evolution-policy)

---

## Authentication

### Required Headers

All API requests MUST include the following headers:

| Header | Required | Description |
|--------|----------|-------------|
| `x-api-key` | Yes | API key for authentication. Obtain from platform settings. |
| `x-request-id` | Yes | Unique correlation ID for request tracing (UUID v4) |
| `Content-Type` | Yes | Must be `application/json` for request bodies |

### Example Request

```http
GET /api/v1/orchestrations HTTP/1.1
Host: ai-execution-platform-production.up.railway.app
x-api-key: ghp_your_api_key_here
x-request-id: 550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json
```

### Authentication Failures

| Status Code | Error Kind | Message | Remediation |
|-------------|------------|---------|-------------|
| 401 | `AUTH_REQUIRED` | Unauthorized - invalid or missing API key | Check your API key in settings |
| 403 | `AUTH_FORBIDDEN` | Forbidden - insufficient permissions | Contact platform administrator |

---

## Error Taxonomy

The Dashboard normalizes all API errors into a unified taxonomy:

| Error Kind | HTTP Status | Description | Retryable |
|------------|-------------|-------------|-----------|
| `AUTH_REQUIRED` | 401 | Missing or invalid API key | No - fix config |
| `AUTH_FORBIDDEN` | 403 | Valid key, insufficient permissions | No - contact admin |
| `RATE_LIMIT` | 429 | Too many requests | Yes - wait retry-after |
| `NETWORK` | N/A | Network connectivity failure | Yes - with backoff |
| `TIMEOUT` | N/A | Request exceeded timeout (15s) | Yes - with backoff |
| `VALIDATION` | 400 | Invalid request parameters | No - fix request |
| `NOT_FOUND` | 404 | Resource does not exist | No - verify ID |
| `SERVER_5XX` | 500-503 | Platform server error | Yes - with backoff |
| `SCHEMA_DRIFT` | N/A | Response doesn't match expected schema | No - platform issue |
| `UNKNOWN` | N/A | Unexpected error | Maybe - investigate |

### Error Response Format

```typescript
interface AppError {
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
```

---

## Health & Readiness Endpoints

### GET /health

Platform health check endpoint.

**Purpose:** Determine if the platform is alive and responding.

**Request:** No authentication required for health checks.

**Response:**

```typescript
interface HealthResponse {
  status: 'ok' | 'error';
  latency: number;        // Response time in milliseconds
  timestamp: string;      // ISO 8601 timestamp
  version?: string;       // Platform version
  uptime?: number;        // Uptime in seconds
}
```

**Example:**

```json
{
  "status": "ok",
  "latency": 45,
  "timestamp": "2025-12-27T12:00:00Z",
  "version": "1.0.0",
  "uptime": 86400
}
```

**Dashboard Mapping:**

```typescript
interface UiHealthStatus {
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
```

---

### GET /ready

Platform readiness check with dependency status.

**Purpose:** Determine if the platform is ready to accept requests.

**Request:** No authentication required for readiness checks.

**Response:**

```typescript
interface ReadinessResponse {
  isReady: boolean;
  pendingDependencies: string[];
  checks: Record<string, boolean>;
}
```

**Example:**

```json
{
  "isReady": true,
  "pendingDependencies": [],
  "checks": {
    "database": true,
    "cache": true,
    "queue": true
  }
}
```

**Example (Not Ready):**

```json
{
  "isReady": false,
  "pendingDependencies": ["database", "cache"],
  "checks": {
    "database": false,
    "cache": false,
    "queue": true
  }
}
```

---

## Orchestrations Endpoints

### GET /api/v1/orchestrations

List all orchestrations with pagination.

**Purpose:** Retrieve a paginated list of orchestrations.

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | 1 | Page number (1-indexed) |
| `page_size` | integer | No | 10 | Items per page (max 100) |
| `status` | string | No | - | Filter by status |
| `sort_by` | string | No | `created_at` | Sort field |
| `sort_order` | string | No | `desc` | Sort order: `asc` or `desc` |

**Response:**

```typescript
interface OrchestrationListResponse {
  data: OrchestrationSummary[];
  total: number;
  page: number;
  page_size: number;
}
```

**Example:**

```json
{
  "data": [
    {
      "id": "orch-123456",
      "name": "Build and Test Pipeline",
      "status": "RUNNING",
      "progress": 45,
      "repository_url": "https://github.com/org/repo",
      "created_at": "2025-12-27T10:00:00Z",
      "updated_at": "2025-12-27T10:30:00Z",
      "started_at": "2025-12-27T10:05:00Z",
      "model": "gpt-4o",
      "duration_seconds": 1500
    }
  ],
  "total": 42,
  "page": 1,
  "page_size": 10
}
```

---

### GET /api/v1/orchestrations/:id

Get a single orchestration by ID.

**Purpose:** Retrieve detailed information about a specific orchestration.

**Response:**

```typescript
interface OrchestrationDetail {
  id: string;
  name: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'PAUSED';
  progress: number;
  repository_url: string;
  created_at: string;
  updated_at: string;
  started_at?: string;
  completed_at?: string;
  model?: string;
  duration_seconds?: number;
  error_message?: string;
  steps?: OrchestrationStep[];
}
```

**Example:**

```json
{
  "id": "orch-123456",
  "name": "Build and Test Pipeline",
  "status": "COMPLETED",
  "progress": 100,
  "repository_url": "https://github.com/org/repo",
  "created_at": "2025-12-27T10:00:00Z",
  "updated_at": "2025-12-27T11:00:00Z",
  "started_at": "2025-12-27T10:05:00Z",
  "completed_at": "2025-12-27T11:00:00Z",
  "model": "gpt-4o",
  "duration_seconds": 3600,
  "steps": [
    {
      "id": "step-1",
      "name": "Checkout",
      "status": "COMPLETED",
      "duration_seconds": 30
    },
    {
      "id": "step-2",
      "name": "Install Dependencies",
      "status": "COMPLETED",
      "duration_seconds": 120
    }
  ]
}
```

---

### POST /api/v1/orchestrations

Create a new orchestration.

**Purpose:** Submit a new orchestration for execution.

**Request Body:**

```typescript
interface CreateOrchestrationRequest {
  name: string;
  repository_url: string;
  execution_mode: 'EXECUTE_ONE' | 'SEQUENTIAL' | 'PARALLEL';
  tasks?: CreateTaskRequest[];
  parameters?: Record<string, unknown>;
}
```

**Example:**

```json
{
  "name": "Run Tests",
  "repository_url": "https://github.com/org/repo",
  "execution_mode": "SEQUENTIAL",
  "tasks": [
    {
      "name": "Install",
      "command": "npm install",
      "timeout_seconds": 300
    },
    {
      "name": "Test",
      "command": "npm test",
      "timeout_seconds": 600
    }
  ]
}
```

**Response:**

```typescript
interface OrchestrationCreatedResponse {
  id: string;
  name: string;
  status: 'PENDING';
  created_at: string;
}
```

---

### POST /api/v1/orchestrations/:id/cancel

Cancel a running orchestration.

**Purpose:** Terminate an active orchestration.

**Response:**

```typescript
interface OrchestrationCancelledResponse {
  id: string;
  status: 'PAUSED';
  cancelled_at: string;
}
```

---

## Telemetry Endpoints

### GET /api/v1/telemetry

Get platform telemetry metrics.

**Purpose:** Monitor platform resource usage and performance.

**Response:**

```typescript
interface TelemetryResponse {
  cpuUsage: number;        // Percentage (0-100)
  memoryUsage: number;     // Percentage (0-100)
  activeRequests: number;  // Current active requests
  queueDepth: number;      // Pending requests in queue
  timestamp: string;       // ISO 8601 timestamp
}
```

**Example:**

```json
{
  "cpuUsage": 45.5,
  "memoryUsage": 62.3,
  "activeRequests": 12,
  "queueDepth": 3,
  "timestamp": "2025-12-27T12:00:00Z"
}
```

**Dashboard Mapping:**

```typescript
interface UiTelemetryCard {
  cpuUsage: number;
  memoryUsage: number;
  activeRequests: number;
  queueDepth: number;
  timestamp: string;
  status: 'normal' | 'warning' | 'critical';
}
```

---

### GET /api/v1/metrics

Get historical metrics (if available).

**Purpose:** Retrieve time-series metrics for trend analysis.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `window` | string | No | Time window: `1h`, `24h`, `7d` |
| `granularity` | string | No | Data granularity: `1m`, `5m`, `1h` |

---

## Schema Specifications

### Orchestration Status Values

| Value | Description |
|-------|-------------|
| `PENDING` | Orchestration created, waiting to start |
| `RUNNING` | Currently executing |
| `COMPLETED` | Successfully completed |
| `FAILED` | Execution failed |
| `PAUSED` | Manually paused or cancelled |

### Execution Mode Values

| Value | Description |
|-------|-------------|
| `EXECUTE_ONE` | Single task execution |
| `SEQUENTIAL` | Tasks run in sequence |
| `PARALLEL` | Tasks run concurrently |

---

## Contract Evolution Policy

### Backward Compatibility Guarantees

The platform maintains backward compatibility for:
- Existing endpoint paths
- Required request fields
- Response field presence (new fields may be added)
- Error response structure

### Breaking Changes Policy

Breaking changes will:
1. Be announced 30 days in advance
2. Include version bump (e.g., v1 → v2)
3. Maintain deprecated endpoints for migration period

### Dashboard Resilience Requirements

The Dashboard MUST:
1. Handle unknown response fields gracefully (ignore unknown)
2. Provide Schema Drift diagnostics when unexpected fields appear
3. Show `unavailable` for metrics that cannot be computed
4. Never crash due to API shape changes

---

## Quick Reference

### Base URL
```
https://ai-execution-platform-production.up.railway.app
```

### Authentication Headers
```
x-api-key: <your-api-key>
x-request-id: <uuid-v4>
Content-Type: application/json
```

### Endpoint Quick List

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /health | No | Health check |
| GET | /ready | No | Readiness check |
| GET | /api/v1/orchestrations | Yes | List orchestrations |
| GET | /api/v1/orchestrations/:id | Yes | Get orchestration |
| POST | /api/v1/orchestrations | Yes | Create orchestration |
| POST | /api/v1/orchestrations/:id/cancel | Yes | Cancel orchestration |
| GET | /api/v1/telemetry | Yes | Get telemetry |
| GET | /api/v1/metrics | Yes | Get historical metrics |

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-12-27 | Initial contract document |

---

*Generated by Dashboard Integration Team*
