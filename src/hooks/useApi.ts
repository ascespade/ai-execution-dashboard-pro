// API Hooks using React Query

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboard.service';
import { orchestrationService } from '@/services/orchestration.service';
import { agentService } from '@/services/agent.service';
import { repositoryService } from '@/services/repository.service';
import { templateService } from '@/services/template.service';
import { apiKeyService } from '@/services/api-key.service';
import type { Status } from '@/types';

// Dashboard Hooks
export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => dashboardService.getStats(),
    staleTime: 30000, // 30 seconds
  });
}

export function useRecentActivity(limit = 5) {
  return useQuery({
    queryKey: ['dashboard', 'recent-activity', limit],
    queryFn: () => dashboardService.getRecentActivity(limit),
    staleTime: 30000,
  });
}

// Orchestration Hooks
export function useOrchestrations(params?: {
  page?: number;
  pageSize?: number;
  status?: Status | '';
  search?: string;
}) {
  return useQuery({
    queryKey: ['orchestrations', params],
    queryFn: () => orchestrationService.getOrchestrations(params),
    staleTime: 10000,
  });
}

export function useOrchestration(id: string) {
  return useQuery({
    queryKey: ['orchestration', id],
    queryFn: () => orchestrationService.getOrchestration(id),
    enabled: !!id,
    staleTime: 5000,
    refetchInterval: (query) => {
      const state = query.state?.data;
      if (state?.status === 'RUNNING') {
        return 5000; // Poll every 5 seconds when running
      }
      return false;
    },
  });
}

export function useCreateOrchestration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: orchestrationService.createOrchestration,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orchestrations'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateOrchestration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof orchestrationService.updateOrchestration>[1];
    }) => orchestrationService.updateOrchestration(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orchestrations'] });
      queryClient.invalidateQueries({ queryKey: ['orchestration', variables.id] });
    },
  });
}

export function useDeleteOrchestration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: orchestrationService.deleteOrchestration,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orchestrations'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useStartOrchestration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: orchestrationService.startOrchestration,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['orchestrations'] });
      queryClient.invalidateQueries({ queryKey: ['orchestration', id] });
    },
  });
}

export function usePauseOrchestration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: orchestrationService.pauseOrchestration,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['orchestrations'] });
      queryClient.invalidateQueries({ queryKey: ['orchestration', id] });
    },
  });
}

// Agent Hooks
export function useAgents(params?: {
  page?: number;
  pageSize?: number;
  category?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ['agents', params],
    queryFn: () => agentService.getAgents(params),
    staleTime: 60000, // 1 minute
  });
}

export function useAgent(id: string) {
  return useQuery({
    queryKey: ['agent', id],
    queryFn: () => agentService.getAgent(id),
    enabled: !!id,
    staleTime: 60000,
  });
}

export function useAvailableAgents() {
  return useQuery({
    queryKey: ['agents', 'available'],
    queryFn: () => agentService.getAvailableAgents(),
    staleTime: 10000,
  });
}

export function useAgentCategories() {
  return useQuery({
    queryKey: ['agents', 'categories'],
    queryFn: () => agentService.getCategories(),
    staleTime: 60000,
  });
}

// Repository Hooks
export function useRepositories(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
}) {
  return useQuery({
    queryKey: ['repositories', params],
    queryFn: () => repositoryService.getProfiles(params),
    staleTime: 30000,
  });
}

export function useRepository(id: string) {
  return useQuery({
    queryKey: ['repository', id],
    queryFn: () => repositoryService.getProfile(id),
    enabled: !!id,
    staleTime: 30000,
  });
}

export function useCreateRepository() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: repositoryService.createProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repositories'] });
    },
  });
}

export function useUpdateRepository() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof repositoryService.updateProfile>[1];
    }) => repositoryService.updateProfile(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['repositories'] });
      queryClient.invalidateQueries({ queryKey: ['repository', variables.id] });
    },
  });
}

export function useDeleteRepository() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: repositoryService.deleteProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repositories'] });
    },
  });
}

// Template Hooks
export function useTemplates(params?: {
  page?: number;
  pageSize?: number;
  category?: string;
  search?: string;
  isPublic?: boolean;
}) {
  return useQuery({
    queryKey: ['templates', params],
    queryFn: () => templateService.getTemplates(params),
    staleTime: 30000,
  });
}

export function useTemplate(id: string) {
  return useQuery({
    queryKey: ['template', id],
    queryFn: () => templateService.getTemplate(id),
    enabled: !!id,
    staleTime: 30000,
  });
}

export function useCreateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: templateService.createTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });
}

export function useUpdateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof templateService.updateTemplate>[1];
    }) => templateService.updateTemplate(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      queryClient.invalidateQueries({ queryKey: ['template', variables.id] });
    },
  });
}

export function useDeleteTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: templateService.deleteTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });
}

// API Key Hooks
export function useAPIKeys(params?: {
  page?: number;
  pageSize?: number;
  provider?: string;
}) {
  return useQuery({
    queryKey: ['api-keys', params],
    queryFn: () => apiKeyService.getAPIKeys(params),
    staleTime: 30000,
  });
}

export function useCreateAPIKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: apiKeyService.createAPIKey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
    },
  });
}

export function useDeleteAPIKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: apiKeyService.deleteAPIKey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
    },
  });
}

export function useTestAPIKey() {
  return useMutation({
    mutationFn: apiKeyService.testAPIKey,
  });
}
