// Incident Feed Component - Real-time incident and event stream
// Part of Phase 3: UX: Real Dashboard + Stability Signals

'use client';

import React from 'react';
import { AlertTriangle, CheckCircle2, Clock, XCircle, Info, TrendingUp, TrendingDown } from 'lucide-react';
import { useReliabilityStore, selectRecentErrors } from '@/platform/stores';
import type { AppError } from '@/platform/adapter';

interface Incident {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  metadata?: Record<string, string>;
}

interface IncidentFeedProps {
  maxItems?: number;
  className?: string;
}

// Generate mock incidents for demonstration
function generateMockIncidents(): Incident[] {
  const now = new Date();
  return [
    {
      id: '1',
      type: 'success',
      title: 'Orchestration Completed',
      message: 'User authentication implementation completed successfully',
      timestamp: new Date(now.getTime() - 5 * 60000).toISOString(),
    },
    {
      id: '2',
      type: 'error',
      title: 'API Request Failed',
      message: 'Failed to fetch orchestrations: 503 Service Unavailable',
      timestamp: new Date(now.getTime() - 15 * 60000).toISOString(),
    },
    {
      id: '3',
      type: 'warning',
      title: 'Rate Limit Warning',
      message: 'Approaching rate limit (85% of quota used)',
      timestamp: new Date(now.getTime() - 30 * 60000).toISOString(),
    },
    {
      id: '4',
      type: 'info',
      title: 'New Agent Registered',
      message: 'Code review agent v2.1 is now available',
      timestamp: new Date(now.getTime() - 60 * 60000).toISOString(),
    },
    {
      id: '5',
      type: 'success',
      title: 'Health Check Passed',
      message: 'All system checks passed',
      timestamp: new Date(now.getTime() - 120 * 60000).toISOString(),
    },
  ];
}

export function IncidentFeed({ maxItems = 10, className = '' }: IncidentFeedProps) {
  const errors = useReliabilityStore(selectRecentErrors);
  const [incidents] = React.useState(generateMockIncidents);
  const [filter, setFilter] = React.useState<'all' | 'error' | 'success' | 'warning'>('all');

  // Combine mock incidents with real errors
  const allIncidents: Incident[] = [
    ...incidents,
    ...errors.map((error, index) => ({
      id: `error-${index}`,
      type: 'error' as const,
      title: 'Request Failed',
      message: error.error,
      timestamp: error.timestamp,
      metadata: { endpoint: error.endpoint },
    })),
  ];

  // Filter incidents
  const filteredIncidents = allIncidents
    .filter(incident => filter === 'all' || incident.type === filter)
    .slice(0, maxItems);

  const getIcon = (type: Incident['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getBgColor = (type: Incident['type']) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'warning':
        return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800';
      case 'info':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
        <h3 className="font-semibold text-slate-900 dark:text-white">
          Incident Feed
        </h3>
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="text-sm border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300"
          >
            <option value="all">All</option>
            <option value="error">Errors</option>
            <option value="success">Success</option>
            <option value="warning">Warnings</option>
          </select>
        </div>
      </div>

      {/* Incidents List */}
      <div className="divide-y divide-slate-200 dark:divide-slate-700 max-h-96 overflow-y-auto">
        {filteredIncidents.length === 0 ? (
          <div className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
            No incidents to display
          </div>
        ) : (
          filteredIncidents.map((incident) => (
            <div
              key={incident.id}
              className={`px-4 py-3 flex items-start gap-3 ${getBgColor(incident.type)}`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {getIcon(incident.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                    {incident.title}
                  </p>
                  <span className="flex-shrink-0 text-xs text-slate-500 dark:text-slate-400">
                    {formatTimestamp(incident.timestamp)}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 truncate">
                  {incident.message}
                </p>
                {incident.metadata?.endpoint && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    {incident.metadata.endpoint}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 text-center">
        Last updated: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
}
