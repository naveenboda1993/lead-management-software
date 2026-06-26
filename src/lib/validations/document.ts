import { z } from "zod";

export const documentUploadSchema = z.object({
  name: z.string().min(1, "Document name is required"),
  file_path: z.string().optional(),
  file_size: z.number().positive("File size must be a positive number").optional(),
  file_type: z.string().optional(),
  lead_id: z.string().nullable().optional(),
});

export type DocumentUploadInput = z.infer<typeof documentUploadSchema>;
