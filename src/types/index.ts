export enum Role {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  SALES_MANAGER = "SALES_MANAGER",
  SALES_EXECUTIVE = "SALES_EXECUTIVE",
  VIEWER = "VIEWER",
}

export enum LeadStatus {
  NEW = "NEW",
  CONTACTED = "CONTACTED",
  QUALIFIED = "QUALIFIED",
  PROPOSAL_SENT = "PROPOSAL_SENT",
  NEGOTIATION = "NEGOTIATION",
  WON = "WON",
  LOST = "LOST",
}

export enum LeadSource {
  MANUAL_ENTRY = "MANUAL_ENTRY",
  WEBSITE_FORM = "WEBSITE_FORM",
  FACEBOOK = "FACEBOOK",
  GOOGLE_ADS = "GOOGLE_ADS",
  LINKEDIN_ADS = "LINKEDIN_ADS",
  WALK_IN = "WALK_IN",
  CSV_UPLOAD = "CSV_UPLOAD",
  API_INTEGRATION = "API_INTEGRATION",
}

export enum LeadPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

export enum TaskStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum TaskType {
  FOLLOW_UP = "FOLLOW_UP",
  CALL = "CALL",
  MEETING = "MEETING",
  REMINDER = "REMINDER",
  NOTE = "NOTE",
}

export const PipelineStage = LeadStatus;

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  lead_number: string;
  first_name: string;
  last_name: string;
  email: string;
  mobile: string;
  company?: string | null;
  job_title?: string | null;
  industry?: string | null;
  lead_source: LeadSource;
  status: LeadStatus;
  owner_id?: string | null;
  priority: LeadPriority;
  estimated_deal_value?: number | null;
  notes?: string | null;
  tags?: string[] | null;
  created_at: string;
  updated_at: string;
  assigned_to?: string | null;
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  lead_id?: string | null;
  assigned_to?: string | null;
  task_type: TaskType;
  status: TaskStatus;
  due_date?: string | null;
  reminder_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  lead_id?: string | null;
  uploaded_by?: string | null;
  version: number;
  created_at: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  user_id?: string | null;
  changes?: Record<string, unknown> | null;
  ip_address?: string | null;
  created_at: string;
}

export interface Activity {
  id: string;
  lead_id: string;
  type: string;
  description: string;
  metadata?: Record<string, unknown> | null;
  created_by?: string | null;
  created_at: string;
}

export interface DashboardMetrics {
  totalLeads: number;
  leadsByStatus: { status: LeadStatus; count: number }[];
  leadsBySource: { source: LeadSource; count: number }[];
  leadsByPriority: { priority: LeadPriority; count: number }[];
  recentLeads: Lead[];
  upcomingTasks: Task[];
  conversionRate: number;
  totalDealValue: number;
  averageDealValue: number;
  tasksCompleted: number;
  tasksPending: number;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  success: boolean;
  error: string | null;
}

export interface LeadFilters {
  search?: string;
  status?: LeadStatus[];
  source?: LeadSource[];
  priority?: LeadPriority[];
  assigned_to?: string;
  owner_id?: string;
  date_from?: string;
  date_to?: string;
  min_value?: number;
  max_value?: number;
  tags?: string[];
}

export interface Permission {
  action: string;
  subject: string;
  conditions?: Record<string, unknown>;
}

export type PermissionsMap = Record<Role, Permission[]>;
