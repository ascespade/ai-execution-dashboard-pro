// Sidebar Component

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Cpu,
  GitBranch,
  FolderGit2,
  FileCode,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store';

const navigationItems = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/agents', icon: Cpu, label: 'Cloud Agents' },
  { href: '/orchestrations', icon: GitBranch, label: 'Orchestrations' },
  { href: '/repositories', icon: FolderGit2, label: 'Repositories' },
  { href: '/templates', icon: FileCode, label: 'Templates' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { sidebarCollapsed, setSidebarCollapsed, darkMode } = useUIStore();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-white border-r border-slate-200 transition-all duration-300',
        'dark:bg-slate-900 dark:border-slate-700',
        sidebarCollapsed ? 'w-[72px]' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-slate-200 dark:border-slate-700">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary-600 text-white">
            <Sparkles className="w-6 h-6" />
          </div>
          {!sidebarCollapsed && (
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              Cursor Monitor
            </span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                'hover:bg-slate-100 dark:hover:bg-slate-800',
                isActive
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400 font-medium'
                  : 'text-slate-600 dark:text-slate-400',
                sidebarCollapsed && 'justify-center'
              )}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <Icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-primary-600 dark:text-primary-400')} />
              {!sidebarCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className={cn(
            'w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg',
            'text-slate-500 hover:text-slate-700 hover:bg-slate-100',
            'dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800',
            'transition-colors duration-200'
          )}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
