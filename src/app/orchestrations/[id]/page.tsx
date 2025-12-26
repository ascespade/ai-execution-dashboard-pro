'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout';
import { Card, CardHeader, CardContent, Button, Badge, StatusBadge, Input } from '@/components/ui';
import { GitBranch, Clock, Calendar, User, FileCode, MessageSquare } from 'lucide-react';
import { cn, formatDate, formatDuration, formatRelativeTime } from '@/lib/utils';
import type { Orchestration, Task } from '@/types';

// Mock data for demonstration
const mockOrchestration: Orchestration & { tasks: Task[] } = {
  id: '1',
  user_id: 'user-1',
  name: 'Implement user authentication',
  description: 'Add comprehensive user authentication with OAuth2 and JWT tokens',
  repository_url: 'https://github.com/example/my-app',
  branch: 'feature/auth',
  prompt: 'Implement user authentication system with login, register, and logout functionality',
  model: 'claude-3-opus',
  mode: 'AUTO',
  status: 'RUNNING',
  progress: 65,
  task_size: 'MEDIUM',
  priority: 'HIGH',
  max_iterations: 20,
  auto_fix_enabled: true,
  testing_enabled: true,
  validation_enabled: true,
  metadata: {},
  created_at: new Date(Date.now() - 7200000).toISOString(),
  updated_at: new Date().toISOString(),
  started_at: new Date(Date.now() - 3600000).toISOString(),
  completed_at: undefined,
  error_message: undefined,
  tasks: [
    {
      id: 't1',
      orchestration_id: '1',
      agent_id: 'a1',
      title: 'Create authentication routes',
      description: 'Implement login, register, and logout API endpoints',
      status: 'COMPLETED',
      priority: 1,
      order_index: 0,
      input_data: {},
      output_data: {},
      started_at: new Date(Date.now() - 3600000).toISOString(),
      completed_at: new Date(Date.now() - 3000000).toISOString(),
      duration_seconds: 600,
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 't2',
      orchestration_id: '1',
      agent_id: 'a1',
      title: 'Implement JWT token generation',
      description: 'Create JWT token generation and validation logic',
      status: 'COMPLETED',
      priority: 2,
      order_index: 1,
      input_data: {},
      output_data: {},
      started_at: new Date(Date.now() - 3000000).toISOString(),
      completed_at: new Date(Date.now() - 2400000).toISOString(),
      duration_seconds: 600,
      created_at: new Date(Date.now() - 3000000).toISOString(),
    },
    {
      id: 't3',
      orchestration_id: '1',
      agent_id: 'a2',
      title: 'Add OAuth2 integration',
      description: 'Integrate Google and GitHub OAuth2 providers',
      status: 'RUNNING',
      priority: 3,
      order_index: 2,
      input_data: {},
      output_data: {},
      started_at: new Date(Date.now() - 2400000).toISOString(),
      created_at: new Date(Date.now() - 2400000).toISOString(),
    },
    {
      id: 't4',
      orchestration_id: '1',
      agent_id: 'a3',
      title: 'Write unit tests',
      description: 'Create comprehensive unit tests for authentication',
      status: 'PENDING',
      priority: 4,
      order_index: 3,
      created_at: new Date(Date.now() - 2400000).toISOString(),
    },
  ],
};

export default function OrchestrationDetailPage({ params }: { params: { id: string } }) {
  const { tasks } = mockOrchestration;

  const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
  const totalDuration = tasks.reduce((acc, task) => acc + (task.duration_seconds || 0), 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => window.history.back()}>
          ← Back to Orchestrations
        </Button>

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {mockOrchestration.name}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              {mockOrchestration.description}
            </p>
            <div className="flex items-center gap-4 mt-4">
              <StatusBadge status={mockOrchestration.status} size="md" />
              <span className="text-sm text-slate-500">
                Started {formatRelativeTime(mockOrchestration.started_at || mockOrchestration.created_at)}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            {mockOrchestration.status === 'RUNNING' && (
              <Button variant="outline" leftIcon={<PauseIcon />}>
                Pause
              </Button>
            )}
            {mockOrchestration.status === 'PAUSED' && (
              <Button variant="primary" leftIcon={<PlayIcon />}>
                Resume
              </Button>
            )}
            {['PENDING', 'PAUSED'].includes(mockOrchestration.status) && (
              <Button variant="danger" leftIcon={<XIcon />}>
                Cancel
              </Button>
            )}
          </div>
        </div>

        {/* Progress Card */}
        <Card>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Overall Progress</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {mockOrchestration.progress}%
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500 dark:text-slate-400">Tasks</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {completedTasks}/{tasks.length}
                </p>
              </div>
            </div>
            <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-600 rounded-full transition-all duration-500"
                style={{ width: `${mockOrchestration.progress}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tasks List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader title="Tasks" description="Orchestration tasks and their status" />
              <CardContent>
                <div className="space-y-4">
                  {tasks.map((task, index) => (
                    <div
                      key={task.id}
                      className={cn(
                        'p-4 rounded-lg border transition-all',
                        task.status === 'RUNNING'
                          ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20'
                          : task.status === 'COMPLETED'
                          ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20'
                          : task.status === 'FAILED'
                          ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                          : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800'
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div
                            className={cn(
                              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                              task.status === 'COMPLETED' && 'bg-emerald-100 text-emerald-700',
                              task.status === 'RUNNING' && 'bg-blue-100 text-blue-700',
                              task.status === 'FAILED' && 'bg-red-100 text-red-700',
                              task.status === 'PENDING' && 'bg-slate-100 text-slate-600'
                            )}
                          >
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white">
                              {task.title}
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                              {task.description}
                            </p>
                            {task.duration_seconds && (
                              <p className="text-xs text-slate-400 mt-1">
                                Duration: {formatDuration(task.duration_seconds)}
                              </p>
                            )}
                          </div>
                        </div>
                        <StatusBadge status={task.status} size="sm" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            {/* Configuration */}
            <Card>
              <CardHeader title="Configuration" />
              <CardContent>
                <div className="space-y-4">
                  <InfoRow label="Repository" value={mockOrchestration.repository_url} icon={<GitBranch className="w-4 h-4" />} />
                  <InfoRow label="Branch" value={mockOrchestration.branch} icon={<GitBranch className="w-4 h-4" />} />
                  <InfoRow label="Model" value={mockOrchestration.model || 'Auto'} icon={<FileCode className="w-4 h-4" />} />
                  <InfoRow label="Mode" value={mockOrchestration.mode} icon={<SettingsIcon />} />
                  <InfoRow label="Priority" value={mockOrchestration.priority || 'Normal'} icon={<Calendar className="w-4 h-4" />} />
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardHeader title="Statistics" />
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <StatCard label="Total Duration" value={formatDuration(totalDuration)} />
                  <StatCard label="Auto Fixes" value="3" />
                  <StatCard label="Tests Run" value="24" />
                  <StatCard label="Success Rate" value="95%" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// Helper components
const InfoRow = ({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) => (
  <div className="flex items-center gap-3">
    <div className="text-slate-400">{icon}</div>
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{value}</p>
    </div>
  </div>
);

const StatCard = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 text-center">
    <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
    <p className="text-xs text-slate-500">{label}</p>
  </div>
);

const PauseIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const PlayIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const XIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
