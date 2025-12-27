'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout';
import { Card, CardHeader, CardContent, Button, Input, Select, Textarea, Toggle } from '@/components/ui';
import { ArrowLeft, ArrowRight, Check, GitBranch, FileCode, Settings, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ORCHESTRATION_MODES, TASK_SIZES, PRIORITIES } from '@/lib/constants';

const steps = [
  { id: 'repo', label: 'Repository', icon: GitBranch },
  { id: 'prompt', label: 'Prompt', icon: FileCode },
  { id: 'config', label: 'Configuration', icon: Settings },
  { id: 'review', label: 'Review', icon: Sparkles },
];

export default function CreateOrchestrationPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    repositoryUrl: '',
    branch: 'main',
    name: '',
    description: '',
    prompt: '',
    mode: 'AUTO',
    taskSize: 'MEDIUM',
    priority: 'NORMAL',
    autoFixEnabled: true,
    testingEnabled: true,
    validationEnabled: true,
    model: '',
  });

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    router.push('/orchestrations');
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return formData.repositoryUrl && formData.name;
      case 1:
        return formData.prompt.length >= 10;
      case 2:
        return true;
      default:
        return true;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push('/orchestrations')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Create Orchestration
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Set up a new AI agent orchestration
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;

            return (
              <React.Fragment key={step.id}>
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'flex items-center justify-center w-10 h-10 rounded-full transition-all',
                      isActive && 'bg-primary-600 text-white',
                      isCompleted && 'bg-emerald-500 text-white',
                      !isActive && !isCompleted && 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
                    )}
                  >
                    {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span
                    className={cn(
                      'text-sm font-medium',
                      isActive && 'text-primary-600 dark:text-primary-400',
                      isCompleted && 'text-emerald-600 dark:text-emerald-400',
                      !isActive && !isCompleted && 'text-slate-500'
                    )}
                  >
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      'flex-1 h-0.5 mx-4',
                      index < currentStep ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'
                    )}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Step Content */}
        <Card>
          <CardContent className="pt-6">
            {/* Step 1: Repository */}
            {currentStep === 0 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Select Repository
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Choose the repository where you want to run the orchestration
                  </p>
                </div>

                <Input
                  label="Repository URL"
                  placeholder="https://github.com/owner/repo"
                  value={formData.repositoryUrl}
                  onChange={(e) => setFormData({ ...formData, repositoryUrl: e.target.value })}
                  hint="Enter the GitHub repository URL"
                />

                <Input
                  label="Branch"
                  placeholder="main"
                  value={formData.branch}
                  onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                />

                <Input
                  label="Orchestration Name"
                  placeholder="e.g., Implement user authentication"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  hint="A descriptive name for this orchestration"
                />

                <Textarea
                  label="Description (optional)"
                  placeholder="Brief description of what this orchestration should accomplish..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
            )}

            {/* Step 2: Prompt */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Define Your Task
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Describe what you want the AI agents to accomplish
                  </p>
                </div>

                <Textarea
                  label="Prompt"
                  placeholder="Describe the task you want to automate. Be specific about what should be done..."
                  value={formData.prompt}
                  onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                  rows={8}
                  error={formData.prompt.length > 0 && formData.prompt.length < 10 ? 'Prompt must be at least 10 characters' : undefined}
                />

                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-2">
                    Tips for a good prompt
                  </h3>
                  <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                    <li>• Be specific about the desired outcome</li>
                    <li>• Include relevant context about the codebase</li>
                    <li>• Specify any constraints or requirements</li>
                    <li>• Mention any files or modules that should be modified</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Step 3: Configuration */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Configuration
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Customize how the orchestration will run
                  </p>
                </div>

                <Select
                  label="Mode"
                  options={ORCHESTRATION_MODES}
                  value={formData.mode}
                  onChange={(value) => setFormData({ ...formData, mode: Array.isArray(value) ? value[0] : value })}
                />

                <Select
                  label="Task Size"
                  options={TASK_SIZES}
                  value={formData.taskSize}
                  onChange={(value) => setFormData({ ...formData, taskSize: Array.isArray(value) ? value[0] : value })}
                />

                <Select
                  label="Priority"
                  options={PRIORITIES}
                  value={formData.priority}
                  onChange={(value) => setFormData({ ...formData, priority: Array.isArray(value) ? value[0] : value })}
                />

                <Input
                  label="Model (optional)"
                  placeholder="Leave empty for auto-selection"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  hint="Specify a particular model, or leave empty for auto-selection"
                />

                <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <Toggle
                    label="Auto Fix Enabled"
                    description="Automatically attempt to fix errors"
                    checked={formData.autoFixEnabled}
                    onChange={(e) => setFormData({ ...formData, autoFixEnabled: e.target.checked })}
                  />
                  <Toggle
                    label="Testing Enabled"
                    description="Run tests after completing tasks"
                    checked={formData.testingEnabled}
                    onChange={(e) => setFormData({ ...formData, testingEnabled: e.target.checked })}
                  />
                  <Toggle
                    label="Validation Enabled"
                    description="Validate outputs before considering tasks complete"
                    checked={formData.validationEnabled}
                    onChange={(e) => setFormData({ ...formData, validationEnabled: e.target.checked })}
                  />
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Review & Create
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Review your orchestration configuration before creating
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6 space-y-4">
                  <ReviewRow label="Name" value={formData.name} />
                  <ReviewRow label="Repository" value={formData.repositoryUrl} />
                  <ReviewRow label="Branch" value={formData.branch} />
                  <ReviewRow label="Mode" value={formData.mode} />
                  <ReviewRow label="Task Size" value={formData.taskSize} />
                  <ReviewRow label="Priority" value={formData.priority} />
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Prompt</p>
                    <p className="text-sm text-slate-900 dark:text-white bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                      {formData.prompt}
                    </p>
                  </div>
                  <div className="flex gap-6">
                    <div className="flex items-center gap-2">
                      <div className={cn('w-2 h-2 rounded-full', formData.autoFixEnabled ? 'bg-emerald-500' : 'bg-slate-300')} />
                      <span className="text-sm text-slate-600 dark:text-slate-400">Auto Fix</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={cn('w-2 h-2 rounded-full', formData.testingEnabled ? 'bg-emerald-500' : 'bg-slate-300')} />
                      <span className="text-sm text-slate-600 dark:text-slate-400">Testing</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={cn('w-2 h-2 rounded-full', formData.validationEnabled ? 'bg-emerald-500' : 'bg-slate-300')} />
                      <span className="text-sm text-slate-600 dark:text-slate-400">Validation</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Back
          </Button>

          {currentStep < steps.length - 1 ? (
            <Button
              variant="primary"
              onClick={handleNext}
              disabled={!canProceed()}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Continue
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleSubmit}
              isLoading={isSubmitting}
              leftIcon={isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            >
              Create Orchestration
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

const ReviewRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between">
    <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
    <span className="text-sm font-medium text-slate-900 dark:text-white">{value}</span>
  </div>
);
