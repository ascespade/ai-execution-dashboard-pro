// Global Status Component - Top-level platform health indicators
// Part of Phase 3: UX: Real Dashboard + Stability Signals

'use client';

import React from 'react';
import { Activity, Server, Database, Shield, Wifi, WifiOff } from 'lucide-react';
import { usePlatformHealth, usePlatformReadiness, usePlatformTelemetry } from '@/platform/adapter/hooks';
import { useConfigStore, selectIsConfigured } from '@/platform/stores';
import { ConnectionStatusBadge } from '@/components/diagnostics';
import { ReliabilityGauge } from '@/components/dashboard/reliability';

interface GlobalStatusProps {
  className?: string;
}

export function GlobalStatus({ className = '' }: GlobalStatusProps) {
  const isConfigured = useConfigStore(selectIsConfigured);
  const { data: health, isLoading: healthLoading } = usePlatformHealth();
  const { data: readiness, isLoading: readinessLoading } = usePlatformReadiness();
  const { data: telemetry, isLoading: telemetryLoading } = usePlatformTelemetry();
  const { lastConnectionStatus, lastConnectionTime } = useConfigStore();

  if (!isConfigured) {
    return (
      <div className={`bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 ${className}`}>
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <WifiOff className="w-8 h-8 mx-auto text-slate-400 mb-2" />
            <p className="text-slate-600 dark:text-slate-400">
              Platform not configured
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
              Open settings to configure your API connection
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-slate-900 dark:text-white">
          Global Status
        </h3>
        <ConnectionStatusBadge
          isConfigured={isConfigured}
          lastConnectionStatus={lastConnectionStatus}
        />
      </div>

      {/* Status Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* API Health */}
        <StatusCard
          title="API Health"
          icon={Server}
          loading={healthLoading}
          status={health?.status}
          latency={health?.latency}
          color={health?.status === 'healthy' ? 'emerald' : health?.status === 'degraded' ? 'amber' : 'red'}
        />

        {/* Readiness */}
        <StatusCard
          title="Readiness"
          icon={Database}
          loading={readinessLoading}
          status={readiness?.isReady ? 'ready' : 'not_ready'}
          color={readiness?.isReady ? 'emerald' : 'amber'}
        />

        {/* Telemetry */}
        <StatusCard
          title="CPU Usage"
          icon={Activity}
          loading={telemetryLoading}
          status={telemetry ? `${telemetry.cpuUsage.toFixed(0)}%` : undefined}
          color={telemetry && telemetry.cpuUsage > 90 ? 'red' : telemetry && telemetry.cpuUsage > 70 ? 'amber' : 'emerald'}
          subtitle={telemetry ? `${telemetry.activeRequests} requests` : undefined}
        />

        {/* Reliability Score */}
        <div className="flex justify-center">
          <ReliabilityGauge size="lg" showLabel showDetails />
        </div>
      </div>

      {/* Timestamp */}
      {health?.timestamp && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 text-center">
          Last updated: {new Date(health.timestamp).toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}

// ============================================================================
// Status Card Subcomponent
// ============================================================================

interface StatusCardProps {
  title: string;
  icon: React.ElementType;
  loading: boolean;
  status?: string | boolean;
  latency?: number;
  color?: 'emerald' | 'amber' | 'red' | 'blue';
  subtitle?: string;
}

function StatusCard({ title, icon: Icon, loading, status, latency, color = 'emerald', subtitle }: StatusCardProps) {
  const colorClasses = {
    emerald: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20',
    amber: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20',
    red: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20',
    blue: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20',
  };

  const statusText = status === true || status === 'ready' ? 'Ready' : status === false || status === 'not_ready' ? 'Not Ready' : status;

  if (loading) {
    return (
      <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 animate-pulse">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-4 h-4 bg-slate-200 dark:bg-slate-600 rounded" />
          <div className="h-4 bg-slate-200 dark:bg-slate-600 rounded w-16" />
        </div>
        <div className="h-6 bg-slate-200 dark:bg-slate-600 rounded w-20" />
      </div>
    );
  }

  return (
    <div className={`rounded-lg p-4 ${colorClasses[color]}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4" />
        <span className="text-xs font-medium opacity-80">{title}</span>
      </div>
      <p className="text-lg font-bold">{statusText || '--'}</p>
      {(latency !== undefined || subtitle) && (
        <p className="text-xs opacity-70 mt-1">
          {latency !== undefined && `${latency}ms`}
          {latency !== undefined && subtitle && ' • '}
          {subtitle}
        </p>
      )}
    </div>
  );
}
