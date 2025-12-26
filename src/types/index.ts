// Core Types for Cursor Monitor Application

// Enums and Literal Types
export type Status = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'PAUSED';

export type OrchestrationMode = 'AUTO' | 'SINGLE_AGENT' | 'PIPELINE' | 'BATCH';

export type TaskSize = 'SMALL' | 'MEDIUM' | 'LARGE';

export type Priority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export type AgentCategory = 
  | 'coding' 
  | 'debugging' 
  | 'testing' 
  | 'documentation' 
  | 'refactoring' 
  | 'code_review' 
  | 'research' 
  | 'ui_design' 
  | 'deployment';

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  default_model?: string;
  preferences: UserPreferences;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
  is_active: boolean;
}

export interface UserPreferences {
  notifications_enabled: boolean;
  auto_save: boolean;
  dark_mode: boolean;
  email_notifications: boolean;
  slack_notifications: boolean;
  discord_notifications: boolean;
}

// Authentication Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
  confirm_password: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface Session {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// API Key Types
export interface APIKey {
  id: string;
  provider: string;
  key_name: string;
  key_hash: string;
  permissions: APIKeyPermissions;
  is_active: boolean;
  last_used_at?: string;
  created_at: string;
  expires_at?: string;
}

export interface APIKeyPermissions {
  providers: string[];
  max_requests_per_hour?: number;
  allowed_ips?: string[];
  rate_limit_window?: number;
}

export interface CreateAPIKeyData {
  provider: string;
  key_name: string;
  api_key: string;
  permissions?: Partial<APIKeyPermissions>;
}

// Orchestration Types
export interface Orchestration {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  repository_url: string;
  branch: string;
  prompt: string;
  model?: string;
  mode: OrchestrationMode;
  status: Status;
  progress: number;
  task_size?: TaskSize;
  priority?: Priority;
  max_iterations: number;
  auto_fix_enabled: boolean;
  testing_enabled: boolean;
  validation_enabled: boolean;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
}

export interface OrchestrationSummary {
  id: string;
  name: string;
  status: Status;
  progress: number;
  repository_url: string;
  created_at: string;
  task_count: number;
  completed_tasks: number;
  duration_seconds?: number;
}

export interface CreateOrchestrationData {
  name: string;
  description?: string;
  repository_url: string;
  branch?: string;
  prompt: string;
  model?: string;
  mode?: OrchestrationMode;
  task_size?: TaskSize;
  priority?: Priority;
  max_iterations?: number;
  auto_fix_enabled?: boolean;
  testing_enabled?: boolean;
  validation_enabled?: boolean;
  template_id?: string;
}

export interface OrchestrationUpdate {
  name?: string;
  description?: string;
  prompt?: string;
  model?: string;
  mode?: OrchestrationMode;
  max_iterations?: number;
  auto_fix_enabled?: boolean;
  testing_enabled?: boolean;
  validation_enabled?: boolean;
}

// Task Types
export interface Task {
  id: string;
  orchestration_id: string;
  agent_id?: string;
  title: string;
  description?: string;
  status: Status;
  priority: number;
  order_index: number;
  input_data?: Record<string, unknown>;
  output_data?: Record<string, unknown>;
  error_message?: string;
  logs?: LogEntry[];
  started_at?: string;
  completed_at?: string;
  duration_seconds?: number;
  created_at: string;
}

export interface LogEntry {
  timestamp: string;
  level: 'INFO' | 'WARNING' | 'ERROR' | 'DEBUG';
  message: string;
  metadata?: Record<string, unknown>;
}

// Agent Types
export interface Agent {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  category: AgentCategory;
  icon_url?: string;
  config_schema: Record<string, unknown>;
  default_config: Record<string, unknown>;
  is_active: boolean;
  version?: string;
  capabilities: string[];
  created_at: string;
  updated_at: string;
}

export interface AgentSummary {
  id: string;
  name: string;
  display_name: string;
  category: AgentCategory;
  status: 'available' | 'busy' | 'offline';
}

// Repository Profile Types
export interface RepositoryProfile {
  id: string;
  user_id: string;
  name: string;
  repository_url: string;
  branch: string;
  safety_policy?: string;
  auto_merge: boolean;
  code_style?: string;
  preferred_agents: string[];
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CreateRepositoryProfileData {
  name: string;
  repository_url: string;
  branch?: string;
  safety_policy?: string;
  auto_merge?: boolean;
  code_style?: string;
  preferred_agents?: string[];
}

export interface UpdateRepositoryProfileData extends Partial<CreateRepositoryProfileData> {}

// Prompt Template Types
export interface PromptTemplate {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  category?: string;
  template_content: string;
  variables: TemplateVariable[];
  is_public: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface TemplateVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'select';
  required: boolean;
  default_value?: unknown;
  options?: string[];
  description?: string;
}

export interface CreatePromptTemplateData {
  name: string;
  description?: string;
  category?: string;
  template_content: string;
  variables: TemplateVariable[];
  is_public?: boolean;
}

// Notification Types
export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  channels: string[];
  is_read: boolean;
  read_at?: string;
  created_at: string;
  expires_at?: string;
}

export type NotificationType = 
  | 'orchestration_completed'
  | 'orchestration_failed'
  | 'error'
  | 'agent_status'
  | 'system';

// Webhook Types
export interface Webhook {
  id: string;
  user_id: string;
  name: string;
  url: string;
  secret: string;
  events: string[];
  is_active: boolean;
  failure_count: number;
  last_triggered_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateWebhookData {
  name: string;
  url: string;
  events: string[];
}

export interface UpdateWebhookData extends Partial<CreateWebhookData> {
  is_active?: boolean;
}

// Dashboard Types
export interface DashboardStats {
  total_orchestrations: number;
  active_orchestrations: number;
  completed_today: number;
  total_tasks: number;
  success_rate: number;
  average_duration_minutes: number;
  api_keys_count: number;
  active_agents: number;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface ActivityData {
  orchestrations: ChartDataPoint[];
  tasks: ChartDataPoint[];
  tokens_used: ChartDataPoint[];
}

// API Response Types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ApiError {
  detail: string;
  status_code: number;
  message: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Form Types
export interface FormFieldError {
  field: string;
  message: string;
}
