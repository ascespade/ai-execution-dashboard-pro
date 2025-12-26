'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardContent, Button, Input, Toggle, Badge, Modal, ConfirmModal, Select } from '@/components/ui';
import { User, Bell, Shield, Key, CreditCard, Check, Copy, Plus, Trash2, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AI_PROVIDERS } from '@/lib/constants';

type SettingsTab = 'profile' | 'notifications' | 'api-keys' | 'security' | 'billing';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [showAddKeyModal, setShowAddKeyModal] = useState(false);
  const [showDeleteKeyModal, setShowDeleteKeyModal] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'api-keys', label: 'API Keys', icon: Key },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'billing', label: 'Billing', icon: CreditCard },
  ];

  const apiKeys = [
    { id: '1', provider: 'openai', name: 'OpenAI Production', created: '2024-01-15', lastUsed: '2 hours ago' },
    { id: '2', provider: 'anthropic', name: 'Claude Development', created: '2024-02-20', lastUsed: '1 day ago' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Settings
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Tabs */}
          <div className="lg:w-64 flex-shrink-0">
            <Card padding="sm">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as SettingsTab)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                        activeTab === tab.id
                          ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                          : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </Card>
          </div>

          {/* Content Area */}
          <div className="flex-1">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <Card>
                <CardHeader title="Profile Settings" description="Manage your personal information" />
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                        <User className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div>
                        <Button variant="outline" size="sm">Change Avatar</Button>
                        <p className="text-xs text-slate-500 mt-2">JPG, GIF or PNG. Max 2MB.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input label="Full Name" placeholder="John Doe" defaultValue="John Doe" />
                      <Input label="Email" type="email" placeholder="john@example.com" defaultValue="john@example.com" />
                    </div>

                    <Input label="Default Model" placeholder="Select default model" />

                    <div className="flex justify-end">
                      <Button variant="primary">Save Changes</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <Card>
                <CardHeader title="Notification Preferences" description="Choose how you want to be notified" />
                <CardContent>
                  <div className="space-y-6">
                    <Toggle
                      label="Email Notifications"
                      description="Receive email notifications about orchestration updates"
                      defaultChecked
                    />
                    <Toggle
                      label="Push Notifications"
                      description="Receive push notifications in your browser"
                      defaultChecked
                    />
                    <Toggle
                      label="Slack Notifications"
                      description="Send notifications to your Slack workspace"
                    />
                    <Toggle
                      label="Discord Notifications"
                      description="Send notifications to your Discord server"
                    />
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                      <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-4">
                        Notification Events
                      </h4>
                      <div className="space-y-4">
                        <Toggle label="Orchestration Completed" defaultChecked />
                        <Toggle label="Orchestration Failed" defaultChecked />
                        <Toggle label="Task Completed" />
                        <Toggle label="Weekly Summary" defaultChecked />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* API Keys Tab */}
            {activeTab === 'api-keys' && (
              <Card>
                <CardHeader
                  title="API Keys"
                  description="Manage your API keys for external services"
                  action={
                    <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowAddKeyModal(true)}>
                      Add API Key
                    </Button>
                  }
                />
                <CardContent>
                  <div className="space-y-4">
                    {apiKeys.map((key) => (
                      <div
                        key={key.id}
                        className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            'w-10 h-10 rounded-lg flex items-center justify-center',
                            key.provider === 'openai' && 'bg-emerald-100 dark:bg-emerald-900/30',
                            key.provider === 'anthropic' && 'bg-orange-100 dark:bg-orange-900/30'
                          )}>
                            <Key className={cn(
                              'w-5 h-5',
                              key.provider === 'openai' && 'text-emerald-600 dark:text-emerald-400',
                              key.provider === 'anthropic' && 'text-orange-600 dark:text-orange-400'
                            )} />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white">{key.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm text-slate-500">{key.provider}</span>
                              <span className="text-slate-300 dark:text-slate-600">•</span>
                              <span className="text-sm text-slate-500">Created {key.created}</span>
                              <span className="text-slate-300 dark:text-slate-600">•</span>
                              <span className="text-sm text-slate-500">Last used {key.lastUsed}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="success" size="sm">Active</Badge>
                          <Button variant="ghost" size="sm" iconOnly>
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            iconOnly
                            onClick={() => {
                              setSelectedKey(key.id);
                              setShowDeleteKeyModal(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <Card>
                <CardHeader title="Security Settings" description="Manage your account security" />
                <CardContent>
                  <div className="space-y-6">
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-slate-900 dark:text-white">Password</h4>
                          <p className="text-sm text-slate-500 mt-1">Last changed 30 days ago</p>
                        </div>
                        <Button variant="outline" size="sm">Change Password</Button>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-slate-900 dark:text-white">Two-Factor Authentication</h4>
                          <p className="text-sm text-slate-500 mt-1">Add an extra layer of security</p>
                        </div>
                        <Button variant="primary" size="sm">Enable 2FA</Button>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-slate-900 dark:text-white">Active Sessions</h4>
                          <p className="text-sm text-slate-500 mt-1">Manage your active login sessions</p>
                        </div>
                        <Button variant="outline" size="sm">View Sessions</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Billing Tab */}
            {activeTab === 'billing' && (
              <Card>
                <CardHeader title="Billing" description="Manage your subscription and billing" />
                <CardContent>
                  <div className="p-6 bg-gradient-to-r from-primary-600 to-primary-500 rounded-xl text-white mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm opacity-80">Current Plan</p>
                        <h3 className="text-2xl font-bold mt-1">Pro Plan</h3>
                        <p className="text-sm opacity-80 mt-2">$49/month • Renews on Mar 15, 2025</p>
                      </div>
                      <Button variant="secondary" size="sm">Upgrade Plan</Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg text-center">
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">156</p>
                      <p className="text-sm text-slate-500">Orchestrations</p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg text-center">
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">1,247</p>
                      <p className="text-sm text-slate-500">Tasks Run</p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg text-center">
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">$12.45</p>
                      <p className="text-sm text-slate-500">This Month</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Add API Key Modal */}
        <Modal
          isOpen={showAddKeyModal}
          onClose={() => setShowAddKeyModal(false)}
          title="Add API Key"
          description="Add a new API key for external services"
          size="md"
        >
          <div className="space-y-4">
            <Select
              label="Provider"
              options={AI_PROVIDERS}
              placeholder="Select provider"
            />
            <Input
              label="Key Name"
              placeholder="e.g., Production Key"
            />
            <Input
              label="API Key"
              placeholder="sk-..."
              type="password"
            />
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowAddKeyModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={() => setShowAddKeyModal(false)}>
                Add Key
              </Button>
            </div>
          </div>
        </Modal>

        {/* Delete Key Confirmation */}
        <ConfirmModal
          isOpen={showDeleteKeyModal}
          onClose={() => setShowDeleteKeyModal(false)}
          onConfirm={() => {
            console.log('Delete key:', selectedKey);
            setShowDeleteKeyModal(false);
          }}
          title="Delete API Key"
          message="Are you sure you want to delete this API key? This action cannot be undone."
          confirmText="Delete"
          variant="danger"
        />
      </div>
    </DashboardLayout>
  );
}
