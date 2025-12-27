// Reliability Store - Track request success/failure for reliability scoring
// Provides real-time reliability metrics for the dashboard

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface ReliabilityMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  lastRequestTime: string | null;
  lastSuccessTime: string | null;
  lastFailureTime: string | null;
  errors: Array<{
    timestamp: string;
    endpoint: string;
    error: string;
    status?: number;
  }>;
}

interface ReliabilityState extends ReliabilityMetrics {
  // Actions
  recordRequest: (endpoint: string, success: boolean, error?: { message: string; status?: number }) => void;
  reset: () => void;
  clearErrors: () => void;
  getScore: () => number;
  getSuccessRate: () => number;
}

const initialState: ReliabilityMetrics = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  lastRequestTime: null,
  lastSuccessTime: null,
  lastFailureTime: null,
  errors: [],
};

const MAX_STORED_ERRORS = 50;

export const useReliabilityStore = create<ReliabilityState>()(
  persist(
    (set, get) => ({
      ...initialState,

      recordRequest: (endpoint: string, success: boolean, error?: { message: string; status?: number }) => {
        const now = new Date().toISOString();
        
        set((state) => {
          const newErrors = success 
            ? state.errors 
            : [
                {
                  timestamp: now,
                  endpoint,
                  error: error?.message || 'Unknown error',
                  status: error?.status,
                },
                ...state.errors,
              ].slice(0, MAX_STORED_ERRORS);

          return {
            totalRequests: state.totalRequests + 1,
            successfulRequests: success ? state.successfulRequests + 1 : state.successfulRequests,
            failedRequests: success ? state.failedRequests : state.failedRequests + 1,
            lastRequestTime: now,
            lastSuccessTime: success ? now : state.lastSuccessTime,
            lastFailureTime: success ? state.lastFailureTime : now,
            errors: newErrors,
          };
        });
      },

      reset: () => {
        set(initialState);
      },

      clearErrors: () => {
        set((state) => ({
          errors: [],
        }));
      },

      getScore: (): number => {
        const state = get();
        if (state.totalRequests === 0) return 100;
        
        const score = ((state.successfulRequests / state.totalRequests) * 100);
        return Math.round(score * 100) / 100; // Round to 2 decimal places
      },

      getSuccessRate: (): number => {
        return get().getScore();
      },
    }),
    {
      name: 'reliability-metrics',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        totalRequests: state.totalRequests,
        successfulRequests: state.successfulRequests,
        failedRequests: state.failedRequests,
        errors: state.errors.slice(0, 20), // Only persist last 20 errors
      }),
    }
  )
);

// ============================================================================
// Selectors
// ============================================================================

export const selectScore = (state: ReliabilityState) => state.getScore();
export const selectSuccessRate = (state: ReliabilityState) => state.getSuccessRate();
export const selectIsHealthy = (state: ReliabilityState) => state.getScore() >= 98;
export const selectRecentErrors = (state: ReliabilityState) => state.errors.slice(0, 10);

// ============================================================================
// Score Interpretation
// ============================================================================

export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';

export function getHealthStatus(score: number): HealthStatus {
  if (score >= 98) return 'healthy';
  if (score >= 90) return 'degraded';
  return 'unhealthy';
}

export function getHealthStatusColor(status: HealthStatus): string {
  switch (status) {
    case 'healthy': return 'text-emerald-500';
    case 'degraded': return 'text-amber-500';
    case 'unhealthy': return 'text-red-500';
  }
}

export function getHealthStatusBg(status: HealthStatus): string {
  switch (status) {
    case 'healthy': return 'bg-emerald-500';
    case 'degraded': return 'bg-amber-500';
    case 'unhealthy': return 'bg-red-500';
  }
}
