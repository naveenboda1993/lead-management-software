"use client";

import { useState } from "react";
import { X } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { TaskStatus, TaskType } from "@/types";
import {
  TASK_STATUS_LABELS,
  TASK_TYPE_LABELS,
} from "@/lib/constants";

export interface TaskFiltersState {
  status: TaskStatus[];
  taskType: TaskType | "ALL";
  assignee: string;
  dateFrom: string;
  dateTo: string;
}

interface TaskFiltersProps {
  filters: TaskFiltersState;
  onFiltersChange: (filters: TaskFiltersState) => void;
}

const statusOptions = Object.values(TaskStatus);

export function TaskFilters({ filters, onFiltersChange }: TaskFiltersProps) {
  const [local, setLocal] = useState<TaskFiltersState>(filters);

  const update = (partial: Partial<TaskFiltersState>) => {
    const next = { ...local, ...partial };
    setLocal(next);
    onFiltersChange(next);
  };

  const toggleStatus = (status: TaskStatus) => {
    const current = local.status;
    const next = current.includes(status)
      ? current.filter((s) => s !== status)
      : [...current, status];
    update({ status: next });
  };

  const clear = () => {
    const reset: TaskFiltersState = {
      status: [],
      taskType: "ALL",
      assignee: "",
      dateFrom: "",
      dateTo: "",
    };
    setLocal(reset);
    onFiltersChange(reset);
  };

  const hasFilters =
    local.status.length > 0 ||
    local.taskType !== "ALL" ||
    local.assignee !== "" ||
    local.dateFrom !== "" ||
    local.dateTo !== "";

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="space-y-1.5">
        <Label className="text-xs">Status</Label>
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((s) => (
            <label
              key={s}
              className="flex items-center gap-1.5 text-xs cursor-pointer"
            >
              <Checkbox
                checked={local.status.includes(s)}
                onCheckedChange={() => toggleStatus(s)}
              />
              {TASK_STATUS_LABELS[s]}
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Type</Label>
        <Select
          value={local.taskType}
          onValueChange={(v) => update({ taskType: v as TaskType | "ALL" })}
        >
          <SelectTrigger className="h-8 w-[130px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Types</SelectItem>
            {Object.values(TaskType).map((t) => (
              <SelectItem key={t} value={t}>
                {TASK_TYPE_LABELS[t]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Assignee</Label>
        <Input
          placeholder="Filter by assignee..."
          value={local.assignee}
          onChange={(e) => update({ assignee: e.target.value })}
          className="h-8 w-[150px]"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Due From</Label>
        <Input
          type="date"
          value={local.dateFrom}
          onChange={(e) => update({ dateFrom: e.target.value })}
          className="h-8 w-[140px]"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Due To</Label>
        <Input
          type="date"
          value={local.dateTo}
          onChange={(e) => update({ dateTo: e.target.value })}
          className="h-8 w-[140px]"
        />
      </div>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clear} className="h-8">
          <X className="mr-1 h-3 w-3" />
          Clear
        </Button>
      )}
    </div>
  );
}
