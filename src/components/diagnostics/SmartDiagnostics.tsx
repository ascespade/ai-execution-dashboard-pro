// Smart Diagnostic Components - Handle various error states gracefully
// Part of Phase 3: UX: Real Dashboard + Stability Signals
// Enhanced with Intelligence Layer integration

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  AlertTriangle, 
  WifiOff, 
  Key, 
  Clock, 
  Database, 
  RefreshCw, 
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  AlertCircle,
  XCircle,
  CheckCircle,
  ExternalLink,
  Copy,
  Download
} from 'lucide-react';
import { Button, Input, Card, Badge } from '@/components/ui';
import { useConfigStore } from '@/platform/stores';
import { useIntelligenceStore } from '@/intelligence/store';
import { runDiagnostics, type DiagnosticResult, type DegradationWarning, type RootCauseHint, type ReliabilityScore } from '@/intelligence/engine';
import { platformClient } from '@/platform/adapter';
import type { AppError } from '@/platform/adapter/apiClient';

// ============================================================================
// Auth Guard - Shows when 401/403 errors occur
// ============================================================================

interface AuthGuardProps {
  error: AppError | null;
  children: React.ReactNode;
}

export function AuthGuard({ error, children }: AuthGuardProps) {
  const { isConfigured, setApiKey } = useConfigStore();
  const [apiKey, setLocalApiKey] = useState('');

  const isAuthError = error?.kind === 'AUTH_REQUIRED' || error?.kind === 'AUTH_FORBIDDEN';

  if (!isAuthError) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      {/* Blurred content */}
      <div className="blur-sm select-none pointer-events-none opacity-50">
        {children}
      </div>

      {/* Auth required overlay */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl p-6 max-w-md mx-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-full">
              <Key className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Authentication Required
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Enter your API key to access the platform
              </p>
            </div>
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
            {error?.message || 'The platform API requires authentication. Please provide a valid x-api-key.'}
          </p>

          <div className="space-y-3">
            <Input
              type="password"
              placeholder="Enter your x-api-key"
              value={apiKey}
              onChange={(e) => setLocalApiKey(e.target.value)}
            />
            <Button
              variant="primary"
              className="w-full"
              onClick={() => {
                if (apiKey) {
                  setApiKey(apiKey);
                  window.location.reload();
                }
              }}
              disabled={!apiKey}
            >
              Authenticate
            </Button>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 text-center">
            You can also configure authentication via the Settings drawer
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Rate Limit Counter - Shows countdown for 429 errors
// ============================================================================

interface RateLimitCounterProps {
  retryAfter?: number;
  onRetry?: () => void;
}

export function RateLimitCounter({ retryAfter, onRetry }: RateLimitCounterProps) {
  const [remaining, setRemaining] = useState(retryAfter || 0);

  useEffect(() => {
    if (!retryAfter) return;

    setRemaining(retryAfter);
    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [retryAfter]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  if (!remaining) return null;

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
      <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
      <div className="flex-1">
        <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
          Rate Limited
        </p>
        <p className="text-xs text-amber-600 dark:text-amber-400">
          Please wait {formatTime(remaining)} before retrying
        </p>
      </div>
      {remaining === 0 && onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          leftIcon={<RefreshCw className="w-4 h-4" />}
        >
          Retry Now
        </Button>
      )}
    </div>
  );
}

// ============================================================================
// Offline Banner - Shows when network is unavailable
// ============================================================================

interface OfflineBannerProps {
  isOffline: boolean;
  onRetry?: () => void;
}

export function OfflineBanner({ isOffline, onRetry }: OfflineBannerProps) {
  if (!isOffline) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-3">
        <WifiOff className="w-5 h-5 text-slate-500" />
        <div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            You&apos;re offline
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Check your connection and try again
          </p>
        </div>
      </div>
      {onRetry && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRetry}
          leftIcon={<RefreshCw className="w-4 h-4" />}
        >
          Retry
        </Button>
      )}
    </div>
  );
}

// ============================================================================
// Schema Mismatch Banner - Shows when API response doesn't match expected shape
// ============================================================================

interface SchemaMismatchBannerProps {
  endpoint: string;
  missingFields: string[];
  receivedFields: string[];
  onDismiss?: () => void;
}

