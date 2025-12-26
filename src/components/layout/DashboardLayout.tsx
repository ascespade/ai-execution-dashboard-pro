// Main Layout Component

'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore, useUIStore } from '@/store';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Spinner } from '@/components/ui';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const { sidebarCollapsed } = useUIStore();

  // Auth check
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Redirect logic
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const publicPaths = ['/login', '/register', '/forgot-password'];
      const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

      if (!isPublicPath) {
        router.push('/login');
      }
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  // Calculate main content margin based on sidebar state
  const mainMargin = sidebarCollapsed ? '72px' : '256px';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" />
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated and on a public path, render children without layout
  const publicPaths = ['/login', '/register', '/forgot-password'];
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  if (!isAuthenticated && isPublicPath) {
    return <>{children}</>;
  }

  // For authenticated users, show the full layout
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Sidebar />
      <Header />
      <main
        className="pt-16 min-h-screen transition-all duration-300"
        style={{ marginLeft: mainMargin }}
      >
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
};
