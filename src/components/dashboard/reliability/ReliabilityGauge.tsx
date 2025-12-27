// Reliability Score Component - Visual display of system reliability
// Part of Phase 3: UX: Real Dashboard + Stability Signals

'use client';

import React from 'react';
import { useReliabilityStore, selectScore, selectIsHealthy, getHealthStatus, getHealthStatusColor, getHealthStatusBg, type HealthStatus } from '@/platform/stores';

interface ReliabilityGaugeProps {
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showDetails?: boolean;
}

export function ReliabilityGauge({ size = 'md', showLabel = true, showDetails = false }: ReliabilityGaugeProps) {
  const score = useReliabilityStore(selectScore);
  const isHealthy = useReliabilityStore(selectIsHealthy);
  const healthStatus = getHealthStatus(score);
  const statusColor = getHealthStatusColor(healthStatus);
  const bgColor = getHealthStatusBg(healthStatus);

  const dimensions = {
    sm: { size: 48, stroke: 4, font: 'text-xs' },
    md: { size: 64, stroke: 6, font: 'text-sm' },
    lg: { size: 96, stroke: 8, font: 'text-lg' },
  };

  const { size: dimensionSize, stroke, font } = dimensions[size];
  const radius = (dimensionSize - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: dimensionSize, height: dimensionSize }}>
        {/* Background circle */}
        <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${dimensionSize} ${dimensionSize}`}>
          <circle
            cx={dimensionSize / 2}
            cy={dimensionSize / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            className="text-slate-200 dark:text-slate-700"
          />
          {/* Progress circle */}
          <circle
            cx={dimensionSize / 2}
            cy={dimensionSize / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={`transition-all duration-500 ${statusColor.replace('text-', 'stroke-')}`}
          />
        </svg>
        
        {/* Score text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`${font} font-bold ${statusColor}`}>
            {score.toFixed(0)}
          </span>
        </div>
      </div>

      {showLabel && (
        <p className={`mt-1 ${size === 'sm' ? 'text-xs' : 'text-sm'} text-slate-500 dark:text-slate-400`}>
          Reliability
        </p>
      )}

      {showDetails && (
        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          {isHealthy ? (
            <span className="text-emerald-600 dark:text-emerald-400">System healthy</span>
          ) : (
            <span className={statusColor}>
              {healthStatus === 'degraded' ? 'Performance issues' : 'System degraded'}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Reliability Card - Full card with metrics
// ============================================================================

interface ReliabilityCardProps {
  className?: string;
}

export function ReliabilityCard({ className = '' }: ReliabilityCardProps) {
  const { totalRequests, successfulRequests, failedRequests, errors } = useReliabilityStore();
  const score = useReliabilityStore(selectScore);
  const healthStatus = getHealthStatus(score);
  const statusColor = getHealthStatusColor(healthStatus);
  const bgColor = getHealthStatusBg(healthStatus);

  const successRate = totalRequests > 0 
    ? ((successfulRequests / totalRequests) * 100).toFixed(1) 
    : '100.0';

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          System Reliability
        </h3>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor} bg-opacity-10 text-current`}>
          {healthStatus.charAt(0).toUpperCase() + healthStatus.slice(1)}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <ReliabilityGauge size="sm" showLabel />
        <div className="col-span-2 flex flex-col justify-center">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-slate-500 dark:text-slate-400">Total Requests</p>
              <p className="font-semibold text-slate-900 dark:text-white">{totalRequests}</p>
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400">Success Rate</p>
              <p className={`font-semibold ${statusColor}`}>{successRate}%</p>
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400">Successful</p>
              <p className="font-semibold text-emerald-600 dark:text-emerald-400">{successfulRequests}</p>
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400">Failed</p>
              <p className="font-semibold text-red-600 dark:text-red-400">{failedRequests}</p>
            </div>
          </div>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Recent Errors
          </h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {errors.slice(0, 5).map((error, index) => (
              <div key={index} className="flex items-start gap-2 text-xs">
                <span className="text-slate-400 whitespace-nowrap">
                  {new Date(error.timestamp).toLocaleTimeString()}
                </span>
                <span className="text-red-600 dark:text-red-400 truncate">
                  {error.error}
                </span>
                <span className="text-slate-400 ml-auto">
                  {error.endpoint}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
