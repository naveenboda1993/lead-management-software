import {
  LeadStatus,
  LeadSource,
  LeadPriority,
  TaskStatus,
  TaskType,
  Role,
  PropertyType,
  PropertyStatus,
  TicketStatus,
  TicketChannel,
  CampaignType,
  CampaignStatus,
  CallDirection,
  CallStatus,
  AttendanceStatus,
  LeaveStatus,
  LeaveType,
  ProductCategory,
  OrderStatus,
  type Permission,
  type PermissionsMap,
} from "@/types";

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  [LeadStatus.NEW]: "New",
  [LeadStatus.CONTACTED]: "Contacted",
  [LeadStatus.QUALIFIED]: "Qualified",
  [LeadStatus.PROPOSAL_SENT]: "Proposal Sent",
  [LeadStatus.NEGOTIATION]: "Negotiation",
  [LeadStatus.WON]: "Won",
  [LeadStatus.LOST]: "Lost",
};

export const LEAD_STATUS_COLORS: Record<LeadStatus, string> = {
  [LeadStatus.NEW]: "bg-blue-100 text-blue-800 border-blue-200",
  [LeadStatus.CONTACTED]: "bg-yellow-100 text-yellow-800 border-yellow-200",
  [LeadStatus.QUALIFIED]: "bg-purple-100 text-purple-800 border-purple-200",
  [LeadStatus.PROPOSAL_SENT]: "bg-indigo-100 text-indigo-800 border-indigo-200",
  [LeadStatus.NEGOTIATION]: "bg-orange-100 text-orange-800 border-orange-200",
  [LeadStatus.WON]: "bg-green-100 text-green-800 border-green-200",
  [LeadStatus.LOST]: "bg-red-100 text-red-800 border-red-200",
};

export const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
  [LeadSource.MANUAL_ENTRY]: "Manual Entry",
  [LeadSource.WEBSITE_FORM]: "Website Form",
  [LeadSource.FACEBOOK]: "Facebook",
  [LeadSource.INSTAGRAM]: "Instagram",
  [LeadSource.GOOGLE_ADS]: "Google Ads",
  [LeadSource.LINKEDIN]: "LinkedIn",
  [LeadSource.LINKEDIN_ADS]: "LinkedIn Ads",
  [LeadSource.WALK_IN]: "Walk-In",
  [LeadSource.REFERRAL]: "Referral",
  [LeadSource.CSV_UPLOAD]: "CSV Upload",
  [LeadSource.API_INTEGRATION]: "API Integration",
  [LeadSource.IVR_CALLS]: "IVR Calls",
  [LeadSource.WHATSAPP]: "WhatsApp",
  [LeadSource.EMAIL_CAMPAIGN]: "Email Campaign",
};

export const PRIORITY_LABELS: Record<LeadPriority, string> = {
  [LeadPriority.LOW]: "Low",
  [LeadPriority.MEDIUM]: "Medium",
  [LeadPriority.HIGH]: "High",
  [LeadPriority.CRITICAL]: "Critical",
};

export const PRIORITY_COLORS: Record<LeadPriority, string> = {
  [LeadPriority.LOW]: "bg-slate-100 text-slate-700 border-slate-200",
  [LeadPriority.MEDIUM]: "bg-blue-100 text-blue-700 border-blue-200",
  [LeadPriority.HIGH]: "bg-orange-100 text-orange-700 border-orange-200",
  [LeadPriority.CRITICAL]: "bg-red-100 text-red-700 border-red-200",
};

export const ROLES: Record<Role, string> = {
  [Role.SUPER_ADMIN]: "Super Admin",
  [Role.ADMIN]: "Admin",
  [Role.EMPLOYER]: "Employer",
  [Role.MANAGER]: "Manager",
  [Role.TEAM_LEADER]: "Team Leader",
  [Role.EMPLOYEE]: "Employee",
  [Role.SALES_EXECUTIVE]: "Sales Executive",
  [Role.SALES_MANAGER]: "Sales Manager",
  [Role.MARKETING_EXECUTIVE]: "Marketing Executive",
  [Role.HR]: "HR",
  [Role.RECRUITER]: "Recruiter",
  [Role.FINANCE]: "Finance",
  [Role.CUSTOMER]: "Customer",
  [Role.VENDOR]: "Vendor",
  [Role.VIEWER]: "Viewer",
};

