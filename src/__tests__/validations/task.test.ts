import { describe, it, expect } from "vitest";
import { createTaskSchema, updateTaskSchema } from "@/lib/validations/task";
import { TaskType, TaskStatus } from "@/types";

describe("createTaskSchema", () => {
  const validTask = {
    title: "Follow up with client",
    task_type: TaskType.FOLLOW_UP,
  };

  it("accepts a minimal valid task", () => {
    const result = createTaskSchema.safeParse(validTask);
    expect(result.success).toBe(true);
  });

  it("rejects missing title", () => {
    const result = createTaskSchema.safeParse({ task_type: TaskType.FOLLOW_UP });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("title");
    }
  });

  it("rejects empty title", () => {
    const result = createTaskSchema.safeParse({ ...validTask, title: "" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid task_type", () => {
    const result = createTaskSchema.safeParse({ ...validTask, task_type: "INVALID" });
    expect(result.success).toBe(false);
  });

  it("defaults status to PENDING", () => {
    const result = createTaskSchema.safeParse(validTask);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe(TaskStatus.PENDING);
    }
  });

  it("accepts all optional fields", () => {
    const result = createTaskSchema.safeParse({
      ...validTask,
      description: "Call client about proposal",
      lead_id: "lead-1",
      assigned_to: "user-1",
      status: TaskStatus.COMPLETED,
      due_date: "2024-01-15",
      reminder_at: "2024-01-14T09:00:00Z",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe(TaskStatus.COMPLETED);
    }
  });

  it("accepts nullable optional fields", () => {
    const result = createTaskSchema.safeParse({
      ...validTask,
      description: null,
      lead_id: null,
      assigned_to: null,
      due_date: null,
      reminder_at: null,
    });
    expect(result.success).toBe(true);
  });
});

describe("updateTaskSchema", () => {
  it("accepts partial updates", () => {
    const result = updateTaskSchema.safeParse({ title: "Updated title" });
    expect(result.success).toBe(true);
  });

  it("accepts empty object", () => {
    const result = updateTaskSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts status change only", () => {
    const result = updateTaskSchema.safeParse({ status: TaskStatus.COMPLETED });
    expect(result.success).toBe(true);
  });

  it("rejects invalid task_type even in partial update", () => {
    const result = updateTaskSchema.safeParse({ task_type: "INVALID" });
    expect(result.success).toBe(false);
  });
});
