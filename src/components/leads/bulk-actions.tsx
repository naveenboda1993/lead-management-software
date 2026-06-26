"use client";

import { useState } from "react";
import {
  CheckSquare,
  Square,
  Download,
  Trash2,
  UserPlus,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";
import type { Lead } from "@/types";

interface BulkActionsProps {
  selectedIds: Set<string>;
  leads: Lead[];
  onSelectionChange: (ids: Set<string>) => void;
  onBulkAssign: (userId: string) => Promise<void>;
  onBulkExport: () => Promise<void>;
  onBulkDelete: () => Promise<void>;
}

export function BulkActions({
  selectedIds,
  leads,
  onSelectionChange,
  onBulkAssign,
  onBulkExport,
  onBulkDelete,
}: BulkActionsProps) {
  const [assignOpen, setAssignOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [assigneeId, setAssigneeId] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const allSelected = selectedIds.size === leads.length && leads.length > 0;

  const toggleSelectAll = () => {
    if (allSelected) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(leads.map((l) => l.id)));
    }
  };

  const handleBulkAssign = async () => {
    if (!assigneeId) return;
    setActionLoading(true);
    try {
      await onBulkAssign(assigneeId);
      toast.success(`Assigned ${selectedIds.size} lead(s)`);
      setAssignOpen(false);
      onSelectionChange(new Set());
    } catch {
      toast.error("Failed to assign leads");
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    setActionLoading(true);
    try {
      await onBulkDelete();
      toast.success(`Deleted ${selectedIds.size} lead(s)`);
      setDeleteOpen(false);
      onSelectionChange(new Set());
    } catch {
      toast.error("Failed to delete leads");
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkExport = async () => {
    setActionLoading(true);
    try {
      await onBulkExport();
      toast.success("Export started");
    } catch {
      toast.error("Export failed");
    } finally {
      setActionLoading(false);
    }
  };

  if (leads.length === 0) return null;

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-muted/50 px-4 py-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={toggleSelectAll}
        >
          {allSelected ? (
            <CheckSquare className="h-4 w-4" />
          ) : (
            <Square className="h-4 w-4" />
          )}
        </Button>

        <span className="text-sm text-muted-foreground min-w-[120px]">
          {selectedIds.size > 0
            ? `${selectedIds.size} selected`
            : `${leads.length} total`}
        </span>

        {selectedIds.size > 0 && (
          <>
            <div className="h-4 w-px bg-border" />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAssignOpen(true)}
              disabled={actionLoading}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Assign
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkExport}
              disabled={actionLoading}
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteOpen(true)}
              disabled={actionLoading}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
            {actionLoading && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </>
        )}
      </div>

      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Leads</DialogTitle>
            <DialogDescription>
              Assign {selectedIds.size} lead(s) to a team member
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={assigneeId} onValueChange={setAssigneeId}>
              <SelectTrigger>
                <SelectValue placeholder="Select assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user-1">John Doe</SelectItem>
                <SelectItem value="user-2">Jane Smith</SelectItem>
                <SelectItem value="user-3">Bob Wilson</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAssignOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleBulkAssign} disabled={!assigneeId || actionLoading}>
              {actionLoading ? "Assigning..." : "Assign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Leads</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedIds.size} lead(s)? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={actionLoading}
            >
              {actionLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