export const ROLE_HIERARCHY: Role[] = [
  Role.SUPER_ADMIN,
  Role.ADMIN,
  Role.EMPLOYER,
  Role.MANAGER,
  Role.SALES_MANAGER,
  Role.MARKETING_EXECUTIVE,
  Role.TEAM_LEADER,
  Role.HR,
  Role.RECRUITER,
  Role.FINANCE,
  Role.SALES_EXECUTIVE,
  Role.EMPLOYEE,
  Role.CUSTOMER,
  Role.VENDOR,
  Role.VIEWER,
];

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  [TaskStatus.PENDING]: "Pending",
  [TaskStatus.COMPLETED]: "Completed",
  [TaskStatus.CANCELLED]: "Cancelled",
};

export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  [TaskStatus.PENDING]: "bg-yellow-100 text-yellow-800 border-yellow-200",
  [TaskStatus.COMPLETED]: "bg-green-100 text-green-800 border-green-200",
  [TaskStatus.CANCELLED]: "bg-red-100 text-red-800 border-red-200",
};

export const TASK_TYPE_LABELS: Record<TaskType, string> = {
  [TaskType.FOLLOW_UP]: "Follow Up",
  [TaskType.CALL]: "Call",
  [TaskType.MEETING]: "Meeting",
  [TaskType.REMINDER]: "Reminder",
  [TaskType.NOTE]: "Note",
};

export const PIPELINE_STAGES = [
  { key: LeadStatus.NEW, label: LEAD_STATUS_LABELS[LeadStatus.NEW], color: LEAD_STATUS_COLORS[LeadStatus.NEW] },
  { key: LeadStatus.CONTACTED, label: LEAD_STATUS_LABELS[LeadStatus.CONTACTED], color: LEAD_STATUS_COLORS[LeadStatus.CONTACTED] },
  { key: LeadStatus.QUALIFIED, label: LEAD_STATUS_LABELS[LeadStatus.QUALIFIED], color: LEAD_STATUS_COLORS[LeadStatus.QUALIFIED] },
  { key: LeadStatus.PROPOSAL_SENT, label: LEAD_STATUS_LABELS[LeadStatus.PROPOSAL_SENT], color: LEAD_STATUS_COLORS[LeadStatus.PROPOSAL_SENT] },
  { key: LeadStatus.NEGOTIATION, label: LEAD_STATUS_LABELS[LeadStatus.NEGOTIATION], color: LEAD_STATUS_COLORS[LeadStatus.NEGOTIATION] },
  { key: LeadStatus.WON, label: LEAD_STATUS_LABELS[LeadStatus.WON], color: LEAD_STATUS_COLORS[LeadStatus.WON] },
  { key: LeadStatus.LOST, label: LEAD_STATUS_LABELS[LeadStatus.LOST], color: LEAD_STATUS_COLORS[LeadStatus.LOST] },
];

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  [PropertyType.APARTMENT]: "Apartment",
  [PropertyType.VILLA]: "Villa",
  [PropertyType.COMMERCIAL]: "Commercial",
  [PropertyType.LAND]: "Land",
};

export const PROPERTY_STATUS_LABELS: Record<PropertyStatus, string> = {
  [PropertyStatus.AVAILABLE]: "Available",
  [PropertyStatus.SOLD]: "Sold",
  [PropertyStatus.RENTED]: "Rented",
  [PropertyStatus.UNDER_OFFER]: "Under Offer",
  [PropertyStatus.UNDER_CONSTRUCTION]: "Under Construction",
};

export const PROPERTY_STATUS_COLORS: Record<PropertyStatus, string> = {
  [PropertyStatus.AVAILABLE]: "bg-green-100 text-green-800 border-green-200",
  [PropertyStatus.SOLD]: "bg-red-100 text-red-800 border-red-200",
  [PropertyStatus.RENTED]: "bg-blue-100 text-blue-800 border-blue-200",
  [PropertyStatus.UNDER_OFFER]: "bg-yellow-100 text-yellow-800 border-yellow-200",
  [PropertyStatus.UNDER_CONSTRUCTION]: "bg-purple-100 text-purple-800 border-purple-200",
};

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  [TicketStatus.OPEN]: "Open",
  [TicketStatus.IN_PROGRESS]: "In Progress",
  [TicketStatus.RESOLVED]: "Resolved",
  [TicketStatus.CLOSED]: "Closed",
};

