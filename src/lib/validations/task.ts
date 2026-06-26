import { z } from "zod";
import { TaskType, TaskStatus } from "@/types";

export const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().nullable().optional(),
  lead_id: z.string().nullable().optional(),
  assigned_to: z.string().nullable().optional(),
  task_type: z.nativeEnum(TaskType),
  status: z.nativeEnum(TaskStatus).default(TaskStatus.PENDING),
  due_date: z.string().nullable().optional(),
  reminder_at: z.string().nullable().optional(),
});

export const updateTaskSchema = createTaskSchema.partial();

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
