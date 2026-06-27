"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { Plus, Loader2, Check, X } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from "@/hooks/use-tasks";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { TaskForm } from "@/components/tasks/task-form";
import { TaskFilters, type TaskFiltersState } from "@/components/tasks/task-filters";
import {
  TASK_STATUS_LABELS,
  TASK_STATUS_COLORS,
  TASK_TYPE_LABELS,
} from "@/lib/constants";
import { formatDate } from "@/lib/utils/format";
import { TaskStatus, TaskType, type Task } from "@/types";
import { useLeads } from "@/hooks/use-leads";
import { createClient } from "@/lib/supabase/client";


const defaultFilters: TaskFiltersState = {
  status: [],
  taskType: "ALL",
  assignee: "",
  dateFrom: "",
  dateTo: "",
};

export default function TasksPage() {
  const [filters, setFilters] = useState<TaskFiltersState>(defaultFilters);
  const { data: tasks, isLoading, error } = useTasks();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const { data: leads } = useLeads();
  const [createOpen, setCreateOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [users, setUsers] = useState<{ id: string; label: string }[]>([]);
  const [, setUsersLoading] = useState(false);
  const [profileMap, setProfileMap] = useState<Record<string, string>>({});

  const loadUsers = useCallback(async () => {
    if (users.length > 0) return;
    setUsersLoading(true);
    const supabase = createClient();
    const { data } = await supabase.from("profiles").select("id, full_name");
    if (data) {
      setUsers(data.map((u: { id: string; full_name: string }) => ({ id: u.id, label: u.full_name })));
      const map: Record<string, string> = {};
      data.forEach((u: { id: string; full_name: string }) => { map[u.id] = u.full_name; });
      setProfileMap(map);
    }
    setUsersLoading(false);
  }, [users.length]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const filteredTasks = useMemo(() => {
    if (!tasks) return [];
    return tasks.filter((task) => {
      if (filters.status.length > 0 && !filters.status.includes(task.status as TaskStatus)) {
        return false;
      }
      if (filters.taskType !== "ALL" && task.task_type !== filters.taskType) {
        return false;
      }
      if (filters.assignee && task.assigned_to !== filters.assignee) {
        if (
          !task.assigned_to
            ?.toLowerCase()
            .includes(filters.assignee.toLowerCase())
        ) {
          return false;
        }
      }
      if (filters.dateFrom && task.due_date) {
        if (new Date(task.due_date) < new Date(filters.dateFrom)) {
          return false;
        }
      }
      if (filters.dateTo && task.due_date) {
        if (new Date(task.due_date) > new Date(filters.dateTo)) {
          return false;
        }
      }
      return true;
    });
  }, [tasks, filters]);

  const leadOptions = useMemo(
    () =>
      leads?.map((l) => ({
        id: l.id,
        label: `${l.first_name} ${l.last_name}${l.company ? ` (${l.company})` : ""}`,
      })) ?? [],
    [leads]
  );

  const handleCreate = async (data: Record<string, unknown>) => {
    try {
      await createTask.mutateAsync({
        title: data.title as string,
        description: (data.description as string) || null,
        lead_id: (data.lead_id as string) || null,
        assigned_to: (data.assigned_to as string) || null,
        task_type: data.task_type as TaskType,
        status: "pending" as TaskStatus,
        due_date: (data.due_date as string) || null,
        reminder_at: (data.reminder_at as string) || null,
      });
      toast.success("Task created successfully");
      setCreateOpen(false);
    } catch {
      toast.error("Failed to create task");
    }
  };

  const handleUpdate = async (data: Record<string, unknown>) => {
    if (!editTask) return;
    try {
      await updateTask.mutateAsync({
        id: editTask.id,
        title: data.title as string,
        description: (data.description as string) || null,
        lead_id: (data.lead_id as string) || null,
        assigned_to: (data.assigned_to as string) || null,
        task_type: data.task_type as TaskType,
        due_date: (data.due_date as string) || null,
        reminder_at: (data.reminder_at as string) || null,
      });
      toast.success("Task updated successfully");
      setEditTask(null);
    } catch {
      toast.error("Failed to update task");
    }
  };

  const handleComplete = useCallback(async (task: Task) => {
    try {
      await updateTask.mutateAsync({
        id: task.id,
        status: TaskStatus.COMPLETED,
      });
      toast.success("Task completed");
    } catch {
      toast.error("Failed to complete task");
    }
  }, [updateTask]);

  const handleCancel = useCallback(async (task: Task) => {
    try {
      await updateTask.mutateAsync({
        id: task.id,
        status: TaskStatus.CANCELLED,
      });
      toast.success("Task cancelled");
    } catch {
      toast.error("Failed to cancel task");
    }
  }, [updateTask]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      await deleteTask.mutateAsync(id);
      toast.success("Task deleted");
    } catch {
      toast.error("Failed to delete task");
    }
  }, [deleteTask]);

  const columns = useMemo<ColumnDef<Task>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => (
          <span
            className={
              row.original.status === TaskStatus.COMPLETED
                ? "line-through text-muted-foreground"
                : "font-medium"
            }
          >
            {row.original.title}
          </span>
        ),
      },
      {
        id: "lead",
        header: "Lead",
        cell: ({ row }) => {
          const lead = leads?.find((l) => l.id === row.original.lead_id);
          return lead ? (
            <span className="text-sm">
              {lead.first_name} {lead.last_name}
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">-</span>
          );
        },
      },
      {
        id: "assigned_to",
        header: "Assigned To",
        cell: ({ row }) => (
          <span className="text-sm">
            {row.original.assigned_to
              ? (profileMap[row.original.assigned_to] ?? row.original.assigned_to.slice(0, 8) + "...")
              : "-"}
          </span>
        ),
      },
      {
        accessorKey: "task_type",
        header: "Type",
        cell: ({ row }) => (
          <span className="text-sm">
            {TASK_TYPE_LABELS[row.original.task_type as TaskType]}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className={TASK_STATUS_COLORS[row.original.status as TaskStatus]}
          >
            {TASK_STATUS_LABELS[row.original.status as TaskStatus]}
          </Badge>
        ),
      },
      {
        accessorKey: "due_date",
        header: "Due Date",
        cell: ({ row }) =>
          row.original.due_date ? (
            <span className="text-sm">{formatDate(row.original.due_date)}</span>
          ) : (
            <span className="text-sm text-muted-foreground">-</span>
          ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const task = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {task.status === TaskStatus.PENDING && (
                  <>
                    <DropdownMenuItem onClick={() => handleComplete(task)}>
                      <Check className="mr-2 h-4 w-4 text-green-600" />
                      Complete
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleCancel(task)}>
                      <X className="mr-2 h-4 w-4 text-red-600" />
                      Cancel
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem
                  onClick={() => {
                    setEditTask(task);
                    loadUsers();
                  }}
                >
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => handleDelete(task.id)}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [leads, loadUsers, handleCancel, handleComplete, handleDelete, profileMap]
  );

  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-destructive">Failed to load tasks</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">
            Manage follow-ups, calls, meetings, and reminders
          </p>
        </div>
        <Button
          onClick={() => {
            loadUsers();
            setCreateOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Task
        </Button>
      </div>

      <TaskFilters filters={filters} onFiltersChange={setFilters} />

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredTasks}
          searchKey="title"
        />
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Task</DialogTitle>
          </DialogHeader>
          <TaskForm
            leads={leadOptions}
            users={users}
            onSubmit={handleCreate}
            onCancel={() => setCreateOpen(false)}
            loading={createTask.isPending}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!editTask}
        onOpenChange={(open) => {
          if (!open) setEditTask(null);
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          {editTask && (
            <TaskForm
              task={editTask}
              leads={leadOptions}
              users={users}
              onSubmit={handleUpdate}
              onCancel={() => setEditTask(null)}
              loading={updateTask.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