export const TICKET_STATUS_COLORS: Record<TicketStatus, string> = {
  [TicketStatus.OPEN]: "bg-blue-100 text-blue-800 border-blue-200",
  [TicketStatus.IN_PROGRESS]: "bg-yellow-100 text-yellow-800 border-yellow-200",
  [TicketStatus.RESOLVED]: "bg-green-100 text-green-800 border-green-200",
  [TicketStatus.CLOSED]: "bg-slate-100 text-slate-700 border-slate-200",
};

export const TICKET_CHANNEL_LABELS: Record<TicketChannel, string> = {
  [TicketChannel.EMAIL]: "Email",
  [TicketChannel.WHATSAPP]: "WhatsApp",
  [TicketChannel.WEB_PORTAL]: "Web Portal",
};

export const CAMPAIGN_TYPE_LABELS: Record<CampaignType, string> = {
  [CampaignType.SMS]: "SMS",
  [CampaignType.EMAIL]: "Email",
  [CampaignType.WHATSAPP]: "WhatsApp",
};

export const CAMPAIGN_STATUS_LABELS: Record<CampaignStatus, string> = {
  [CampaignStatus.DRAFT]: "Draft",
  [CampaignStatus.SCHEDULED]: "Scheduled",
  [CampaignStatus.RUNNING]: "Running",
  [CampaignStatus.COMPLETED]: "Completed",
  [CampaignStatus.PAUSED]: "Paused",
  [CampaignStatus.CANCELLED]: "Cancelled",
};

export const CAMPAIGN_STATUS_COLORS: Record<CampaignStatus, string> = {
  [CampaignStatus.DRAFT]: "bg-slate-100 text-slate-700 border-slate-200",
  [CampaignStatus.SCHEDULED]: "bg-blue-100 text-blue-800 border-blue-200",
  [CampaignStatus.RUNNING]: "bg-green-100 text-green-800 border-green-200",
  [CampaignStatus.COMPLETED]: "bg-purple-100 text-purple-800 border-purple-200",
  [CampaignStatus.PAUSED]: "bg-yellow-100 text-yellow-800 border-yellow-200",
  [CampaignStatus.CANCELLED]: "bg-red-100 text-red-800 border-red-200",
};

export const CALL_DIRECTION_LABELS: Record<CallDirection, string> = {
  [CallDirection.INBOUND]: "Inbound",
  [CallDirection.OUTBOUND]: "Outbound",
};

export const CALL_STATUS_LABELS: Record<CallStatus, string> = {
  [CallStatus.COMPLETED]: "Completed",
  [CallStatus.MISSED]: "Missed",
  [CallStatus.BUSY]: "Busy",
  [CallStatus.FAILED]: "Failed",
  [CallStatus.RINGING]: "Ringing",
};

export const CALL_STATUS_COLORS: Record<CallStatus, string> = {
  [CallStatus.COMPLETED]: "bg-green-100 text-green-800 border-green-200",
  [CallStatus.MISSED]: "bg-red-100 text-red-800 border-red-200",
  [CallStatus.BUSY]: "bg-yellow-100 text-yellow-800 border-yellow-200",
  [CallStatus.FAILED]: "bg-slate-100 text-slate-700 border-slate-200",
  [CallStatus.RINGING]: "bg-blue-100 text-blue-800 border-blue-200",
};

export const ATTENDANCE_STATUS_LABELS: Record<AttendanceStatus, string> = {
  [AttendanceStatus.PRESENT]: "Present",
  [AttendanceStatus.ABSENT]: "Absent",
  [AttendanceStatus.LATE]: "Late",
  [AttendanceStatus.HALF_DAY]: "Half Day",
  [AttendanceStatus.HOLIDAY]: "Holiday",
  [AttendanceStatus.LEAVE]: "Leave",
};

export const ATTENDANCE_STATUS_COLORS: Record<AttendanceStatus, string> = {
  [AttendanceStatus.PRESENT]: "bg-green-100 text-green-800 border-green-200",
  [AttendanceStatus.ABSENT]: "bg-red-100 text-red-800 border-red-200",
  [AttendanceStatus.LATE]: "bg-yellow-100 text-yellow-800 border-yellow-200",
  [AttendanceStatus.HALF_DAY]: "bg-orange-100 text-orange-800 border-orange-200",
  [AttendanceStatus.HOLIDAY]: "bg-purple-100 text-purple-800 border-purple-200",
  [AttendanceStatus.LEAVE]: "bg-blue-100 text-blue-800 border-blue-200",
};

