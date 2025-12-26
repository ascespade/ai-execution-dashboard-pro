// Header Component

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Bell,
  Moon,
  Sun,
  User,
  LogOut,
  ChevronDown,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore, useUIStore } from '@/store';
import { Input, Badge, Button } from '@/components/ui';
import { formatRelativeTime } from '@/lib/utils';

export const Header: React.FC = () => {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const {
    darkMode,
    toggleDarkMode,
    notifications,
    unreadCount,
    notificationsOpen,
    setNotificationsOpen,
    searchQuery,
    setSearchQuery,
    globalSearchOpen,
    setGlobalSearchOpen,
  } = useUIStore();

  const [showUserMenu, setShowUserMenu] = React.useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <header
      className={cn(
        'fixed top-0 right-0 z-30 h-16 bg-white border-b border-slate-200',
        'flex items-center justify-between px-6',
        'dark:bg-slate-900 dark:border-slate-700',
        'transition-all duration-300'
      )}
      style={{ left: 'var(--sidebar-width)' }}
    >
      {/* Search */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search orchestrations, agents, repositories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              'w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg',
              'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
              'placeholder:text-slate-400',
              'dark:bg-slate-800 dark:border-slate-600 dark:text-white'
            )}
          />
          <kbd className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 items-center gap-1 px-2 py-0.5 text-xs text-slate-400 bg-slate-100 dark:bg-slate-700 rounded">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 ml-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleDarkMode}
          className={cn(
            'p-2 rounded-lg transition-colors',
            'hover:bg-slate-100 dark:hover:bg-slate-800',
            'text-slate-500 dark:text-slate-400'
          )}
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className={cn(
              'relative p-2 rounded-lg transition-colors',
              'hover:bg-slate-100 dark:hover:bg-slate-800',
              'text-slate-500 dark:text-slate-400'
            )}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 text-xs bg-red-500 text-white rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 animate-fade-in">
              <div className="p-4 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    Notifications
                  </h3>
                  {unreadCount > 0 && (
                    <button className="text-sm text-primary-600 hover:text-primary-700">
                      Mark all as read
                    </button>
                  )}
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">
                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No notifications yet</p>
                  </div>
                ) : (
                  notifications.slice(0, 5).map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        'p-4 border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50',
                        !notification.is_read && 'bg-primary-50/50 dark:bg-primary-900/10'
                      )}
                    >
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {notification.title}
                      </p>
                      <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {formatRelativeTime(notification.created_at)}
                      </p>
                    </div>
                  ))
                )}
              </div>
              <div className="p-3 border-t border-slate-100 dark:border-slate-700">
                <button className="w-full text-center text-sm text-primary-600 hover:text-primary-700">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className={cn(
              'flex items-center gap-2 p-1.5 rounded-lg transition-colors',
              'hover:bg-slate-100 dark:hover:bg-slate-800'
            )}
          >
            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.name}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <User className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              )}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                {user?.name || 'Guest'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {user?.email || 'guest@example.com'}
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 hidden md:block" />
          </button>

          {/* User Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 animate-fade-in">
              <div className="p-3 border-b border-slate-100 dark:border-slate-700">
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {user?.name || 'Guest User'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {user?.email || 'guest@example.com'}
                </p>
              </div>
              <div className="p-1">
                <button
                  onClick={() => {
                    router.push('/settings');
                    setShowUserMenu(false);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
