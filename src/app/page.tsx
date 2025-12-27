'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout';
import { StatsCard, ActivityChart, RecentActivity } from '@/components/dashboard';
import { Activity, GitBranch, CheckCircle2, TrendingUp, Clock, Zap } from 'lucide-react';
import { useOrchestrations, usePlatformHealth } from '@/platform/adapter/hooks/usePlatform';
import { selectTelemetryHistory, useIntelligenceStore } from '@/intelligence/store';

export default function DashboardPage() {
  const { data: orchestrationsData, isLoading: isLoadingOrchestrations } = useOrchestrations();
  const { data: healthData, isLoading: isLoadingHealth } = usePlatformHealth();
  const telemetryHistory = useIntelligenceStore(selectTelemetryHistory);

  const isLoading = isLoadingOrchestrations || isLoadingHealth;

  // Calculate stats from live data
  const orchestrations = orchestrationsData?.orchestrations || [];
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

  const stats = {
    total_orchestrations: orchestrations.length,
    active_orchestrations: orchestrations.filter(o => o.status === 'running').length,
    completed_today: orchestrations.filter(o => {
      const createdAt = new Date(o.createdAt);
      return o.status === 'completed' && createdAt.toISOString() >= todayStart;
    }).length,
    success_rate: orchestrations.length > 0
      ? Math.round((orchestrations.filter(o => o.status === 'completed').length / orchestrations.length) * 100)
      : 100,
    total_tasks: orchestrations.reduce((sum, o) => sum + (o.progress || 0), 0),
    average_duration_minutes: Math.round(orchestrations.reduce((sum, o) => sum + (o.duration || 0), 0) / Math.max(orchestrations.length, 1)),
    active_agents: orchestrations.filter(o => o.status === 'running').length,
  };

  // Transform telemetry data for activity chart
  const activityData = telemetryHistory.length > 0
    ? telemetryHistory.map(point => ({
        date: point.timestamp.split('T')[0],
        orchestrations: point.activeRequests,
        tasks: point.queueDepth,
      }))
    : [
        { date: '2024-01-01', orchestrations: 12, tasks: 45 },
        { date: '2024-01-02', orchestrations: 19, tasks: 67 },
        { date: '2024-01-03', orchestrations: 15, tasks: 52 },
        { date: '2024-01-04', orchestrations: 23, tasks: 89 },
        { date: '2024-01-05', orchestrations: 18, tasks: 63 },
        { date: '2024-01-06', orchestrations: 25, tasks: 95 },
        { date: '2024-01-07', orchestrations: 21, tasks: 78 },
      ];

  // Transform orchestrations for RecentActivity component
  const recentOrchestrations = orchestrations
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .map(orch => ({
      id: orch.id,
      name: orch.name,
      status: orch.status.toUpperCase() as 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'PAUSED',
      progress: orch.progress,
      repository_url: orch.repositoryUrl,
      created_at: orch.createdAt,
      task_count: Math.round(orch.progress / 10), // Estimate based on progress
      completed_tasks: Math.round(orch.progress / 10), // Estimate based on progress
      duration_seconds: orch.duration,
    }));

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Loading dashboard data...</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 animate-pulse">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Monitor your AI agent orchestrations and track performance
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Orchestrations"
            value={stats.total_orchestrations}
            change={12}
            changeLabel="vs last month"
            icon={GitBranch}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100"
            delay={0}
          />
          <StatsCard
            title="Active Orchestrations"
            value={stats.active_orchestrations}
            icon={Activity}
            iconColor="text-amber-600"
            iconBgColor="bg-amber-100"
            delay={100}
          />
          <StatsCard
            title="Completed Today"
            value={stats.completed_today}
            change={8}
            changeLabel="vs yesterday"
            icon={CheckCircle2}
            iconColor="text-emerald-600"
            iconBgColor="bg-emerald-100"
            delay={200}
          />
          <StatsCard
            title="Success Rate"
            value={`${stats.success_rate}%`}
            change={2.5}
            changeLabel="improvement"
            icon={TrendingUp}
            iconColor="text-purple-600"
            iconBgColor="bg-purple-100"
            delay={300}
          />
        </div>

        {/* Charts and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ActivityChart data={activityData} />
          </div>
          <div>
            <RecentActivity orchestrations={recentOrchestrations} />
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-cyan-100 dark:bg-cyan-900/30">
                <Zap className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Total Tasks</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stats.total_tasks.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-orange-100 dark:bg-orange-900/30">
                <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Avg Duration</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stats.average_duration_minutes}m
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                <Activity className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Active Agents</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stats.active_agents}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