export function SchemaMismatchBanner({
  endpoint,
  missingFields,
  receivedFields,
  onDismiss,
}: SchemaMismatchBannerProps) {
  return (
    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium text-red-700 dark:text-red-300">
            API Response Mismatch
          </p>
          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
            The response from <code className="px-1 bg-red-100 dark:bg-red-900/40 rounded">{endpoint}</code> 
            {' '}doesn&apos;t match the expected format.
          </p>
          {missingFields.length > 0 && (
            <div className="mt-2">
              <p className="text-xs text-red-600 dark:text-red-400">
                Missing expected fields:
              </p>
              <div className="flex flex-wrap gap-1 mt-1">
                {missingFields.map((field) => (
                  <span
                    key={field}
                    className="px-2 py-0.5 text-xs bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded"
                  >
                    {field}
                  </span>
                ))}
              </div>
            </div>
          )}
          <p className="text-xs text-red-500 dark:text-red-400 mt-2">
            Received fields: {receivedFields.join(', ') || 'none'}
          </p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-red-400 hover:text-red-600"
          >
            <span className="sr-only">Dismiss</span>
            ×
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Connection Status Badge
// ============================================================================

interface ConnectionStatusBadgeProps {
  isConfigured: boolean;
  lastConnectionStatus: 'success' | 'failed' | null;
  isConnecting?: boolean;
}

export function ConnectionStatusBadge({
  isConfigured,
  lastConnectionStatus,
  isConnecting,
}: ConnectionStatusBadgeProps) {
  if (!isConfigured) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
        Not Configured
      </span>
    );
  }

  if (isConnecting) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
        <RefreshCw className="w-3 h-3 animate-spin" />
        Connecting...
      </span>
    );
  }

  if (lastConnectionStatus === 'success') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
        <CheckCircle2 className="w-3 h-3" />
        Connected
      </span>
    );
  }

  if (lastConnectionStatus === 'failed') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
        <AlertTriangle className="w-3 h-3" />
        Connection Failed
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
      Unknown
    </span>
  );
}

// ============================================================================
// Reliability Gauge Component
// ============================================================================

interface ReliabilityGaugeProps {
  score: ReliabilityScore;
}

