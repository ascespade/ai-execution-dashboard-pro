// Recent Activity Component

'use client';

import React from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  XCircle,
  Clock,
  PlayCircle,
  GitBranch,
  ArrowRight,
} from 'lucide-react';
import { cn, formatRelativeTime } from '@/lib/utils';
import { Card, CardHeader, StatusBadge, Button } from '@/components/ui';
import type { OrchestrationSummary } from '@/types';

interface RecentActivityProps {
  orchestrations: OrchestrationSummary[];
  title?: string;
  description?: string;
  showViewAll?: boolean;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({
  orchestrations,
  title = 'Recent Orchestrations',
  description = 'Your latest orchestration activities',
  showViewAll = true,
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'FAILED':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'RUNNING':
        return <PlayCircle className="w-5 h-5 text-blue-500" />;
      default:
        return <Clock className="w-5 h-5 text-amber-500" />;
    }
  };

  return (
    <Card>
      <CardHeader
        title={title}
        description={description}
        action={
          showViewAll && (
            <Link href="/orchestrations">
              <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                View All
              </Button>
            </Link>
          )
        }
      />
      <CardContent>
        <div className="space-y-4">
          {orchestrations.length === 0 ? (
            <div className="text-center py-8">
              <GitBranch className="w-12 h-12 mx-auto text-slate-300" />
              <p className="text-slate-500 mt-4">No orchestrations yet</p>
              <Link href="/orchestrations/new">
                <Button variant="primary" size="sm" className="mt-4">
                  Create your first orchestration
                </Button>
              </Link>
            </div>
          ) : (
            orchestrations.map((orchestration) => (
              <Link
                key={orchestration.id}
                href={`/orchestrations/${orchestration.id}`}
                className={cn(
                  'flex items-center gap-4 p-4 rounded-lg',
                  'bg-slate-50 dark:bg-slate-800/50',
                  'hover:bg-slate-100 dark:hover:bg-slate-800',
                  'transition-colors duration-200',
                  'group'
                )}
              >
                <div className="flex-shrink-0">
                  {getStatusIcon(orchestration.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                    {orchestration.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {orchestration.repository_url}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <StatusBadge status={orchestration.status} size="sm" />
                    <p className="text-xs text-slate-500 mt-1">
                      {formatRelativeTime(orchestration.created_at)}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
