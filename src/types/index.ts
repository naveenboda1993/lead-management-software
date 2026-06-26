export enum Role {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  EMPLOYER = "EMPLOYER",
  MANAGER = "MANAGER",
  TEAM_LEADER = "TEAM_LEADER",
  EMPLOYEE = "EMPLOYEE",
  SALES_EXECUTIVE = "SALES_EXECUTIVE",
  SALES_MANAGER = "SALES_MANAGER",
  MARKETING_EXECUTIVE = "MARKETING_EXECUTIVE",
  HR = "HR",
  RECRUITER = "RECRUITER",
  FINANCE = "FINANCE",
  CUSTOMER = "CUSTOMER",
  VENDOR = "VENDOR",
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
  INSTAGRAM = "INSTAGRAM",
  GOOGLE_ADS = "GOOGLE_ADS",
  LINKEDIN = "LINKEDIN",
  LINKEDIN_ADS = "LINKEDIN_ADS",
  WALK_IN = "WALK_IN",
  REFERRAL = "REFERRAL",
  CSV_UPLOAD = "CSV_UPLOAD",
  API_INTEGRATION = "API_INTEGRATION",
  IVR_CALLS = "IVR_CALLS",
  WHATSAPP = "WHATSAPP",
  EMAIL_CAMPAIGN = "EMAIL_CAMPAIGN",
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

export enum PropertyType {
  APARTMENT = "APARTMENT",
  VILLA = "VILLA",
  COMMERCIAL = "COMMERCIAL",
  LAND = "LAND",
}

export enum PropertyStatus {
  AVAILABLE = "AVAILABLE",
  SOLD = "SOLD",
  RENTED = "RENTED",
  UNDER_OFFER = "UNDER_OFFER",
  UNDER_CONSTRUCTION = "UNDER_CONSTRUCTION",
}

export enum TicketStatus {
  OPEN = "OPEN",
  IN_PROGRESS = "IN_PROGRESS",
  RESOLVED = "RESOLVED",
  CLOSED = "CLOSED",
}

export enum TicketChannel {
  EMAIL = "EMAIL",
  WHATSAPP = "WHATSAPP",
  WEB_PORTAL = "WEB_PORTAL",
}

export enum CampaignType {
  SMS = "SMS",
  EMAIL = "EMAIL",
  WHATSAPP = "WHATSAPP",
}

export enum CampaignStatus {
  DRAFT = "DRAFT",
  SCHEDULED = "SCHEDULED",
  RUNNING = "RUNNING",
  COMPLETED = "COMPLETED",
  PAUSED = "PAUSED",
  CANCELLED = "CANCELLED",
}

export enum CallDirection {
  INBOUND = "INBOUND",
  OUTBOUND = "OUTBOUND",
}

export enum CallStatus {
  COMPLETED = "COMPLETED",
  MISSED = "MISSED",
  BUSY = "BUSY",
  FAILED = "FAILED",
  RINGING = "RINGING",
}

export enum AttendanceStatus {
  PRESENT = "PRESENT",
  ABSENT = "ABSENT",
  LATE = "LATE",
  HALF_DAY = "HALF_DAY",
  HOLIDAY = "HOLIDAY",
  LEAVE = "LEAVE",
}

export enum LeaveStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED",
}

export enum LeaveType {
  SICK = "SICK",
  CASUAL = "CASUAL",
  ANNUAL = "ANNUAL",
  MATERNITY = "MATERNITY",
  PATERNITY = "PATERNITY",
  UNPAID = "UNPAID",
}

export enum ProductCategory {
  MENS_WEAR = "MENS_WEAR",
  WOMENS_WEAR = "WOMENS_WEAR",
  KIDS_WEAR = "KIDS_WEAR",
  ACCESSORIES = "ACCESSORIES",
  FOOTWEAR = "FOOTWEAR",
}

export enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  PROCESSING = "PROCESSING",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
  RETURNED = "RETURNED",
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar_url?: string | null;
  phone?: string | null;
  department?: string | null;
  designation?: string | null;
  employee_id?: string | null;
  date_of_joining?: string | null;
  mfa_enabled?: boolean;
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
  property_id?: string | null;
  ticket_id?: string | null;
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
  property_id?: string | null;
  employee_id?: string | null;
  customer_id?: string | null;
  agreement_type?: string | null;
  invoice_number?: string | null;
  uploaded_by?: string | null;
  version: number;
  is_encrypted: boolean;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  user_id?: string | null;
  changes?: Record<string, unknown> | null;
  ip_address?: string | null;
  organization_id: string;
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

export interface Property {
  id: string;
  property_name: string;
  property_type: PropertyType;
  status: PropertyStatus;
  description?: string | null;
  location: string;
  address?: string | null;
  city: string;
  state: string;
  country: string;
  pincode?: string | null;
  price: number;
  area_sqft: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  images: string[];
  documents: string[];
  owner_id?: string | null;
  broker_id?: string | null;
  assigned_to?: string | null;
  organization_id: string;
  latitude?: number | null;
  longitude?: number | null;
  created_at: string;
  updated_at: string;
}

