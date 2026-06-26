import { z } from "zod";
import { LeadStatus, LeadSource, LeadPriority } from "@/types";

export const createLeadSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  mobile: z.string().min(7, "Mobile number must be at least 7 digits"),
  company: z.string().nullable().optional(),
  job_title: z.string().nullable().optional(),
  industry: z.string().nullable().optional(),
  lead_source: z.nativeEnum(LeadSource),
  status: z.nativeEnum(LeadStatus).default(LeadStatus.NEW),
  priority: z.nativeEnum(LeadPriority).default(LeadPriority.MEDIUM),
  estimated_deal_value: z.number().nonnegative().nullable().optional(),
  notes: z.string().nullable().optional(),
  tags: z.array(z.string()).nullable().optional(),
  assigned_to: z.string().nullable().optional(),
});

export const updateLeadSchema = createLeadSchema.partial();

export const leadFilterSchema = z.object({
  search: z.string().optional(),
  status: z.array(z.nativeEnum(LeadStatus)).optional(),
  source: z.array(z.nativeEnum(LeadSource)).optional(),
  priority: z.array(z.nativeEnum(LeadPriority)).optional(),
  assigned_to: z.string().optional(),
  owner_id: z.string().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  min_value: z.number().nonnegative().optional(),
  max_value: z.number().nonnegative().optional(),
  tags: z.array(z.string()).optional(),
});

export const bulkImportSchema = z.object({
  leads: z.array(createLeadSchema).min(1, "At least one lead is required"),
  overwrite_duplicates: z.boolean().default(false),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
export type LeadFilterInput = z.infer<typeof leadFilterSchema>;
export type BulkImportInput = z.infer<typeof bulkImportSchema>;
