// Configuration Drawer - Slide-out panel for platform API configuration
// Part of Phase 3: UX: Real Dashboard + Stability Signals

'use client';

import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, XCircle, Loader2, Save, RefreshCw } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { useConfigStore, validateBaseUrl, validateApiKey, getMaskedApiKey } from '@/platform/stores';
import { useTestConnection } from '@/platform/adapter';

interface ConfigDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ConfigDrawer({ isOpen, onClose }: ConfigDrawerProps) {
  const {
    baseUrl,
    apiKey,
    lastConnectionStatus,
    lastConnectionTime,
    lastLatency,
    isConnecting,
    setBaseUrl,
    setApiKey,
    setConnecting,
    setConnectionStatus,
    reset,
  } = useConfigStore();

  const [localBaseUrl, setLocalBaseUrl] = useState(baseUrl);
  const [localApiKey, setLocalApiKey] = useState(apiKey);
  const [showApiKey, setShowApiKey] = useState(false);
  const [localLastLatency, setLocalLastLatency] = useState<number | null>(lastLatency);

  const testConnectionMutation = useTestConnection();

  // Sync local state when store changes
  useEffect(() => {
    setLocalBaseUrl(baseUrl);
    setLocalApiKey(apiKey);
    setLocalLastLatency(lastLatency);
  }, [baseUrl, apiKey, lastLatency]);

  const handleSave = () => {
    if (!validateBaseUrl(localBaseUrl)) {
      alert('Please enter a valid URL (http:// or https://)');
      return;
    }

    if (!validateApiKey(localApiKey)) {
      alert('API key must be at least 8 characters');
      return;
    }

    setBaseUrl(localBaseUrl);
    setApiKey(localApiKey);
    onClose();
  };

  const handleTestConnection = async () => {
    if (!validateBaseUrl(localBaseUrl)) {
      alert('Please enter a valid URL first');
      return;
    }

    setConnecting(true);
    setLocalBaseUrl(localBaseUrl);
    setLocalApiKey(localApiKey);

    try {
      const result = await testConnectionMutation.mutateAsync();
      setConnectionStatus(result.success ? 'success' : 'failed', result.latency);
      if (result.success) {
        setBaseUrl(localBaseUrl);
        setApiKey(localApiKey);
      }
    } catch {
      setConnectionStatus('failed');
    }
  };

  const handleReset = () => {
    reset();
    setLocalBaseUrl('');
    setLocalApiKey('');
    setLocalLastLatency(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-slate-900 shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Platform Configuration
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Base URL Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Platform API URL
            </label>
            <Input
              placeholder="https://your-platform-api.railway.app"
              value={localBaseUrl}
              onChange={(e) => setLocalBaseUrl(e.target.value)}
              disabled={isConnecting}
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              The base URL of your AI Execution Platform API
            </p>
          </div>

          {/* API Key Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              API Key
            </label>
            <div className="relative">
              <Input
                type={showApiKey ? 'text' : 'password'}
                placeholder="Enter your x-api-key"
                value={localApiKey}
                onChange={(e) => setLocalApiKey(e.target.value)}
                disabled={isConnecting}
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showApiKey ? 'Hide' : 'Show'}
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Your x-api-key for authenticating with the platform API
            </p>
          </div>

          {/* Connection Status */}
          {lastConnectionStatus && (
            <div className={`p-4 rounded-lg border ${
              lastConnectionStatus === 'success' 
                ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800' 
                : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
            }`}>
              <div className="flex items-center gap-3">
                {lastConnectionStatus === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                <div>
                  <p className={`text-sm font-medium ${
                    lastConnectionStatus === 'success'
                      ? 'text-emerald-700 dark:text-emerald-300'
                      : 'text-red-700 dark:text-red-300'
                  }`}>
                    {lastConnectionStatus === 'success' ? 'Connection Successful' : 'Connection Failed'}
                  </p>
                  {lastConnectionTime && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {new Date(lastConnectionTime).toLocaleString()}
                      {localLastLatency && ` • ${localLastLatency}ms`}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Help Text */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-2">
              How to get your API key
            </h3>
            <ol className="text-sm text-slate-600 dark:text-slate-400 space-y-1 list-decimal list-inside">
              <li>Log in to your AI Execution Platform</li>
              <li>Go to Settings &gt; API Keys</li>
              <li>Create a new API key or use an existing one</li>
              <li>Copy the key and paste it above</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4">
          <Button
            variant="ghost"
            onClick={handleReset}
            disabled={isConnecting}
          >
            Reset
          </Button>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleTestConnection}
              disabled={isConnecting || !localBaseUrl}
              leftIcon={isConnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            >
              {isConnecting ? 'Testing...' : 'Test Connection'}
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={isConnecting || !localBaseUrl || !localApiKey}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Configuration
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
