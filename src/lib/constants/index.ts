import {
  LeadStatus,
  LeadSource,
  LeadPriority,
  TaskStatus,
  TaskType,
  Role,
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
  [LeadSource.GOOGLE_ADS]: "Google Ads",
  [LeadSource.LINKEDIN_ADS]: "LinkedIn Ads",
  [LeadSource.WALK_IN]: "Walk-In",
  [LeadSource.CSV_UPLOAD]: "CSV Upload",
  [LeadSource.API_INTEGRATION]: "API Integration",
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
  [Role.SALES_MANAGER]: "Sales Manager",
  [Role.SALES_EXECUTIVE]: "Sales Executive",
  [Role.VIEWER]: "Viewer",
};

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

export const PERMISSIONS: PermissionsMap = {
  [Role.SUPER_ADMIN]: [
    ...leadPermissions,
    ...taskPermissions,
    ...documentPermissions,
    ...userPermissions,
    ...reportPermissions,
    ...settingPermissions,
  ],
  [Role.ADMIN]: [
    ...leadPermissions,
    ...taskPermissions,
    ...documentPermissions,
    ...userPermissions,
    ...reportPermissions,
    ...settingPermissions,
  ],
  [Role.SALES_MANAGER]: [
    ...leadPermissions,
    ...taskPermissions,
    ...documentPermissions,
    ...reportPermissions,
    { action: "read", subject: "user" },
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
  ],
  [Role.VIEWER]: [
    { action: "read", subject: "lead" },
    { action: "read", subject: "task" },
    { action: "read", subject: "document" },
    { action: "read", subject: "report" },
  ],
};