export const LEAVE_STATUS_LABELS: Record<LeaveStatus, string> = {
  [LeaveStatus.PENDING]: "Pending",
  [LeaveStatus.APPROVED]: "Approved",
  [LeaveStatus.REJECTED]: "Rejected",
  [LeaveStatus.CANCELLED]: "Cancelled",
};

export const LEAVE_STATUS_COLORS: Record<LeaveStatus, string> = {
  [LeaveStatus.PENDING]: "bg-yellow-100 text-yellow-800 border-yellow-200",
  [LeaveStatus.APPROVED]: "bg-green-100 text-green-800 border-green-200",
  [LeaveStatus.REJECTED]: "bg-red-100 text-red-800 border-red-200",
  [LeaveStatus.CANCELLED]: "bg-slate-100 text-slate-700 border-slate-200",
};

export const LEAVE_TYPE_LABELS: Record<LeaveType, string> = {
  [LeaveType.SICK]: "Sick Leave",
  [LeaveType.CASUAL]: "Casual Leave",
  [LeaveType.ANNUAL]: "Annual Leave",
  [LeaveType.MATERNITY]: "Maternity Leave",
  [LeaveType.PATERNITY]: "Paternity Leave",
  [LeaveType.UNPAID]: "Unpaid Leave",
};

export const PRODUCT_CATEGORY_LABELS: Record<ProductCategory, string> = {
  [ProductCategory.MENS_WEAR]: "Men's Wear",
  [ProductCategory.WOMENS_WEAR]: "Women's Wear",
  [ProductCategory.KIDS_WEAR]: "Kids Wear",
  [ProductCategory.ACCESSORIES]: "Accessories",
  [ProductCategory.FOOTWEAR]: "Footwear",
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: "Pending",
  [OrderStatus.CONFIRMED]: "Confirmed",
  [OrderStatus.PROCESSING]: "Processing",
  [OrderStatus.SHIPPED]: "Shipped",
  [OrderStatus.DELIVERED]: "Delivered",
  [OrderStatus.CANCELLED]: "Cancelled",
  [OrderStatus.RETURNED]: "Returned",
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: "bg-yellow-100 text-yellow-800 border-yellow-200",
  [OrderStatus.CONFIRMED]: "bg-blue-100 text-blue-800 border-blue-200",
  [OrderStatus.PROCESSING]: "bg-purple-100 text-purple-800 border-purple-200",
  [OrderStatus.SHIPPED]: "bg-indigo-100 text-indigo-800 border-indigo-200",
  [OrderStatus.DELIVERED]: "bg-green-100 text-green-800 border-green-200",
  [OrderStatus.CANCELLED]: "bg-red-100 text-red-800 border-red-200",
  [OrderStatus.RETURNED]: "bg-orange-100 text-orange-800 border-orange-200",
};

const leadPermissions: Permission[] = [
  { action: "create", subject: "lead" },
  { action: "read", subject: "lead" },
  { action: "update", subject: "lead" },
  { action: "delete", subject: "lead" },
  { action: "export", subject: "lead" },
  { action: "import", subject: "lead" },
  { action: "assign", subject: "lead" },
];

const taskPermissions: Permission[] = [
  { action: "create", subject: "task" },
  { action: "read", subject: "task" },
  { action: "update", subject: "task" },
  { action: "delete", subject: "task" },
];

const documentPermissions: Permission[] = [
  { action: "create", subject: "document" },
  { action: "read", subject: "document" },
  { action: "update", subject: "document" },
  { action: "delete", subject: "document" },
];

const userPermissions: Permission[] = [
  { action: "create", subject: "user" },
  { action: "read", subject: "user" },
  { action: "update", subject: "user" },
  { action: "delete", subject: "user" },
];

const reportPermissions: Permission[] = [
  { action: "read", subject: "report" },
  { action: "export", subject: "report" },
];

const settingPermissions: Permission[] = [
  { action: "read", subject: "setting" },
  { action: "update", subject: "setting" },
];

const propertyPermissions: Permission[] = [
  { action: "create", subject: "property" },
  { action: "read", subject: "property" },
  { action: "update", subject: "property" },
  { action: "delete", subject: "property" },
];

