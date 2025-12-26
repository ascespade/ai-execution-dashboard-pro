'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout';
import { StatsCard, ActivityChart, RecentActivity } from '@/components/dashboard';
import { Activity, GitBranch, CheckCircle2, TrendingUp, Clock, Zap } from 'lucide-react';
import { mockDashboardStats, mockActivityData, mockRecentOrchestrations } from '@/lib/mock-data';

export default function DashboardPage() {
  // In production, use: const { data: stats } = useDashboardStats();
  const stats = mockDashboardStats;
  const activityData = mockActivityData;
  const recentOrchestrations = mockRecentOrchestrations;

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
