// Intelligence Engine - Predictive Diagnostics and Reliability Scoring
// Pure functions for trend analysis, stability scoring, and root cause detection

import type { AppError, ErrorKind } from '@/platform/adapter/apiClient';

// ============================================================================
// Types
// ============================================================================

export interface TelemetryPoint {
  timestamp: string;
  cpuUsage: number;
  memoryUsage: number;
  activeRequests: number;
  queueDepth: number;
}

export interface OrchestrationEvent {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
  createdAt: string;
  completedAt?: string;
  duration_seconds?: number;
  error_message?: string;
}

export interface RequestEvent {
  method: string;
  path: string;
  status?: number;
  error?: ErrorKind;
  latency: number;
  requestId: string;
  timestamp: string;
}

export interface HealthEvent {
  status: 'healthy' | 'degraded' | 'unhealthy';
  latency: number;
  timestamp: string;
}

// Trend Analysis Results
export interface TrendAnalysis {
  successRate: number;
  timeoutRate: number;
  authFailureRate: number;
  serverErrorRate: number;
  schemaDriftRate: number;
  avgLatency: number;
  latencyTrend: 'stable' | 'increasing' | 'decreasing';
  errorTrend: 'stable' | 'increasing' | 'decreasing';
}

// Degradation Warning
export interface DegradationWarning {
  id: string;
  severity: 'INFO' | 'WARN' | 'CRIT';
  code: string;
  title: string;
  description: string;
  evidence: string[];
  threshold: string;
  timestamp: string;
}

// Root Cause Hint
export interface RootCauseHint {
  cause: string;
  confidence: number;
  evidence: string[];
  remediation: RemediationAction[];
}

export interface RemediationAction {
  title: string;
  description: string;
  link?: string;
  actionType: 'config' | 'retry' | 'contact' | 'docs' | 'diagnostic';
}

// Reliability Score
export interface ReliabilityScore {
  score: number; // 0-100
  trend: 'improving' | 'stable' | 'degrading';
  factors: ScoreFactor[];
  lastUpdated: string;
}

export interface ScoreFactor {
  name: string;
  value: number;
  weight: number;
  contribution: number;
}

// Diagnostic Result
export interface DiagnosticResult {
  verdict: 'GREEN' | 'YELLOW' | 'RED';
  reliabilityScore: ReliabilityScore;
  warnings: DegradationWarning[];
  rootCauses: RootCauseHint[];
  recentEvents: RequestEvent[];
  recommendations: RemediationAction[];
}