export interface Broker {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string | null;
  commission_rate: number;
  total_commission_earned: number;
  properties_sold: number;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface Commission {
  id: string;
  property_id: string;
  broker_id: string;
  deal_value: number;
  commission_amount: number;
  commission_rate: number;
  status: "PENDING" | "PAID" | "CANCELLED";
  paid_at?: string | null;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  channel: TicketChannel;
  priority: LeadPriority;
  customer_id?: string | null;
  lead_id?: string | null;
  assigned_to?: string | null;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface TicketMessage {
  id: string;
  ticket_id: string;
  message: string;
  sender_id: string;
  sender_type: "AGENT" | "CUSTOMER";
  attachments: string[];
  created_at: string;
}

export interface Campaign {
  id: string;
  name: string;
  type: CampaignType;
  status: CampaignStatus;
  subject?: string | null;
  content: string;
  recipient_list: string[];
  sent_count: number;
  opened_count: number;
  clicked_count: number;
  converted_count: number;
  scheduled_at?: string | null;
  sent_at?: string | null;
  completed_at?: string | null;
  created_by: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface CallLog {
  id: string;
  call_id: string;
  direction: CallDirection;
  status: CallStatus;
  from_number: string;
  to_number: string;
  duration_seconds: number;
  recording_url?: string | null;
  lead_id?: string | null;
  agent_id?: string | null;
  notes?: string | null;
  organization_id: string;
  created_at: string;
}

export interface VirtualNumber {
  id: string;
  number: string;
  provider: "EXOTEL" | "TWILIO" | "KNOWLARITY";
  is_active: boolean;
  assigned_to?: string | null;
  organization_id: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: ProductCategory;
  description?: string | null;
  price: number;
  cost_price: number;
  compare_at_price?: number | null;
  size?: string | null;
  color?: string | null;
  material?: string | null;
  images: string[];
  tags: string[];
  is_active: boolean;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface Inventory {
  id: string;
  product_id: string;
  quantity: number;
  reserved_quantity: number;
  warehouse_location?: string | null;
  reorder_level: number;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  address?: string | null;
  payment_terms: string;
  lead_time_days: number;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id?: string | null;
  lead_id?: string | null;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  discount_amount: number;
  coupon_code?: string | null;
  tax_amount: number;
  total_amount: number;
  shipping_address?: string | null;
  billing_address?: string | null;
  payment_method?: string | null;
  payment_status: string;
  notes?: string | null;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  size?: string | null;
  color?: string | null;
}

export interface Coupon {
  id: string;
  code: string;
  description?: string | null;
  discount_type: "PERCENTAGE" | "FIXED";
  discount_value: number;
  min_order_amount: number;
  max_discount_amount?: number | null;
  usage_limit: number;
  used_count: number;
  is_active: boolean;
  valid_from: string;
  valid_until: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface Attendance {
  id: string;
  employee_id: string;
  date: string;
  status: AttendanceStatus;
  check_in?: string | null;
  check_out?: string | null;
  late_minutes: number;
  early_leave_minutes: number;
  notes?: string | null;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface Leave {
  id: string;
  employee_id: string;
  leave_type: LeaveType;
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string;
  status: LeaveStatus;
  approved_by?: string | null;
  approved_at?: string | null;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface Payroll {
  id: string;
  employee_id: string;
  month: number;
  year: number;
  basic_salary: number;
  allowances: number;
  deductions: number;
  bonus: number;
  tax_amount: number;
  net_salary: number;
  payment_status: "PENDING" | "PAID" | "CANCELLED";
  paid_at?: string | null;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface PerformanceReview {
  id: string;
  employee_id: string;
  reviewer_id: string;
  review_period: string;
  rating: number;
  feedback: string;
  goals: string[];
  achievements: string[];
  improvement_areas: string[];
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface GoogleAdCampaign {
  id: string;
  campaign_id: string;
  name: string;
  status: string;
  budget: number;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cpc: number;
  cost_per_conversion: number;
  start_date: string;
  end_date?: string | null;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface GoogleAdGroup {
  id: string;
  ad_group_id: string;
  campaign_id: string;
  name: string;
  status: string;
  organization_id: string;
  created_at: string;
}

export interface GoogleAdKeyword {
  id: string;
  keyword_id: string;
  ad_group_id: string;
  keyword: string;
  match_type: string;
  status: string;
  impressions: number;
  clicks: number;
  conversions: number;
  cost: number;
  organization_id: string;
  created_at: string;
}

export interface AdSenseUnit {
  id: string;
  ad_unit_id: string;
  name: string;
  type: string;
  size: string;
  status: string;
  impressions: number;
  clicks: number;
  earnings: number;
  rpm: number;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface AdSenseStats {
  id: string;
  date: string;
  impressions: number;
  clicks: number;
  page_views: number;
  earnings: number;
  rpm: number;
  ctr: number;
  organization_id: string;
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

export interface EmployerDashboardMetrics {
  totalRevenue: number;
  totalLeads: number;
  totalEmployees: number;
  marketingSpend: number;
  leadsBySource: { source: LeadSource; count: number }[];
  revenueByMonth: { month: string; revenue: number }[];
  employeePerformance: { name: string; leads: number; conversions: number }[];
  activeCampaigns: number;
  propertiesListed: number;
  ordersPending: number;
}

export interface SalesDashboardMetrics {
  pipelineValue: number;
  wonDeals: number;
  lostDeals: number;
  avgDealSize: number;
  conversionRate: number;
  pipelineByStage: { stage: LeadStatus; count: number; value: number }[];
  monthlyRevenue: { month: string; revenue: number }[];
  topPerformers: { name: string; deals: number; revenue: number }[];
}

export interface MarketingDashboardMetrics {
  totalCampaigns: number;
  activeCampaigns: number;
  totalSpend: number;
  totalConversions: number;
  costPerConversion: number;
  googleAdsCpc: number;
  facebookCtr: number;
  adsenseEarnings: number;
  campaignPerformance: { name: string; sent: number; opened: number; clicked: number; converted: number }[];
  adPerformance: { campaign: string; impressions: number; clicks: number; conversions: number; spend: number }[];
  dailyAdsenseStats: { date: string; earnings: number; impressions: number }[];
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