export function ReliabilityGauge({ score }: ReliabilityGaugeProps) {
  const getColor = (s: number) => {
    if (s >= 80) return 'text-emerald-500';
    if (s >= 60) return 'text-amber-500';
    return 'text-red-500';
  };

  const getBgColor = (s: number) => {
    if (s >= 80) return 'bg-emerald-500';
    if (s >= 60) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'improving') return <TrendingUp className="w-4 h-4 text-emerald-500" />;
    if (trend === 'degrading') return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-slate-400" />;
  };

  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (score.score / 100) * circumference;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          Reliability Score
        </h3>
        {getTrendIcon(score.trend)}
      </div>

      <div className="relative flex items-center justify-center">
        <svg className="w-32 h-32 transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="64"
            cy="64"
            r="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-slate-200 dark:text-slate-700"
          />
          {/* Progress circle */}
          <circle
            cx="64"
            cy="64"
            r="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`${getColor(score.score)} transition-all duration-500`}
          />
        </svg>
        <div className="absolute text-center">
          <span className={`text-3xl font-bold ${getColor(score.score)}`}>
            {score.score}
          </span>
          <p className="text-xs text-slate-500 dark:text-slate-400">/ 100</p>
        </div>
      </div>

      {/* Score factors */}
      <div className="mt-4 space-y-2">
        {score.factors.map((factor) => (
          <div key={factor.name} className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 w-24 truncate">
              {factor.name}
            </span>
            <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${getBgColor(factor.value)}`}
                style={{ width: `${factor.value}%` }}
              />
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 w-8 text-right">
              {factor.value.toFixed(0)}
            </span>
          </div>
        ))}
      </div>

      <p className="text-xs text-slate-400 dark:text-slate-500 mt-4 text-center">
        Last updated: {new Date(score.lastUpdated).toLocaleTimeString()}
      </p>
    </Card>
  );
}

// ============================================================================
// Warning Card Component
// ============================================================================

interface WarningCardProps {
  warning: DegradationWarning;
  onDismiss?: () => void;
  onAcknowledge?: () => void;
}

export function WarningCard({ warning, onDismiss, onAcknowledge }: WarningCardProps) {
  const severityColors = {
    INFO: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
    WARN: 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800',
    CRIT: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
  };

  const severityIconColors = {
    INFO: 'text-blue-600 dark:text-blue-400',
    WARN: 'text-amber-600 dark:text-amber-400',
    CRIT: 'text-red-600 dark:text-red-400',
  };

  const severityBadgeColors = {
    INFO: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    WARN: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    CRIT: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  };

  return (
    <div className={`p-4 border rounded-lg ${severityColors[warning.severity]}`}>
      <div className="flex items-start gap-3">
        <AlertCircle className={`w-5 h-5 mt-0.5 ${severityIconColors[warning.severity]}`} />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 text-xs font-medium rounded ${severityBadgeColors[warning.severity]}`}>
              {warning.severity}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {warning.code}
            </span>
          </div>
          <p className="text-sm font-medium text-slate-900 dark:text-white">
            {warning.title}
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
            {warning.description}
          </p>
          <div className="mt-2">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Evidence:
            </p>
            <ul className="list-disc list-inside text-xs text-slate-600 dark:text-slate-300 mt-1">
              {warning.evidence.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
            Threshold: {warning.threshold}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {onAcknowledge && (
            <Button variant="ghost" size="sm" onClick={onAcknowledge}>
              Acknowledge
            </Button>
          )}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-slate-400 hover:text-slate-600"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Root Cause Card Component
// ============================================================================

interface RootCauseCardProps {
  rootCause: RootCauseHint;
}

export function RootCauseCard({ rootCause }: RootCauseCardProps) {
  const getActionIcon = (type: string) => {
    switch (type) {
      case 'config': return <Key className="w-4 h-4" />;
      case 'retry': return <RefreshCw className="w-4 h-4" />;
      case 'contact': return <ExternalLink className="w-4 h-4" />;
      case 'docs': return <Database className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="w-5 h-5 text-amber-500" />
        <span className="font-medium text-slate-900 dark:text-white">
          {rootCause.cause}
        </span>
        <Badge variant="neutral" className="ml-auto">
          {(rootCause.confidence * 100).toFixed(0)}% confidence
        </Badge>
      </div>

      <div className="space-y-2 mb-4">
        {rootCause.evidence.map((e, i) => (
          <p key={i} className="text-xs text-slate-600 dark:text-slate-300">
            • {e}
          </p>
        ))}
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
          Recommended Actions:
        </p>
        {rootCause.remediation.map((action, i) => (
          <div
            key={i}
            className="flex items-start gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg"
          >
            {getActionIcon(action.actionType)}
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                {action.title}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {action.description}
              </p>
              {action.link && (
                <a
                  href={action.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1 mt-1"
                >
                  View docs <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ============================================================================
// Smart Diagnostics Panel - Enhanced with Intelligence Layer
// ============================================================================

interface SmartDiagnosticsProps {
  className?: string;
}

export function SmartDiagnostics({ className }: SmartDiagnosticsProps) {
  const {
    telemetryHistory,
    orchestrationHistory,
    requestTrace,
    healthHistory,
    activeWarnings,
    latestDiagnostics,
    updateDiagnostics,
    acknowledgeWarning,
    dismissWarning,
    diagnosticsEnabled,
  } = useIntelligenceStore();

  // Run diagnostics when data changes
  useEffect(() => {
    if (!diagnosticsEnabled) return;

    const result = runDiagnostics(
      requestTrace,
      telemetryHistory,
      orchestrationHistory.map(o => ({
        id: o.id,
        name: o.name,
        status: o.status,
        createdAt: o.createdAt,
        completedAt: o.completedAt,
        duration_seconds: o.duration_seconds,
        error_message: o.error_message,
      })),
      healthHistory
    );

    updateDiagnostics(result);
  }, [telemetryHistory, orchestrationHistory, requestTrace, healthHistory, diagnosticsEnabled, updateDiagnostics]);

  // Get latest diagnostics or run once
  const diagnostics = latestDiagnostics;

  if (!diagnostics) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <Activity className="w-5 h-5 text-slate-500" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            System Diagnostics
          </h3>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Collecting data to generate diagnostics...
        </p>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Verdict Banner */}
      <Card className={`p-4 ${
        diagnostics.verdict === 'GREEN' ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' :
        diagnostics.verdict === 'YELLOW' ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' :
        'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
      }`}>
        <div className="flex items-center gap-3">
          {diagnostics.verdict === 'GREEN' ? (
            <CheckCircle className="w-6 h-6 text-emerald-500" />
          ) : diagnostics.verdict === 'YELLOW' ? (
            <AlertTriangle className="w-6 h-6 text-amber-500" />
          ) : (
            <XCircle className="w-6 h-6 text-red-500" />
          )}
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">
              System Status: {diagnostics.verdict}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Reliability Score: {diagnostics.reliabilityScore.score}/100
              {diagnostics.reliabilityScore.trend !== 'stable' && (
                <span className="ml-2">
                  ({diagnostics.reliabilityScore.trend})
                </span>
              )}
            </p>
          </div>
        </div>
      </Card>

      {/* Active Warnings */}
      {diagnostics.warnings.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Active Warnings ({diagnostics.warnings.length})
          </h4>
          {diagnostics.warnings.map((warning) => (
            <WarningCard
              key={warning.id}
              warning={warning}
              onAcknowledge={() => acknowledgeWarning(warning.id)}
              onDismiss={() => dismissWarning(warning.id)}
            />
          ))}
        </div>
      )}

      {/* Root Causes */}
      {diagnostics.rootCauses.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Potential Root Causes
          </h4>
          {diagnostics.rootCauses.map((cause, i) => (
            <RootCauseCard key={i} rootCause={cause} />
          ))}
        </div>
      )}

      {/* Debug Bundle Export */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const debugBundle = {
              diagnostics,
              telemetry: telemetryHistory.slice(-20),
              trace: requestTrace.slice(-20),
              exportedAt: new Date().toISOString(),
            };
            navigator.clipboard.writeText(JSON.stringify(debugBundle, null, 2));
          }}
          leftIcon={<Copy className="w-4 h-4" />}
        >
          Copy Debug Bundle
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const debugBundle = {
              diagnostics,
              telemetry: telemetryHistory.slice(-20),
              trace: requestTrace.slice(-20),
              exportedAt: new Date().toISOString(),
            };
            const blob = new Blob([JSON.stringify(debugBundle, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `debug-bundle-${Date.now()}.json`;
            a.click();
          }}
          leftIcon={<Download className="w-4 h-4" />}
        >
          Export Bundle
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// Request Trace Viewer
// ============================================================================

interface RequestTraceViewerProps {
  maxEntries?: number;
}

export function RequestTraceViewer({ maxEntries = 20 }: RequestTraceViewerProps) {
  const requestTrace = useIntelligenceStore(state => state.requestTrace);
  const clearTrace = useIntelligenceStore(state => state.clearTrace);

  const entries = requestTrace.slice(0, maxEntries);

  const getStatusColor = (status?: number, error?: string) => {
    if (error) return 'text-red-500';
    if (status && status >= 200 && status < 400) return 'text-emerald-500';
    if (status && status >= 400) return 'text-amber-500';
    return 'text-slate-500';
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-slate-500" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Request Trace
          </h3>
          <Badge variant="neutral">{entries.length}</Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearTrace}
        >
          Clear
        </Button>
      </div>

      <div className="space-y-1 max-h-64 overflow-y-auto">
        {entries.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
            No requests recorded yet
          </p>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="text-slate-500 dark:text-slate-400">
                <th className="text-left py-2">Method</th>
                <th className="text-left py-2">Path</th>
                <th className="text-right py-2">Status</th>
                <th className="text-right py-2">Latency</th>
                <th className="text-right py-2">Time</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.requestId} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="py-1 font-mono text-slate-600 dark:text-slate-300">
                    {entry.method}
                  </td>
                  <td className="py-1 font-mono text-slate-600 dark:text-slate-300 truncate max-w-[200px]">
                    {entry.path}
                  </td>
                  <td className={`py-1 text-right ${getStatusColor(entry.status, entry.error)}`}>
                    {entry.error || entry.status || '-'}
                  </td>
                  <td className="py-1 text-right text-slate-500 dark:text-slate-400">
                    {entry.latency}ms
                  </td>
                  <td className="py-1 text-right text-slate-400">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Card>
  );
}
