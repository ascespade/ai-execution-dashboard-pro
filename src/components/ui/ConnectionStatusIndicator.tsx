// Connection Status Indicator Component
// Displays live connection status with latency and last check time

'use client';

import React from 'react';
import { Wifi, WifiOff, AlertTriangle, Clock, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useConfigStore, selectConnectionStatus } from '@/platform/stores/configStore';
import { usePlatformHealth } from '@/platform/adapter/hooks/usePlatform';
import { formatRelativeTime } from '@/lib/utils';

type ConnectionState = 'idle' | 'connecting' | 'connected' | 'degraded' | 'error' | 'offline';

export const ConnectionStatusIndicator: React.FC = () => {
  const connectionStatus = useConfigStore(selectConnectionStatus);
  const { data: healthData, isLoading, isError, refetch } = usePlatformHealth();
  
  const isConnecting = connectionStatus.isConnecting || isLoading;
  const lastCheck = connectionStatus.lastConnectionTime;
  const latency = connectionStatus.lastLatency;
  
  // Determine connection state
  let state: ConnectionState = 'idle';
  if (isConnecting) {
    state = 'connecting';
  } else if (connectionStatus.lastConnectionStatus === 'failed' || isError) {
    state = 'error';
  } else if (healthData?.status === 'healthy') {
    state = 'connected';
  } else if (healthData?.status === 'degraded' || healthData?.status === 'unhealthy') {
    state = 'degraded';
  }
  
  const stateConfig: Record<ConnectionState, { icon: React.ReactNode; color: string; bgColor: string; label: string }> = {
    idle: {
      icon: <Wifi className="w-4 h-4" />,
      color: 'text-slate-400',
      bgColor: 'bg-slate-100 dark:bg-slate-800',
      label: 'Not Configured',
    },
    connecting: {
      icon: <RefreshCw className="w-4 h-4 animate-spin" />,
      color: 'text-amber-500',
      bgColor: 'bg-amber-100 dark:bg-amber-900/30',
      label: 'Connecting...',
    },
    connected: {
      icon: <Wifi className="w-4 h-4" />,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
      label: latency !== null ? `${latency}ms` : 'Connected',
    },
    degraded: {
      icon: <AlertTriangle className="w-4 h-4" />,
      color: 'text-amber-500',
      bgColor: 'bg-amber-100 dark:bg-amber-900/30',
      label: 'Degraded',
    },
    error: {
      icon: <WifiOff className="w-4 h-4" />,
      color: 'text-red-500',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
      label: 'Connection Failed',
    },
    offline: {
      icon: <WifiOff className="w-4 h-4" />,
      color: 'text-slate-400',
      bgColor: 'bg-slate-100 dark:bg-slate-800',
      label: 'Offline',
    },
  };
  
  const config = stateConfig[state];
  
  return (
    <div className="relative group">
      <button
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors',
          'hover:bg-slate-100 dark:hover:bg-slate-800',
          config.color
        )}
        onClick={() => refetch()}
        title={`Connection Status: ${config.label}${lastCheck ? ` (Last check: ${formatRelativeTime(lastCheck)})` : ''}`}
      >
        <span className={cn('p-1 rounded-full', config.bgColor)}>
          {config.icon}
        </span>
        <span className="text-sm font-medium hidden md:inline">{config.label}</span>
      </button>
      
      {/* Tooltip */}
      <div className="absolute right-0 mt-2 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-3">
          <div className="flex items-center gap-2 mb-2">
            <span className={cn('p-1 rounded-full', config.bgColor, config.color)}>
              {config.icon}
            </span>
            <span className="font-medium text-slate-900 dark:text-white">
              Connection Status
            </span>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">State:</span>
              <span className="font-medium">{config.label}</span>
            </div>
            
            {latency !== null && (
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Latency:</span>
                <span className="font-medium">{latency}ms</span>
              </div>
            )}
            
            {lastCheck && (
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Last Check:</span>
                <span className="font-medium">{formatRelativeTime(lastCheck)}</span>
              </div>
            )}
            
            <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
              <button
                onClick={() => refetch()}
                className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Check Connection
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionStatusIndicator;
