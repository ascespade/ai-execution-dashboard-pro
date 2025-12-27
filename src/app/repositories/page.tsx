'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardContent, Button, Input, Badge, Modal, ConfirmModal } from '@/components/ui';
import { Plus, Search, MoreVertical, Link2, GitBranch, Shield, Code2, Settings } from 'lucide-react';
import { cn, formatRelativeTime } from '@/lib/utils';
import { mockRepositories } from '@/lib/mock-data';

export default function RepositoriesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);

  const filteredRepos = mockRepositories.filter(repo =>
    repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    repo.repository_url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (id: string) => {
    setSelectedRepo(id);
    setShowDeleteModal(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Repositories
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Manage your connected repositories
            </p>
          </div>
          <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowAddModal(true)}>
            Add Repository
          </Button>
        </div>

        {/* Search */}
        <Input
          placeholder="Search repositories..."
          leftIcon={<Search className="w-4 h-4" />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {/* Repositories List */}
        <div className="space-y-4">
          {filteredRepos.map((repo) => (
            <Card key={repo.id} padding="md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800">
                    <Link2 className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900 dark:text-white">{repo.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <GitBranch className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-500 dark:text-slate-400">{repo.branch}</span>
                      <span className="text-slate-300 dark:text-slate-600">•</span>
                      <span className="text-sm text-slate-500 dark:text-slate-400 truncate max-w-md">
                        {repo.repository_url}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {repo.auto_merge && (
                      <Badge variant="success" size="sm">Auto Merge</Badge>
                    )}
                    {repo.safety_policy && (
                      <Badge variant="info" size="sm">
                        <Shield className="w-3 h-3 mr-1" />
                        {repo.safety_policy}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" leftIcon={<Settings className="w-4 h-4" />}>
                      Settings
                    </Button>
                    <Button variant="ghost" size="sm" iconOnly>
                      <MoreVertical className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 grid grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Code Style</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{repo.code_style}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Preferred Agents</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {repo.preferred_agents.join(', ')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Connected</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {formatRelativeTime(repo.created_at)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Last Updated</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {formatRelativeTime(repo.updated_at)}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredRepos.length === 0 && (
          <Card padding="lg" className="text-center">
            <Link2 className="w-12 h-12 mx-auto text-slate-300" />
            <p className="text-slate-500 dark:text-slate-400 mt-4">No repositories found</p>
            <Button variant="primary" className="mt-4" onClick={() => setShowAddModal(true)}>
              Add your first repository
            </Button>
          </Card>
        )}

        {/* Add Repository Modal */}
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Add Repository"
          description="Connect a new GitHub repository"
          size="md"
        >
          <div className="space-y-4">
            <Input
              label="Repository URL"
              placeholder="https://github.com/owner/repo"
            />
            <Input
              label="Branch"
              placeholder="main"
            />
            <Input
              label="Name"
              placeholder="my-repo"
            />
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={() => setShowAddModal(false)}>
                Connect Repository
              </Button>
            </div>
          </div>
        </Modal>

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={() => {
            console.log('Delete repo:', selectedRepo);
            setShowDeleteModal(false);
          }}
          title="Delete Repository"
          message="Are you sure you want to disconnect this repository? This action cannot be undone."
          confirmText="Disconnect"
          variant="danger"
        />
      </div>
    </DashboardLayout>
  );
}
