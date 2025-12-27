// Intelligence Store - Zustand store for telemetry, diagnostics, and request tracing
// Manages time-series data for predictive diagnostics

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  TelemetryPoint,
  OrchestrationEvent,
  RequestEvent,
  HealthEvent,
  DiagnosticResult,
  DegradationWarning,
  RootCauseHint,
  ReliabilityScore,
} from '../intelligence/engine';

// ============================================================================
// State Interface
// ============================================================================

interface IntelligenceState {
  // Time-series data (ring buffer)
  telemetryHistory: TelemetryPoint[];
  orchestrationHistory: OrchestrationEvent[];
  requestTrace: RequestEvent[];
  healthHistory: HealthEvent[];
  
  // Diagnostic results
  latestDiagnostics: DiagnosticResult | null;
  lastDiagnosticsTime: string | null;
  
  // Warnings and alerts
  activeWarnings: DegradationWarning[];
  acknowledgedWarnings: string[];
  
  // Configuration
  diagnosticsEnabled: boolean;
  traceEnabled: boolean;
  maxTelemetryPoints: number;
  maxTraceEntries: number;
  
  // Actions
  addTelemetryPoint: (point: TelemetryPoint) => void;
  addOrchestrationEvent: (event: OrchestrationEvent) => void;
  addRequestTrace: (event: RequestEvent) => void;
  addHealthEvent: (event: HealthEvent) => void;
  updateDiagnostics: (result: DiagnosticResult) => void;
  acknowledgeWarning: (warningId: string) => void;
  dismissWarning: (warningId: string) => void;
  clearTrace: () => void;
  clearAllData: () => void;
  setDiagnosticsEnabled: (enabled: boolean) => void;
  setTraceEnabled: (enabled: boolean) => void;
}

// ============================================================================
// Constants
// ============================================================================

const MAX_TELEMETRY_POINTS = 100; // Keep last 100 telemetry points (~15 min at 10s intervals)
const MAX_TRACE_ENTRIES = 100;    // Keep last 100 request traces
const MAX_ORCHESTRATION_EVENTS = 50; // Keep last 50 orchestration events

// ============================================================================
// Store Implementation
// ============================================================================

export const useIntelligenceStore = create<IntelligenceState>()(
  persist(
    (set, get) => ({
      // Initial state
      telemetryHistory: [],
      orchestrationHistory: [],
      requestTrace: [],
      healthHistory: [],
      latestDiagnostics: null,
      lastDiagnosticsTime: null,
      activeWarnings: [],
      acknowledgedWarnings: [],
      diagnosticsEnabled: true,
      traceEnabled: true,
      maxTelemetryPoints: MAX_TELEMETRY_POINTS,
      maxTraceEntries: MAX_TRACE_ENTRIES,

      // Actions
      addTelemetryPoint: (point) => {
        set((state) => {
          const history = [...state.telemetryHistory, point];
          // Ring buffer: keep only last N points
          if (history.length > state.maxTelemetryPoints) {
            return { telemetryHistory: history.slice(-state.maxTelemetryPoints) };
          }
          return { telemetryHistory: history };
        });
      },

      addOrchestrationEvent: (event) => {
        set((state) => {
          const history = [event, ...state.orchestrationHistory];
          // Keep only last N events
          if (history.length > MAX_ORCHESTRATION_EVENTS) {
            return { orchestrationHistory: history.slice(0, MAX_ORCHESTRATION_EVENTS) };
          }
          return { orchestrationHistory: history };
        });
      },

      addRequestTrace: (event) => {
        const { traceEnabled } = get();
        if (!traceEnabled) return;

        set((state) => {
          const trace = [event, ...state.requestTrace];
          // Ring buffer: keep only last N entries
          if (trace.length > state.maxTraceEntries) {
            return { requestTrace: trace.slice(0, state.maxTraceEntries) };
          }
          return { requestTrace: trace };
        });
      },

      addHealthEvent: (event) => {
        set((state) => {
          const history = [event, ...state.healthHistory];
          // Keep last 10 health events
          return { healthHistory: history.slice(0, 10) };
        });
      },

      updateDiagnostics: (result) => {
        set({
          latestDiagnostics: result,
          lastDiagnosticsTime: new Date().toISOString(),
          activeWarnings: result.warnings.filter(w => w.severity !== 'INFO'),
        });
      },

      acknowledgeWarning: (warningId) => {
        set((state) => ({
          acknowledgedWarnings: [...state.acknowledgedWarnings, warningId],
        }));
      },

      dismissWarning: (warningId) => {
        set((state) => ({
          activeWarnings: state.activeWarnings.filter(w => w.id !== warningId),
          acknowledgedWarnings: state.acknowledgedWarnings.filter(id => id !== warningId),
        }));
      },

      clearTrace: () => {
        set({ requestTrace: [] });
      },

      clearAllData: () => {
        set({
          telemetryHistory: [],
          orchestrationHistory: [],
          requestTrace: [],
          healthHistory: [],
          latestDiagnostics: null,
          lastDiagnosticsTime: null,
          activeWarnings: [],
        });
      },

      setDiagnosticsEnabled: (enabled) => {
        set({ diagnosticsEnabled: enabled });
      },

      setTraceEnabled: (enabled) => {
        set({ traceEnabled: enabled });
      },
    }),
    {
      name: 'intelligence-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        diagnosticsEnabled: state.diagnosticsEnabled,
        traceEnabled: state.traceEnabled,
        maxTelemetryPoints: state.maxTelemetryPoints,
        maxTraceEntries: state.maxTraceEntries,
        acknowledgedWarnings: state.acknowledgedWarnings,
      }),
    }
  )
);

// ============================================================================
// Selectors for optimized re-renders
// ============================================================================

export const selectTelemetryHistory = (state: IntelligenceState) => state.telemetryHistory;
export const selectRequestTrace = (state: IntelligenceState) => state.requestTrace;
export const selectActiveWarnings = (state: IntelligenceState) => 
  state.activeWarnings.filter(warning => !state.acknowledgedWarnings.includes(warning.id));
export const selectLatestDiagnostics = (state: IntelligenceState) => state.latestDiagnostics;
export const selectDiagnosticsEnabled = (state: IntelligenceState) => state.diagnosticsEnabled;
export const selectTraceEnabled = (state: IntelligenceState) => state.traceEnabled;