const ticketPermissions: Permission[] = [
  { action: "create", subject: "ticket" },
  { action: "read", subject: "ticket" },
  { action: "update", subject: "ticket" },
  { action: "delete", subject: "ticket" },
];

const campaignPermissions: Permission[] = [
  { action: "create", subject: "campaign" },
  { action: "read", subject: "campaign" },
  { action: "update", subject: "campaign" },
  { action: "delete", subject: "campaign" },
];

const callLogPermissions: Permission[] = [
  { action: "create", subject: "call_log" },
  { action: "read", subject: "call_log" },
  { action: "update", subject: "call_log" },
  { action: "delete", subject: "call_log" },
];

const productPermissions: Permission[] = [
  { action: "create", subject: "product" },
  { action: "read", subject: "product" },
  { action: "update", subject: "product" },
  { action: "delete", subject: "product" },
];

const orderPermissions: Permission[] = [
  { action: "create", subject: "order" },
  { action: "read", subject: "order" },
  { action: "update", subject: "order" },
  { action: "delete", subject: "order" },
];

const inventoryPermissions: Permission[] = [
  { action: "create", subject: "inventory" },
  { action: "read", subject: "inventory" },
  { action: "update", subject: "inventory" },
  { action: "delete", subject: "inventory" },
];

const attendancePermissions: Permission[] = [
  { action: "create", subject: "attendance" },
  { action: "read", subject: "attendance" },
  { action: "update", subject: "attendance" },
  { action: "approve", subject: "attendance" },
];

const leavePermissions: Permission[] = [
  { action: "create", subject: "leave" },
  { action: "read", subject: "leave" },
  { action: "update", subject: "leave" },
  { action: "approve", subject: "leave" },
];

const payrollPermissions: Permission[] = [
  { action: "read", subject: "payroll" },
  { action: "process", subject: "payroll" },
];

const adsPermissions: Permission[] = [
  { action: "create", subject: "ad_campaign" },
  { action: "read", subject: "ad_campaign" },
  { action: "update", subject: "ad_campaign" },
  { action: "delete", subject: "ad_campaign" },
];

const adsensePermissions: Permission[] = [
  { action: "read", subject: "adsense" },
  { action: "manage", subject: "adsense" },
];

const brokerPermissions: Permission[] = [
  { action: "create", subject: "broker" },
  { action: "read", subject: "broker" },
  { action: "update", subject: "broker" },
  { action: "delete", subject: "broker" },
];

const commissionPermissions: Permission[] = [
  { action: "read", subject: "commission" },
  { action: "process", subject: "commission" },
];

const supplierPermissions: Permission[] = [
  { action: "create", subject: "supplier" },
  { action: "read", subject: "supplier" },
  { action: "update", subject: "supplier" },
  { action: "delete", subject: "supplier" },
];

