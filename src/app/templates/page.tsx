'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardContent, Button, Input, Badge, Modal, ConfirmModal } from '@/components/ui';
import { Plus, Search, MoreVertical, FileCode, Copy, Edit, Trash2, Eye } from 'lucide-react';
import { cn, formatRelativeTime } from '@/lib/utils';
import { mockTemplates } from '@/lib/mock-data';

export default function TemplatesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const filteredTemplates = mockTemplates.filter(template =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopyTemplate = (content: string) => {
    navigator.clipboard.writeText(content);
    // In production, show toast notification
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Prompt Templates
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Create and manage reusable prompt templates
            </p>
          </div>
          <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowCreateModal(true)}>
            Create Template
          </Button>
        </div>

        {/* Search */}
        <Input
          placeholder="Search templates..."
          leftIcon={<Search className="w-4 h-4" />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTemplates.map((template) => (
            <Card key={template.id} padding="md">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                    <FileCode className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900 dark:text-white">{template.name}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {template.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {template.is_public && (
                    <Badge variant="info" size="sm">Public</Badge>
                  )}
                  <button
                    className="text-slate-400 hover:text-slate-600"
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3 font-mono">
                  {template.template_content}
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {template.category && (
                    <Badge variant="default" size="sm">{template.category}</Badge>
                  )}
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {template.variables.length} variables
                  </span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    Used {template.usage_count} times
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyTemplate(template.template_content)}
                    leftIcon={<Copy className="w-4 h-4" />}
                  >
                    Copy
                  </Button>
                  <Button variant="primary" size="sm">
                    Use Template
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <Card padding="lg" className="text-center">
            <FileCode className="w-12 h-12 mx-auto text-slate-300" />
            <p className="text-slate-500 dark:text-slate-400 mt-4">No templates found</p>
            <Button variant="primary" className="mt-4" onClick={() => setShowCreateModal(true)}>
              Create your first template
            </Button>
          </Card>
        )}

        {/* Create Template Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create Template"
          description="Create a new prompt template"
          size="lg"
        >
          <div className="space-y-4">
            <Input
              label="Template Name"
              placeholder="e.g., Feature Implementation"
            />
            <Input
              label="Description"
              placeholder="Brief description of when to use this template"
            />
            <Input
              label="Category"
              placeholder="e.g., Development, Bug Fixing"
            />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Template Content
              </label>
              <textarea
                className="w-full px-4 py-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
                placeholder="Enter your prompt template..."
                rows={6}
              />
              <p className="text-xs text-slate-500 mt-1">
                Use {'{{variable}}'} syntax to define template variables
              </p>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={() => setShowCreateModal(false)}>
                Create Template
              </Button>
            </div>
          </div>
        </Modal>

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={() => {
            console.log('Delete template:', selectedTemplate);
            setShowDeleteModal(false);
          }}
          title="Delete Template"
          message="Are you sure you want to delete this template? This action cannot be undone."
          confirmText="Delete"
          variant="danger"
        />
      </div>
    </DashboardLayout>
  );
}
