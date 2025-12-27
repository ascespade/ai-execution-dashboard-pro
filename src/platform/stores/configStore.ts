// Platform Configuration Store - Zustand store for platform API configuration
// Persists configuration to localStorage and provides reactive updates

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface PlatformConfiguration {
  // Configuration state
  baseUrl: string;
  apiKey: string;
  isConfigured: boolean;
  
  // Connection state
  isConnecting: boolean;
  lastConnectionStatus: 'success' | 'failed' | null;
  lastConnectionTime: string | null;
  lastLatency: number | null;
  
  // Actions
  setBaseUrl: (url: string) => void;
  setApiKey: (key: string) => void;
  setConnecting: (connecting: boolean) => void;
  setConnectionStatus: (status: 'success' | 'failed', latency?: number) => void;
  reset: () => void;
  loadFromStorage: () => void;
}

const initialState = {
  baseUrl: '',
  apiKey: '',
  isConfigured: false,
  isConnecting: false,
  lastConnectionStatus: null,
  lastConnectionTime: null,
  lastLatency: null,
};

export const useConfigStore = create<PlatformConfiguration>()(
  persist(
    (set, get) => ({
      ...initialState,

      setBaseUrl: (baseUrl: string) => {
        const { apiKey } = get();
        set({ 
          baseUrl, 
          isConfigured: !!baseUrl && !!apiKey,
          lastConnectionStatus: null,
        });
      },

      setApiKey: (apiKey: string) => {
        const { baseUrl } = get();
        set({ 
          apiKey, 
          isConfigured: !!baseUrl && !!apiKey,
          lastConnectionStatus: null,
        });
      },

      setConnecting: (isConnecting: boolean) => {
        set({ isConnecting });
      },

      setConnectionStatus: (status: 'success' | 'failed', latency?: number) => {
        set({
          lastConnectionStatus: status,
          lastConnectionTime: new Date().toISOString(),
          lastLatency: latency || null,
          isConnecting: false,
        });
      },

      reset: () => {
        set(initialState);
      },

      loadFromStorage: () => {
        // This is handled automatically by persist middleware
        // but can be called to force a reload if needed
        const state = get();
        set({
          isConfigured: !!state.baseUrl && !!state.apiKey,
        });
      },
    }),
    {
      name: 'platform-config',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        baseUrl: state.baseUrl,
        apiKey: state.apiKey,
      }),
    }
  )
);

// ============================================================================
// Selectors for optimized re-renders
// ============================================================================

export const selectBaseUrl = (state: PlatformConfiguration) => state.baseUrl;
export const selectApiKey = (state: PlatformConfiguration) => state.apiKey;
export const selectIsConfigured = (state: PlatformConfiguration) => state.isConfigured;
export const selectConnectionStatus = (state: PlatformConfiguration) => ({
  isConnecting: state.isConnecting,
  lastConnectionStatus: state.lastConnectionStatus,
  lastConnectionTime: state.lastConnectionTime,
  lastLatency: state.lastLatency,
});

// ============================================================================
// Helper functions
// ============================================================================

/**
 * Get masked API key for display
 */
export function getMaskedApiKey(key: string): string {
  if (key.length <= 8) {
    return '*'.repeat(key.length);
  }
  return `${key.substring(0, 4)}...${key.substring(key.length - 4)}`;
}

/**
 * Validate API key format
 */
export function validateApiKey(key: string): boolean {
  // Basic validation - API keys should be non-empty strings
  // Can be extended based on actual API key format requirements
  return !!key && key.length >= 8;
}

/**
 * Validate URL format
 */
export function validateBaseUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}