export const PERMISSIONS: PermissionsMap = {
  [Role.SUPER_ADMIN]: [
    ...leadPermissions,
    ...taskPermissions,
    ...documentPermissions,
    ...userPermissions,
    ...reportPermissions,
    ...settingPermissions,
    ...propertyPermissions,
    ...ticketPermissions,
    ...campaignPermissions,
    ...callLogPermissions,
    ...productPermissions,
    ...orderPermissions,
    ...inventoryPermissions,
    ...attendancePermissions,
    ...leavePermissions,
    ...payrollPermissions,
    ...adsPermissions,
    ...adsensePermissions,
    ...brokerPermissions,
    ...commissionPermissions,
    ...supplierPermissions,
  ],
  [Role.ADMIN]: [
    ...leadPermissions,
    ...taskPermissions,
    ...documentPermissions,
    ...userPermissions,
    ...reportPermissions,
    ...settingPermissions,
    ...propertyPermissions,
    ...ticketPermissions,
    ...campaignPermissions,
    ...callLogPermissions,
    ...productPermissions,
    ...orderPermissions,
    ...inventoryPermissions,
    ...attendancePermissions,
    ...leavePermissions,
    ...payrollPermissions,
    ...adsPermissions,
    ...adsensePermissions,
    ...brokerPermissions,
    ...commissionPermissions,
    ...supplierPermissions,
  ],
  [Role.EMPLOYER]: [
    ...leadPermissions,
    ...taskPermissions,
    ...documentPermissions,
    ...userPermissions,
    ...reportPermissions,
    ...settingPermissions,
    ...propertyPermissions,
    ...ticketPermissions,
    ...campaignPermissions,
    ...callLogPermissions,
    ...productPermissions,
    ...orderPermissions,
    ...inventoryPermissions,
    ...attendancePermissions,
    ...leavePermissions,
    ...payrollPermissions,
    ...adsPermissions,
    ...adsensePermissions,
    ...brokerPermissions,
    ...commissionPermissions,
    ...supplierPermissions,
  ],
  [Role.MANAGER]: [
    ...leadPermissions,
    ...taskPermissions,
    ...documentPermissions,
    ...reportPermissions,
    ...propertyPermissions,
    ...ticketPermissions,
    ...campaignPermissions,
    ...callLogPermissions,
    ...attendancePermissions,
    ...leavePermissions,
    ...adsPermissions,
    ...brokerPermissions,
    { action: "read", subject: "user" },
    { action: "read", subject: "inventory" },
    { action: "read", subject: "payroll" },
  ],
  [Role.SALES_MANAGER]: [
    ...leadPermissions,
    ...taskPermissions,
    ...documentPermissions,
    ...reportPermissions,
    ...callLogPermissions,
    { action: "read", subject: "user" },
    { action: "read", subject: "property" },
    { action: "read", subject: "ticket" },
    { action: "read", subject: "campaign" },
    { action: "read", subject: "report" },
    { action: "export", subject: "report" },
  ],
  [Role.MARKETING_EXECUTIVE]: [
    ...campaignPermissions,
    ...adsPermissions,
    ...adsensePermissions,
    { action: "create", subject: "lead" },
    { action: "read", subject: "lead" },
    { action: "read", subject: "report" },
    { action: "read", subject: "document" },
  ],
  [Role.TEAM_LEADER]: [
    { action: "create", subject: "lead" },
    { action: "read", subject: "lead" },
    { action: "update", subject: "lead" },
    { action: "create", subject: "task" },
    { action: "read", subject: "task" },
    { action: "update", subject: "task" },
    { action: "create", subject: "document" },
    { action: "read", subject: "document" },
    { action: "read", subject: "report" },
    { action: "read", subject: "property" },
    { action: "read", subject: "ticket" },
  ],
  [Role.HR]: [
    ...userPermissions,
    ...attendancePermissions,
    ...leavePermissions,
    ...payrollPermissions,
    { action: "read", subject: "document" },
    { action: "create", subject: "document" },
  ],
  [Role.RECRUITER]: [
    ...userPermissions,
    { action: "read", subject: "document" },
  ],
  [Role.FINANCE]: [
    ...payrollPermissions,
    ...commissionPermissions,
    { action: "read", subject: "order" },
    { action: "read", subject: "report" },
    { action: "export", subject: "report" },
  ],
  [Role.SALES_EXECUTIVE]: [
    { action: "create", subject: "lead" },
    { action: "read", subject: "lead" },
    { action: "update", subject: "lead" },
    { action: "create", subject: "task" },
    { action: "read", subject: "task" },
    { action: "update", subject: "task" },
    { action: "create", subject: "document" },
    { action: "read", subject: "document" },
    { action: "read", subject: "property" },
    { action: "read", subject: "ticket" },
    { action: "create", subject: "ticket" },
  ],
  [Role.EMPLOYEE]: [
    { action: "read", subject: "task" },
    { action: "update", subject: "task" },
    { action: "create", subject: "attendance" },
    { action: "read", subject: "attendance" },
    { action: "create", subject: "leave" },
    { action: "read", subject: "leave" },
    { action: "read", subject: "payroll" },
    { action: "read", subject: "document" },
  ],
  [Role.CUSTOMER]: [
    { action: "read", subject: "order" },
    { action: "create", subject: "ticket" },
    { action: "read", subject: "ticket" },
    { action: "update", subject: "ticket" },
    { action: "read", subject: "document" },
    { action: "read", subject: "property" },
  ],
  [Role.VENDOR]: [
    { action: "read", subject: "product" },
    { action: "read", subject: "order" },
    { action: "read", subject: "document" },
  ],
  [Role.VIEWER]: [
    { action: "read", subject: "lead" },
    { action: "read", subject: "task" },
    { action: "read", subject: "document" },
    { action: "read", subject: "report" },
    { action: "read", subject: "property" },
  ],
};
