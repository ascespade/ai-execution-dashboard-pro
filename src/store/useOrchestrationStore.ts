// Orchestration Store

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { OrchestrationSummary, Status, Orchestration } from '@/types';
import { orchestrationService } from '@/services/orchestration.service';

interface OrchestrationFilters {
  status?: Status | '';
  search?: string;
  dateRange?: { start: string; end: string };
}

interface OrchestrationState {
  // Data
  orchestrations: OrchestrationSummary[];
  currentOrchestration: Orchestration | null;
  
  // Pagination
  page: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  
  // Filters
  filters: OrchestrationFilters;
  
  // Loading states
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  
  // Error
  error: string | null;
  
  // Actions
  fetchOrchestrations: (params?: {
    page?: number;
    pageSize?: number;
    status?: Status | '';
    search?: string;
  }) => Promise<void>;
  
  fetchOrchestration: (id: string) => Promise<void>;
  
  createOrchestration: (data: Parameters<typeof orchestrationService.createOrchestration>[0]) => Promise<Orchestration>;
  
  updateOrchestration: (id: string, data: Parameters<typeof orchestrationService.updateOrchestration>[1]) => Promise<void>;
  
  deleteOrchestration: (id: string) => Promise<void>;
  
  startOrchestration: (id: string) => Promise<void>;
  
  pauseOrchestration: (id: string) => Promise<void>;
  
  resumeOrchestration: (id: string) => Promise<void>;
  
  cancelOrchestration: (id: string) => Promise<void>;
  
  setFilters: (filters: OrchestrationFilters) => void;
  
  clearFilters: () => void;
  
  setPage: (page: number) => void;
  
  clearCurrentOrchestration: () => void;
  
  clearError: () => void;
}

export const useOrchestrationStore = create<OrchestrationState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        orchestrations: [],
        currentOrchestration: null,
        page: 1,
        pageSize: 10,
        totalPages: 0,
        totalCount: 0,
        filters: {},
        isLoading: false,
        isCreating: false,
        isUpdating: false,
        error: null,

        fetchOrchestrations: async (params) => {
          const { page, pageSize, filters } = get();
          set({ isLoading: true, error: null });

          try {
            const response = await orchestrationService.getOrchestrations({
              page: params?.page ?? page,
              page_size: params?.pageSize ?? pageSize,
              status: params?.status ?? filters.status,
              search: params?.search ?? filters.search,
            });

            set({
              orchestrations: response.data,
              totalCount: response.total,
              totalPages: response.total_pages,
              page: response.page,
              isLoading: false,
            });
          } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch orchestrations';
            set({ error: errorMessage, isLoading: false });
          }
        },

        fetchOrchestration: async (id) => {
          set({ isLoading: true, error: null });

          try {
            const orchestration = await orchestrationService.getOrchestration(id);
            set({ currentOrchestration: orchestration, isLoading: false });
          } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch orchestration';
            set({ error: errorMessage, isLoading: false });
          }
        },

        createOrchestration: async (data) => {
          set({ isCreating: true, error: null });

          try {
            const orchestration = await orchestrationService.createOrchestration(data);
            set((state) => ({
              orchestrations: [orchestration as unknown as OrchestrationSummary, ...state.orchestrations],
              totalCount: state.totalCount + 1,
              isCreating: false,
            }));
            return orchestration;
          } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create orchestration';
            set({ error: errorMessage, isCreating: false });
            throw error;
          }
        },

        updateOrchestration: async (id, data) => {
          set({ isUpdating: true, error: null });

          try {
            const updated = await orchestrationService.updateOrchestration(id, data);
            set((state) => ({
              orchestrations: state.orchestrations.map((o) =>
                o.id === id ? { ...o, ...updated } : o
              ),
              currentOrchestration:
                state.currentOrchestration?.id === id
                  ? { ...state.currentOrchestration, ...updated }
                  : state.currentOrchestration,
              isUpdating: false,
            }));
          } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update orchestration';
            set({ error: errorMessage, isUpdating: false });
            throw error;
          }
        },

        deleteOrchestration: async (id) => {
          set({ error: null });

          try {
            await orchestrationService.deleteOrchestration(id);
            set((state) => ({
              orchestrations: state.orchestrations.filter((o) => o.id !== id),
              totalCount: state.totalCount - 1,
            }));
          } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to delete orchestration';
            set({ error: errorMessage });
            throw error;
          }
        },

        startOrchestration: async (id) => {
          try {
            const updated = await orchestrationService.startOrchestration(id);
            set((state) => ({
              orchestrations: state.orchestrations.map((o) =>
                o.id === id ? { ...o, status: 'RUNNING' } : o
              ),
              currentOrchestration:
                state.currentOrchestration?.id === id
                  ? { ...state.currentOrchestration, status: 'RUNNING' }
                  : state.currentOrchestration,
            }));
          } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to start orchestration';
            set({ error: errorMessage });
            throw error;
          }
        },

        pauseOrchestration: async (id) => {
          try {
            await orchestrationService.pauseOrchestration(id);
            set((state) => ({
              orchestrations: state.orchestrations.map((o) =>
                o.id === id ? { ...o, status: 'PAUSED' } : o
              ),
              currentOrchestration:
                state.currentOrchestration?.id === id
                  ? { ...state.currentOrchestration, status: 'PAUSED' }
                  : state.currentOrchestration,
            }));
          } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to pause orchestration';
            set({ error: errorMessage });
            throw error;
          }
        },

        resumeOrchestration: async (id) => {
          try {
            await orchestrationService.resumeOrchestration(id);
            set((state) => ({
              orchestrations: state.orchestrations.map((o) =>
                o.id === id ? { ...o, status: 'RUNNING' } : o
              ),
              currentOrchestration:
                state.currentOrchestration?.id === id
                  ? { ...state.currentOrchestration, status: 'RUNNING' }
                  : state.currentOrchestration,
            }));
          } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to resume orchestration';
            set({ error: errorMessage });
            throw error;
          }
        },

        cancelOrchestration: async (id) => {
          try {
            await orchestrationService.cancelOrchestration(id);
            set((state) => ({
              orchestrations: state.orchestrations.map((o) =>
                o.id === id ? { ...o, status: 'FAILED' } : o
              ),
              currentOrchestration:
                state.currentOrchestration?.id === id
                  ? { ...state.currentOrchestration, status: 'FAILED' }
                  : state.currentOrchestration,
            }));
          } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to cancel orchestration';
            set({ error: errorMessage });
            throw error;
          }
        },

        setFilters: (filters) => set({ filters }),
        clearFilters: () => set({ filters: {} }),
        setPage: (page) => set({ page }),
        clearCurrentOrchestration: () => set({ currentOrchestration: null }),
        clearError: () => set({ error: null }),
      }),
      {
        name: 'orchestration-storage',
        partialize: (state) => ({
          page: state.page,
          pageSize: state.pageSize,
          filters: state.filters,
        }),
      }
    )
  )
);

// Selectors
export const selectOrchestrations = (state: OrchestrationState) => state.orchestrations;
export const selectIsLoading = (state: OrchestrationState) => state.isLoading;
export const selectCurrentOrchestration = (state: OrchestrationState) => state.currentOrchestration;
export const selectFilters = (state: OrchestrationState) => state.filters;
