"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TaskType, type Task } from "@/types";
import { TASK_TYPE_LABELS } from "@/lib/constants";

const taskFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  lead_id: z.string().optional(),
  assigned_to: z.string().optional(),
  task_type: z.nativeEnum(TaskType),
  due_date: z.string().optional(),
  reminder_at: z.string().optional(),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

interface TaskFormProps {
  task?: Task;
  leads?: { id: string; label: string }[];
  users?: { id: string; label: string }[];
  onSubmit: (data: TaskFormValues) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function TaskForm({
  task,
  leads,
  users,
  onSubmit,
  onCancel,
  loading,
}: TaskFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: task?.title ?? "",
      description: task?.description ?? "",
      lead_id: task?.lead_id ?? "",
      assigned_to: task?.assigned_to ?? "",
      task_type: task?.task_type ?? TaskType.FOLLOW_UP,
      due_date: task?.due_date ? task.due_date.slice(0, 10) : "",
      reminder_at: task?.reminder_at
        ? task.reminder_at.slice(0, 16)
        : "",
    },
  });

  const watchTaskType = watch("task_type");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="title">
          Title <span className="text-destructive">*</span>
        </Label>
        <Input id="title" {...register("title")} placeholder="Task title" />
        {errors.title && (
          <p className="text-xs text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          {...register("description")}
          placeholder="Task description..."
          className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="task_type">Task Type</Label>
          <Select
            value={watchTaskType}
            onValueChange={(v) => setValue("task_type", v as TaskType)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.values(TaskType).map((t) => (
                <SelectItem key={t} value={t}>
                  {TASK_TYPE_LABELS[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="due_date">Due Date</Label>
          <Input id="due_date" type="date" {...register("due_date")} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="lead_id">Lead</Label>
          <Select
            value={watch("lead_id")}
            onValueChange={(v) => setValue("lead_id", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a lead..." />
            </SelectTrigger>
            <SelectContent>
              {leads?.map((lead) => (
                <SelectItem key={lead.id} value={lead.id}>
                  {lead.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="assigned_to">Assigned To</Label>
          <Select
            value={watch("assigned_to")}
            onValueChange={(v) => setValue("assigned_to", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Assign to..." />
            </SelectTrigger>
            <SelectContent>
              {users?.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="reminder_at">Reminder</Label>
        <Input
          id="reminder_at"
          type="datetime-local"
          {...register("reminder_at")}
        />
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {task ? "Update Task" : "Create Task"}
        </Button>
      </div>
    </form>
  );
}
