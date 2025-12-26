'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout';
import { Card, CardHeader, CardContent, Button, Input, Badge, StatusBadge, Select } from '@/components/ui';
import { Plus, Search, Filter, MoreVertical, Play, Pause, Trash2, Eye } from 'lucide-react';
import { cn, formatRelativeTime } from '@/lib/utils';
import { mockOrchestrations } from '@/lib/mock-data';
import type { OrchestrationSummary, Status } from '@/types';

export default function OrchestrationsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<Status | ''>('');
  const orchestrations = mockOrchestrations;

  const filteredOrchestrations = orchestrations.filter((orch) => {
    const matchesSearch = orch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      orch.repository_url.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || orch.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: orchestrations.length,
    running: orchestrations.filter(o => o.status === 'RUNNING').length,
    completed: orchestrations.filter(o => o.status === 'COMPLETED').length,
    failed: orchestrations.filter(o => o.status === 'FAILED').length,
    pending: orchestrations.filter(o => o.status === 'PENDING').length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Orchestrations
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Manage and monitor your AI agent orchestrations
            </p>
          </div>
          <Link href="/orchestrations/new">
            <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
              New Orchestration
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card padding="sm">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search orchestrations..."
                leftIcon={<Search className="w-4 h-4" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select
                options={[
                  { value: '', label: 'All Status' },
                  { value: 'RUNNING', label: 'Running' },
                  { value: 'COMPLETED', label: 'Completed' },
                  { value: 'FAILED', label: 'Failed' },
                  { value: 'PENDING', label: 'Pending' },
                ]}
                value={statusFilter}
                onChange={(value) => setStatusFilter(value as Status | '')}
                placeholder="Filter by status"
              />
            </div>
          </div>
        </Card>

        {/* Status Tabs */}
        <div className="flex gap-2">
          {(['all', 'running', 'completed', 'failed', 'pending'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status === 'all' ? '' : status.toUpperCase() as Status)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                (!statusFilter && status === 'all') || statusFilter === status.toUpperCase()
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
              )}
            >
              {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
              <span className="ml-2 px-2 py-0.5 rounded-full bg-white dark:bg-slate-700 text-xs">
                {statusCounts[status]}
              </span>
            </button>
          ))}
        </div>

        {/* Orchestrations List */}
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                    Name
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                    Repository
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                    Status
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                    Progress
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                    Created
                  </th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredOrchestrations.map((orch) => (
                  <tr
                    key={orch.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <Link
                        href={`/orchestrations/${orch.id}`}
                        className="font-medium text-slate-900 dark:text-white hover:text-primary-600"
                      >
                        {orch.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-500 dark:text-slate-400 truncate max-w-xs block">
                        {orch.repository_url}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={orch.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full transition-all',
                              orch.status === 'COMPLETED' && 'bg-emerald-500',
                              orch.status === 'RUNNING' && 'bg-blue-500',
                              orch.status === 'FAILED' && 'bg-red-500',
                              orch.status === 'PENDING' && 'bg-amber-500'
                            )}
                            style={{ width: `${orch.progress}%` }}
                          />
                        </div>
                        <span className="text-sm text-slate-500">{orch.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        {formatRelativeTime(orch.created_at)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/orchestrations/${orch.id}`}>
                          <Button variant="ghost" size="sm" iconOnly>
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        {orch.status === 'RUNNING' && (
                          <Button variant="ghost" size="sm" iconOnly>
                            <Pause className="w-4 h-4" />
                          </Button>
                        )}
                        {orch.status === 'PENDING' && (
                          <Button variant="ghost" size="sm" iconOnly>
                            <Play className="w-4 h-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" iconOnly>
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredOrchestrations.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-500 dark:text-slate-400">No orchestrations found</p>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
