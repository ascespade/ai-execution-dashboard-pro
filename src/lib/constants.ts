// Constants

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Cursor Monitor';
export const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
export const API_TIMEOUT = 30000;

export const TOKEN_KEY = process.env.NEXT_PUBLIC_TOKEN_KEY || 'cursor_monitor_token';

export const POLLING_INTERVAL = parseInt(process.env.NEXT_PUBLIC_POLLING_INTERVAL || '5000');

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
};

export const STATUS_COLORS = {
  PENDING: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200' },
  RUNNING: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
  COMPLETED: { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200' },
  FAILED: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
  PAUSED: { bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-200' },
};

export const AGENT_CATEGORIES = [
  { value: 'coding', label: 'Coding', color: 'bg-blue-500' },
  { value: 'debugging', label: 'Debugging', color: 'bg-red-500' },
  { value: 'testing', label: 'Testing', color: 'bg-green-500' },
  { value: 'documentation', label: 'Documentation', color: 'bg-purple-500' },
  { value: 'refactoring', label: 'Refactoring', color: 'bg-orange-500' },
  { value: 'code_review', label: 'Code Review', color: 'bg-indigo-500' },
  { value: 'research', label: 'Research', color: 'bg-teal-500' },
  { value: 'ui_design', label: 'UI Design', color: 'bg-pink-500' },
  { value: 'deployment', label: 'Deployment', color: 'bg-cyan-500' },
];

export const ORCHESTRATION_MODES = [
  { value: 'AUTO', label: 'Auto', description: 'Automatically select the best agents for each task' },
  { value: 'SINGLE_AGENT', label: 'Single Agent', description: 'Use a single agent for all tasks' },
  { value: 'PIPELINE', label: 'Pipeline', description: 'Execute tasks in a predefined sequence' },
  { value: 'BATCH', label: 'Batch', description: 'Execute multiple tasks in parallel' },
];

export const TASK_SIZES = [
  { value: 'SMALL', label: 'Small', description: 'Quick fixes and minor changes' },
  { value: 'MEDIUM', label: 'Medium', description: 'Feature development and refactoring' },
  { value: 'LARGE', label: 'Large', description: 'Complex features and system design' },
];

export const PRIORITIES = [
  { value: 'LOW', label: 'Low', weight: 1 },
  { value: 'NORMAL', label: 'Normal', weight: 2 },
  { value: 'HIGH', label: 'High', weight: 3 },
  { value: 'URGENT', label: 'Urgent', weight: 4 },
];

export const NOTIFICATION_TYPES = [
  { value: 'orchestration_completed', label: 'Orchestration Completed' },
  { value: 'orchestration_failed', label: 'Orchestration Failed' },
  { value: 'error', label: 'Error Alert' },
  { value: 'agent_status', label: 'Agent Status Change' },
  { value: 'system', label: 'System Notification' },
];

export const WEBHOOK_EVENTS = [
  { value: 'orchestration.started', label: 'Orchestration Started' },
  { value: 'orchestration.completed', label: 'Orchestration Completed' },
  { value: 'orchestration.failed', label: 'Orchestration Failed' },
  { value: 'task.completed', label: 'Task Completed' },
  { value: 'task.failed', label: 'Task Failed' },
];

export const AI_PROVIDERS = [
  { value: 'openai', label: 'OpenAI', models: ['gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'] },
  { value: 'anthropic', label: 'Anthropic', models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'] },
  { value: 'google', label: 'Google', models: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-1.0-pro'] },
];

export const SIDEBAR_ITEMS = [
  { href: '/', icon: 'LayoutDashboard', label: 'Dashboard' },
  { href: '/agents', icon: 'Cpu', label: 'Cloud Agents' },
  { href: '/orchestrations', icon: 'GitBranch', label: 'Orchestrations' },
  { href: '/repositories', icon: 'FolderGit2', label: 'Repositories' },
  { href: '/templates', icon: 'FileCode', label: 'Templates' },
  { href: '/settings', icon: 'Settings', label: 'Settings' },
];

export const DASHBOARD_CARDS = [
  { key: 'total_orchestrations', label: 'Total Orchestrations', icon: 'GitBranch' },
  { key: 'active_orchestrations', label: 'Active Orchestrations', icon: 'Activity' },
  { key: 'completed_today', label: 'Completed Today', icon: 'CheckCircle2' },
  { key: 'success_rate', label: 'Success Rate', icon: 'TrendingUp' },
];
