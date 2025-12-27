'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardContent, Button, Badge, StatusBadge, Input } from '@/components/ui';
import { Search, Plus, MoreVertical, Cpu, Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { cn, formatRelativeTime } from '@/lib/utils';
import { mockAgents } from '@/lib/mock-data';

const categories = [
  { name: 'All', count: mockAgents.length },
  { name: 'Coding', count: mockAgents.filter(a => a.category === 'coding').length },
  { name: 'Debugging', count: mockAgents.filter(a => a.category === 'debugging').length },
  { name: 'Testing', count: mockAgents.filter(a => a.category === 'testing').length },
  { name: 'Documentation', count: mockAgents.filter(a => a.category === 'documentation').length },
];

export default function CloudAgentsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Cloud Agents
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Manage and monitor your AI agents
            </p>
          </div>
          <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
            Add Agent
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card padding="md">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                <Cpu className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Total Agents</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{mockAgents.length}</p>
              </div>
            </div>
          </Card>
          <Card padding="md">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Available</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {mockAgents.filter(a => a.status === 'available').length}
                </p>
              </div>
            </div>
          </Card>
          <Card padding="md">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/30">
                <Loader2 className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Busy</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {mockAgents.filter(a => a.status === 'busy').length}
                </p>
              </div>
            </div>
          </Card>
          <Card padding="md">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800">
                <XCircle className="w-6 h-6 text-slate-600 dark:text-slate-400" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Offline</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {mockAgents.filter(a => a.status === 'offline').length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category.name}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                category.name === 'All'
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
              )}
            >
              {category.name}
              <span className="ml-2 px-2 py-0.5 rounded-full bg-white dark:bg-slate-700 text-xs">
                {category.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <Input
          placeholder="Search agents..."
          leftIcon={<Search className="w-4 h-4" />}
        />

        {/* Agents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockAgents.map((agent) => (
            <Card key={agent.id} padding="md" className="hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center',
                    agent.category === 'coding' && 'bg-blue-100 dark:bg-blue-900/30',
                    agent.category === 'debugging' && 'bg-red-100 dark:bg-red-900/30',
                    agent.category === 'testing' && 'bg-green-100 dark:bg-green-900/30',
                    agent.category === 'documentation' && 'bg-purple-100 dark:bg-purple-900/30'
                  )}>
                    <Cpu className={cn(
                      'w-6 h-6',
                      agent.category === 'coding' && 'text-blue-600 dark:text-blue-400',
                      agent.category === 'debugging' && 'text-red-600 dark:text-red-400',
                      agent.category === 'testing' && 'text-green-600 dark:text-green-400',
                      agent.category === 'documentation' && 'text-purple-600 dark:text-purple-400'
                    )} />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900 dark:text-white">
                      {agent.display_name}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {agent.category}
                    </p>
                  </div>
                </div>
                <button className="text-slate-400 hover:text-slate-600">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <StatusBadge status={agent.status} />
                <Button variant="ghost" size="sm">
                  Configure
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