// Time window configuration
export interface TimeWindowConfig {
  analysisMinutes: number;    // How far back to analyze
  warningWindowMinutes: number; // Window for warning detection
  decayHalfLifeMinutes: number; // Score decay half-life
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_TIME_WINDOW: TimeWindowConfig = {
  analysisMinutes: 15,        // 15 minute rolling window
  warningWindowMinutes: 5,    // 5 minute window for warnings
  decayHalfLifeMinutes: 30,   // Score decays over 30 minutes
};

const THRESHOLDS = {
  successRateCritical: 0.80,   // Below 80% is critical
  successRateWarning: 0.90,    // Below 90% triggers warning
  timeoutRateWarning: 0.05,    // Above 5% timeouts triggers warning
  latencyIncreasePercent: 20,  // 20% latency increase triggers warning
  authFailureRateWarning: 0.02, // Above 2% auth failures
  serverErrorRateWarning: 0.05, // Above 5% server errors
  queueDepthWarning: 10,       // Above 10 queue depth
  cpuUsageWarning: 70,         // Above 70% CPU
  memoryUsageWarning: 80,      // Above 80% memory
};

// ============================================================================
// Pure Functions - Trend Analysis
// ============================================================================

/**
 * Analyze trends from a window of events
 */
export function analyzeTrends(
  events: RequestEvent[],
  timeWindow: TimeWindowConfig = DEFAULT_TIME_WINDOW
): TrendAnalysis {
  const now = Date.now();
  const windowStart = new Date(now - timeWindow.analysisMinutes * 60 * 1000).toISOString();
  
  const windowedEvents = events.filter(e => e.timestamp >= windowStart);
  
  if (windowedEvents.length === 0) {
    return {
      successRate: 1,
      timeoutRate: 0,
      authFailureRate: 0,
      serverErrorRate: 0,
      schemaDriftRate: 0,
      avgLatency: 0,
      latencyTrend: 'stable',
      errorTrend: 'stable',
    };
  }

  const total = windowedEvents.length;
  const successful = windowedEvents.filter(e => e.status && e.status >= 200 && e.status < 400).length;
  const timeouts = windowedEvents.filter(e => e.error === 'TIMEOUT').length;
  const authFailures = windowedEvents.filter(e => 
    e.error === 'AUTH_REQUIRED' || e.error === 'AUTH_FORBIDDEN'
  ).length;
  const serverErrors = windowedEvents.filter(e => e.error === 'SERVER_5XX').length;
  const schemaDrifts = windowedEvents.filter(e => e.error === 'SCHEMA_DRIFT').length;

  const latencies = windowedEvents.map(e => e.latency);
  const avgLatency = latencies.length > 0 
    ? latencies.reduce((a, b) => a + b, 0) / latencies.length 
    : 0;

  // Calculate latency trend by comparing first half vs second half
  const midpoint = Math.floor(windowedEvents.length / 2);
  const firstHalf = windowedEvents.slice(0, midpoint);
  const secondHalf = windowedEvents.slice(midpoint);

  const firstAvgLatency = firstHalf.length > 0 
    ? firstHalf.reduce((a, b) => a + b.latency, 0) / firstHalf.length 
    : avgLatency;
  const secondAvgLatency = secondHalf.length > 0 
    ? secondHalf.reduce((a, b) => a + b.latency, 0) / secondHalf.length 
    : avgLatency;

  let latencyTrend: 'stable' | 'increasing' | 'decreasing' = 'stable';
  if (firstAvgLatency > 0 && secondAvgLatency > 0) {
    const latencyChange = (secondAvgLatency - firstAvgLatency) / firstAvgLatency;
    if (latencyChange > THRESHOLDS.latencyIncreasePercent / 100) {
      latencyTrend = 'increasing';
    } else if (latencyChange < -THRESHOLDS.latencyIncreasePercent / 100) {
      latencyTrend = 'decreasing';
    }
  }

  // Error trend
  const firstHalfErrors = firstHalf.filter(e => e.error).length / (firstHalf.length || 1);
  const secondHalfErrors = secondHalf.filter(e => e.error).length / (secondHalf.length || 1);
  
  let errorTrend: 'stable' | 'increasing' | 'decreasing' = 'stable';
  if (secondHalfErrors > firstHalfErrors * 1.2) {
    errorTrend = 'increasing';
  } else if (secondHalfErrors < firstHalfErrors * 0.8) {
    errorTrend = 'decreasing';
  }

  return {
    successRate: successful / total,
    timeoutRate: timeouts / total,
    authFailureRate: authFailures / total,
    serverErrorRate: serverErrors / total,
    schemaDriftRate: schemaDrifts / total,
    avgLatency,
    latencyTrend,
    errorTrend,
  };
}

// ============================================================================
// Pure Functions - Degradation Detection
// ============================================================================

/**
 * Detect degradations based on thresholds
 */
export function detectDegradations(
  trends: TrendAnalysis,
  telemetry: TelemetryPoint[],
  health: HealthEvent[],
  timeWindow: TimeWindowConfig = DEFAULT_TIME_WINDOW
): DegradationWarning[] {
  const warnings: DegradationWarning[] = [];
  const now = Date.now();
  const warningWindowStart = new Date(now - timeWindow.warningWindowMinutes * 60 * 1000).toISOString();

  // Success rate degradation
  if (trends.successRate < THRESHOLDS.successRateCritical) {
    warnings.push({
      id: `warn-${Date.now()}-success-critical`,
      severity: 'CRIT',
      code: 'HIGH_FAILURE_RATE',
      title: 'Critical Failure Rate Detected',
      description: `Success rate has dropped to ${(trends.successRate * 100).toFixed(1)}%, which is below the critical threshold of ${THRESHOLDS.successRateCritical * 100}%`,
      evidence: [
        `Success Rate: ${(trends.successRate * 100).toFixed(1)}%`,
        `Error Trend: ${trends.errorTrend}`,
      ],
      threshold: `Expected > ${THRESHOLDS.successRateCritical * 100}%`,
      timestamp: new Date().toISOString(),
    });
  } else if (trends.successRate < THRESHOLDS.successRateWarning) {
    warnings.push({
      id: `warn-${Date.now()}-success-warning`,
      severity: 'WARN',
      code: 'ELEVATED_FAILURE_RATE',
      title: 'Elevated Failure Rate',
      description: `Success rate is ${(trends.successRate * 100).toFixed(1)}%, below the warning threshold of ${THRESHOLDS.successRateWarning * 100}%`,
      evidence: [
        `Success Rate: ${(trends.successRate * 100).toFixed(1)}%`,
      ],
      threshold: `Expected > ${THRESHOLDS.successRateWarning * 100}%`,
      timestamp: new Date().toISOString(),
    });
  }

  // Timeout rate
  if (trends.timeoutRate > THRESHOLDS.timeoutRateWarning) {
    warnings.push({
      id: `warn-${Date.now()}-timeout`,
      severity: 'WARN',
      code: 'HIGH_TIMEOUT_RATE',
      title: 'High Request Timeout Rate',
      description: `${(trends.timeoutRate * 100).toFixed(1)}% of requests are timing out`,
      evidence: [
        `Timeout Rate: ${(trends.timeoutRate * 100).toFixed(1)}%`,
        `Average Latency: ${trends.avgLatency.toFixed(0)}ms`,
      ],
      threshold: `Expected < ${THRESHOLDS.timeoutRateWarning * 100}%`,
      timestamp: new Date().toISOString(),
    });
  }

  // Latency trend
  if (trends.latencyTrend === 'increasing') {
    warnings.push({
      id: `warn-${Date.now()}-latency`,
      severity: 'WARN',
      code: 'LATENCY_INCREASE',
      title: 'Response Latency Increasing',
      description: 'Request latency is trending upward over the analysis window',
      evidence: [
        `Latency Trend: ${trends.latencyTrend}`,
        `Average Latency: ${trends.avgLatency.toFixed(0)}ms`,
      ],
      threshold: `Expected stable or decreasing latency`,
      timestamp: new Date().toISOString(),
    });
  }

  // Auth failures
  if (trends.authFailureRate > THRESHOLDS.authFailureRateWarning) {
    warnings.push({
      id: `warn-${Date.now()}-auth`,
      severity: 'WARN',
      code: 'AUTH_FAILURES',
      title: 'Elevated Authentication Failures',
      description: `${(trends.authFailureRate * 100).toFixed(1)}% of requests are failing authentication`,
      evidence: [
        `Auth Failure Rate: ${(trends.authFailureRate * 100).toFixed(1)}%`,
      ],
      threshold: `Expected < ${THRESHOLDS.authFailureRateWarning * 100}%`,
      timestamp: new Date().toISOString(),
    });
  }

  // Server errors
  if (trends.serverErrorRate > THRESHOLDS.serverErrorRateWarning) {
    warnings.push({
      id: `warn-${Date.now()}-server`,
      severity: 'CRIT',
      code: 'HIGH_SERVER_ERROR_RATE',
      title: 'High Server Error Rate',
      description: `${(trends.serverErrorRate * 100).toFixed(1)}% of requests are resulting in server errors (5xx)`,
      evidence: [
        `Server Error Rate: ${(trends.serverErrorRate * 100).toFixed(1)}%`,
      ],
      threshold: `Expected < ${THRESHOLDS.serverErrorRateWarning * 100}%`,
      timestamp: new Date().toISOString(),
    });
  }

  // Schema drift
  if (trends.schemaDriftRate > 0) {
    warnings.push({
      id: `warn-${Date.now()}-schema`,
      severity: 'WARN',
      code: 'SCHEMA_DRIFT',
      title: 'API Schema Drift Detected',
      description: `${(trends.schemaDriftRate * 100).toFixed(1)}% of responses don't match expected schema`,
      evidence: [
        `Schema Drift Rate: ${(trends.schemaDriftRate * 100).toFixed(1)}%`,
      ],
      threshold: `Expected 0% drift`,
      timestamp: new Date().toISOString(),
    });
  }

  // Telemetry-based warnings
  if (telemetry.length > 0) {
    const recentTelemetry = telemetry.filter(t => t.timestamp >= warningWindowStart);
    
    if (recentTelemetry.length > 0) {
      const avgCpu = recentTelemetry.reduce((a, b) => a + b.cpuUsage, 0) / recentTelemetry.length;
      const avgMem = recentTelemetry.reduce((a, b) => a + b.memoryUsage, 0) / recentTelemetry.length;
      const avgQueue = recentTelemetry.reduce((a, b) => a + b.queueDepth, 0) / recentTelemetry.length;

      if (avgCpu > THRESHOLDS.cpuUsageWarning) {
        warnings.push({
          id: `warn-${Date.now()}-cpu`,
          severity: 'WARN',
          code: 'HIGH_CPU_USAGE',
          title: 'High CPU Usage',
          description: `Average CPU usage is ${avgCpu.toFixed(1)}%`,
          evidence: [
            `CPU Usage: ${avgCpu.toFixed(1)}%`,
          ],
          threshold: `Expected < ${THRESHOLDS.cpuUsageWarning}%`,
          timestamp: new Date().toISOString(),
        });
      }

      if (avgMem > THRESHOLDS.memoryUsageWarning) {
        warnings.push({
          id: `warn-${Date.now()}-memory`,
          severity: 'WARN',
          code: 'HIGH_MEMORY_USAGE',
          title: 'High Memory Usage',
          description: `Average memory usage is ${avgMem.toFixed(1)}%`,
          evidence: [
            `Memory Usage: ${avgMem.toFixed(1)}%`,
          ],
          threshold: `Expected < ${THRESHOLDS.memoryUsageWarning}%`,
          timestamp: new Date().toISOString(),
        });
      }

      if (avgQueue > THRESHOLDS.queueDepthWarning) {
        warnings.push({
          id: `warn-${Date.now()}-queue`,
          severity: 'WARN',
          code: 'HIGH_QUEUE_DEPTH',
          title: 'Request Queue Building Up',
          description: `Average queue depth is ${avgQueue.toFixed(1)}`,
          evidence: [
            `Queue Depth: ${avgQueue.toFixed(1)}`,
          ],
          threshold: `Expected < ${THRESHOLDS.queueDepthWarning}`,
          timestamp: new Date().toISOString(),
        });
      }
    }
  }

  return warnings;
}

// ============================================================================
// Pure Functions - Root Cause Analysis
// ============================================================================

/**
 * Generate root cause hints based on error patterns
 */
export function generateRootCauseHints(
  trends: TrendAnalysis,
  warnings: DegradationWarning[],
  recentErrors: RequestEvent[]
): RootCauseHint[] {
  const hints: RootCauseHint[] = [];

  // Check for authentication issues
  const authErrors = recentErrors.filter(e => 
    e.error === 'AUTH_REQUIRED' || e.error === 'AUTH_FORBIDDEN'
  );
  
  if (authErrors.length > 0) {
    hints.push({
      cause: 'Missing or Invalid API Key',
      confidence: 0.95,
      evidence: [
        `${authErrors.length} authentication failures detected`,
        'x-api-key header may be missing or incorrect',
      ],
      remediation: [
        {
          title: 'Configure API Key',
          description: 'Open settings and configure your x-api-key',
          actionType: 'config',
        },
        {
          title: 'View Documentation',
          description: 'Learn how to obtain an API key',
          link: '/docs/PLATFORM_CONTRACT_MAP.md#authentication',
          actionType: 'docs',
        },
      ],
    });
  }

  // Check for rate limiting
  const rateLimitErrors = recentErrors.filter(e => e.error === 'RATE_LIMIT');
  
  if (rateLimitErrors.length > 0) {
    hints.push({
      cause: 'Rate Limit Exceeded',
      confidence: 0.90,
      evidence: [
        `${rateLimitErrors.length} rate limit responses received`,
        'Consider implementing exponential backoff',
      ],
      remediation: [
        {
          title: 'Wait and Retry',
          description: 'The platform enforces rate limits. Wait before retrying.',
          actionType: 'retry',
        },
        {
          title: 'Contact Support',
          description: 'Request a rate limit increase for your use case',
          actionType: 'contact',
        },
      ],
    });
  }

  // Check for network/timeout issues
  const timeoutErrors = recentErrors.filter(e => 
    e.error === 'TIMEOUT' || e.error === 'NETWORK'
  );
  
  if (timeoutErrors.length > 0) {
    hints.push({
      cause: 'Network Connectivity or Platform Unavailable',
      confidence: 0.80,
      evidence: [
        `${timeoutErrors.length} timeout/network errors detected`,
        'Average latency may be too high',
      ],
      remediation: [
        {
          title: 'Check Platform Status',
          description: 'Verify the platform API is reachable',
          actionType: 'diagnostic',
        },
        {
          title: 'Retry with Backoff',
          description: 'Implement exponential backoff retry logic',
          actionType: 'retry',
        },
      ],
    });
  }

  // Check for schema drift
  const schemaErrors = recentErrors.filter(e => e.error === 'SCHEMA_DRIFT');
  
  if (schemaErrors.length > 0) {
    hints.push({
      cause: 'API Schema Mismatch',
      confidence: 0.85,
      evidence: [
        `${schemaErrors.length} schema drift events detected`,
        'API response format may have changed',
      ],
      remediation: [
        {
          title: 'Check Contract Map',
          description: 'Review the expected API schema',
          link: '/docs/PLATFORM_CONTRACT_MAP.md',
          actionType: 'docs',
        },
        {
          title: 'View Drift Details',
          description: 'Check the diagnostics panel for specific field mismatches',
          actionType: 'diagnostic',
        },
      ],
    });
  }

  // Check for high server errors
  if (trends.serverErrorRate > THRESHOLDS.serverErrorRateWarning) {
    hints.push({
      cause: 'Platform Server Errors',
      confidence: 0.75,
      evidence: [
        `${(trends.serverErrorRate * 100).toFixed(1)}% server error rate`,
        'The platform may be experiencing issues',
      ],
      remediation: [
        {
          title: 'Check Platform Status',
          description: 'Verify the platform is operational',
          actionType: 'diagnostic',
        },
        {
          title: 'Wait and Retry',
          description: 'Server errors are typically temporary',
          actionType: 'retry',
        },
      ],
    });
  }

  return hints;
}

// ============================================================================
// Pure Functions - Reliability Scoring
// ============================================================================

/**
 * Calculate reliability score (0-100)
 */
export function calculateReliabilityScore(
  trends: TrendAnalysis,
  orchestrations: OrchestrationEvent[],
  timeWindow: TimeWindowConfig = DEFAULT_TIME_WINDOW
): ReliabilityScore {
  const now = Date.now();
  const windowStart = new Date(now - timeWindow.analysisMinutes * 60 * 1000).toISOString();
  
  // Filter orchestrations in window
  const recentOrchs = orchestrations.filter(o => o.createdAt >= windowStart);
  
  // Base score from success rate (0-100)
  const successScore = trends.successRate * 100;
  
  // Factor in completion rate
  const completed = recentOrchs.filter(o => o.status === 'completed').length;
  const total = recentOrchs.length || 1;
  const completionRate = completed / total;
  
  // Factor in latency (penalize high latency)
  const latencyPenalty = trends.avgLatency > 1000 
    ? Math.min(20, (trends.avgLatency - 1000) / 500) 
    : 0;
  
  // Factor in error trends
  const errorTrendPenalty = trends.errorTrend === 'increasing' ? 15 : 
    trends.errorTrend === 'decreasing' ? -5 : 0;
  
  // Calculate base score
  let score = successScore * 0.5 + completionRate * 100 * 0.3 - latencyPenalty + errorTrendPenalty;
  
  // Normalize to 0-100
  score = Math.max(0, Math.min(100, score));
  
  // Determine trend
  const trend = errorTrendPenalty > 0 ? 'degrading' : 
    errorTrendPenalty < 0 ? 'improving' : 'stable';
  
  return {
    score: Math.round(score),
    trend,
    factors: [
      {
        name: 'Success Rate',
        value: trends.successRate * 100,
        weight: 0.5,
        contribution: trends.successRate * 50,
      },
      {
        name: 'Completion Rate',
        value: completionRate * 100,
        weight: 0.3,
        contribution: completionRate * 30,
      },
      {
        name: 'Latency',
        value: Math.max(0, 100 - latencyPenalty * 5),
        weight: 0.1,
        contribution: Math.max(0, 10 - latencyPenalty * 0.5),
      },
      {
        name: 'Error Trend',
        value: Math.max(0, 100 - Math.max(0, errorTrendPenalty) * 2),
        weight: 0.1,
        contribution: Math.max(0, 10 - Math.max(0, errorTrendPenalty) * 0.2),
      },
    ],
    lastUpdated: new Date().toISOString(),
  };
}

// ============================================================================
// Main Diagnostic Function
// ============================================================================

/**
 * Generate comprehensive diagnostic result
 */
export function runDiagnostics(
  requests: RequestEvent[],
  telemetry: TelemetryPoint[],
  orchestrations: OrchestrationEvent[],
  health: HealthEvent[]
): DiagnosticResult {
  // Analyze trends
  const trends = analyzeTrends(requests);
  
  // Detect degradations
  const warnings = detectDegradations(trends, telemetry, health);
  
  // Generate root cause hints
  const rootCauses = generateRootCauseHints(trends, warnings, requests);
  
  // Calculate reliability score
  const reliabilityScore = calculateReliabilityScore(trends, orchestrations);
  
  // Determine verdict
  let verdict: 'GREEN' | 'YELLOW' | 'RED' = 'GREEN';
  const criticalWarnings = warnings.filter(w => w.severity === 'CRIT');
  const warnWarnings = warnings.filter(w => w.severity === 'WARN');
  
  if (criticalWarnings.length > 0 || reliabilityScore.score < 50) {
    verdict = 'RED';
  } else if (warnWarnings.length > 0 || reliabilityScore.score < 80) {
    verdict = 'YELLOW';
  }
  
  // Generate recommendations
  const recommendations: RemediationAction[] = [];
  
  if (verdict !== 'GREEN') {
    for (const cause of rootCauses) {
      recommendations.push(...cause.remediation);
    }
  }
  
  // Deduplicate recommendations
  const uniqueRecommendations = recommendations.filter(
    (rec, index, self) => 
      index === self.findIndex(r => r.title === rec.title)
  );

  return {
    verdict,
    reliabilityScore,
    warnings,
    rootCauses,
    recentEvents: requests.slice(-20),
    recommendations: uniqueRecommendations,
  };
}

// ============================================================================
// Helper: Deduplicate recommendations
// ============================================================================

function deduplicateRecommendations(recommendations: RemediationAction[]): RemediationAction[] {
  return recommendations.filter(
    (rec, index, self) => 
      index === self.findIndex(r => r.title === rec.title)
  );
}
