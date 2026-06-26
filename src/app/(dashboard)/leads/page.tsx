"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import Link from "next/link";
import { Plus, Loader2, Upload, Pencil, Trash2, UserRoundCog } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { useLeads, useCreateLead, useUpdateLead, useDeleteLead } from "@/hooks/use-leads";
import { createClient } from "@/lib/supabase/client";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import { LeadForm } from "@/components/leads/lead-form";
import { LeadFilters } from "@/components/leads/lead-filters";
import { BulkActions } from "@/components/leads/bulk-actions";
import { LEAD_STATUS_LABELS, LEAD_STATUS_COLORS, PRIORITY_LABELS, PRIORITY_COLORS, LEAD_SOURCE_LABELS } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import type { Lead, LeadFilters as LeadFiltersType } from "@/types";
import { createLeadSchema } from "@/lib/validations/lead";
import { z } from "zod";

type CreateLeadInput = z.infer<typeof createLeadSchema>;

export default function LeadsPage() {
  const [filters, setFilters] = useState<LeadFiltersType>({});
  const { data: leads, isLoading, error } = useLeads(filters);
  const createLead = useCreateLead();
  const updateLead = useUpdateLead();
  const deleteLead = useDeleteLead();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Lead | null>(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignTarget, setAssignTarget] = useState<Lead | null>(null);
  const [assignUserId, setAssignUserId] = useState("");
  const [profiles, setProfiles] = useState<{ id: string; full_name: string; role: string }[]>([]);

  useEffect(() => {
    if (assignOpen) {
      createClient().from("profiles").select("id, full_name, role").then(({ data }) => {
        if (data) setProfiles(data);
      });
    }
  }, [assignOpen]);
  const [importOpen, setImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: number;
    failed: number;
    duplicates: number;
    total: number;
    failedRows?: { row: number; error: string }[];
  } | null>(null);
  const [, setBulkLoading] = useState(false);

  const handleCreateLead = async (data: CreateLeadInput) => {
    try {
      await createLead.mutateAsync(data);
      toast.success("Lead created successfully");
      setCreateOpen(false);
    } catch {
      toast.error("Failed to create lead");
    }
  };

  const handleEditLead = async (data: CreateLeadInput) => {
    if (!editLead) return;
    try {
      await updateLead.mutateAsync({ id: editLead.id, ...data });
      toast.success("Lead updated successfully");
      setEditOpen(false);
      setEditLead(null);
    } catch {
      toast.error("Failed to update lead");
    }
  };

  const handleDeleteLead = async () => {
    if (!deleteTarget) return;
    try {
      await deleteLead.mutateAsync(deleteTarget.id);
      toast.success("Lead deleted");
      setDeleteOpen(false);
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete lead");
    }
  };

  const handleAssignLead = async () => {
    if (!assignTarget || !assignUserId) return;
    try {
      await updateLead.mutateAsync({ id: assignTarget.id, assigned_to: assignUserId });
      toast.success("Lead assigned");
      setAssignOpen(false);
      setAssignTarget(null);
      setAssignUserId("");
    } catch {
      toast.error("Failed to assign lead");
    }
  };

  const handleImport = async () => {
    if (!importFile) return;
    setImporting(true);
    setImportResult(null);
    try {
      const formData = new FormData();
      formData.append("file", importFile);
      const res = await fetch("/api/leads/import", { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Import failed");
      setImportResult(json.data.summary);
      if (json.data.failed_rows) {
        setImportResult((prev) => prev ? { ...prev, failedRows: json.data.failed_rows } : null);
      }
      toast.success(`Imported ${json.data.summary.success} leads`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Import failed");
    } finally {
      setImporting(false);
    }
  };

  const handleBulkAssign = async (_userId: string) => {
    setBulkLoading(true);
    try {
      const promises = Array.from(selectedIds).map((id) =>
        updateLead.mutateAsync({ id, assigned_to: _userId })
      );
      await Promise.all(promises);
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkExport = async () => {
    setBulkLoading(true);
    try {
      const selectedLeads = leads?.filter((l) => selectedIds.has(l.id)) ?? [];
      const csv = [
        ["First Name", "Last Name", "Email", "Mobile", "Company", "Status", "Source", "Priority", "Value", "Created"].join(","),
        ...selectedLeads.map((l) =>
          [
            l.first_name,
            l.last_name,
            l.email,
            l.mobile,
            l.company ?? "",
            l.status,
            l.lead_source,
            l.priority,
            l.estimated_deal_value ?? "",
            l.created_at,
          ].join(",")
        ),
      ].join("\n");

      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `leads-export-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    setBulkLoading(true);
    try {
      const promises = Array.from(selectedIds).map((id) =>
        deleteLead.mutateAsync(id)
      );
      await Promise.all(promises);
    } finally {
      setBulkLoading(false);
    }
  };

  const columns = useMemo<ColumnDef<Lead>[]>(
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
            onCheckedChange={(value) => {
              row.toggleSelected(!!value);
              const next = new Set(selectedIds);
              if (value) {
                next.add(row.original.id);
              } else {
                next.delete(row.original.id);
              }
              setSelectedIds(next);
            }}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "lead_number",
        header: "Lead #",
      },
      {
        id: "name",
        header: "Name",
        cell: ({ row }) => (
          <Link href={`/leads/${row.original.id}`} className="font-medium hover:underline">
            {row.original.first_name} {row.original.last_name}
          </Link>
        ),
      },
      {
        accessorKey: "company",
        header: "Company",
        cell: ({ row }) => row.original.company ?? "-",
      },
      {
        accessorKey: "email",
        header: "Email",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge
            className={LEAD_STATUS_COLORS[row.original.status]}
            variant="outline"
          >
            {LEAD_STATUS_LABELS[row.original.status]}
          </Badge>
        ),
      },
      {
        accessorKey: "priority",
        header: "Priority",
        cell: ({ row }) => (
          <Badge
            className={PRIORITY_COLORS[row.original.priority]}
            variant="outline"
          >
            {PRIORITY_LABELS[row.original.priority]}
          </Badge>
        ),
      },
      {
        accessorKey: "lead_source",
        header: "Source",
        cell: ({ row }) => LEAD_SOURCE_LABELS[row.original.lead_source],
      },
      {
        accessorKey: "estimated_deal_value",
        header: "Value",
        cell: ({ row }) =>
          row.original.estimated_deal_value
            ? formatCurrency(row.original.estimated_deal_value)
            : "-",
      },
      {
        accessorKey: "created_at",
        header: "Created",
        cell: ({ row }) => formatDate(row.original.created_at),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-more-horizontal"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => window.location.href = `/leads/${row.original.id}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setEditLead(row.original); setEditOpen(true); }}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setAssignTarget(row.original); setAssignUserId(row.original.assigned_to ?? ""); setAssignOpen(true); }}>
                <UserRoundCog className="mr-2 h-4 w-4" />
                Assign
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => { setDeleteTarget(row.original); setDeleteOpen(true); }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [selectedIds]
  );

  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-destructive">Failed to load leads</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leads</h1>
          <p className="text-muted-foreground">
            Manage and track your sales leads
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => { setImportFile(null); setImportResult(null); setImportOpen(true); }}>
            <Upload className="mr-2 h-4 w-4" />
            Import CSV
          </Button>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Lead
          </Button>
        </div>
      </div>

      <LeadFilters filters={filters} onFiltersChange={setFilters} />

      {selectedIds.size > 0 && (
        <BulkActions
          selectedIds={selectedIds}
          leads={leads ?? []}
          onSelectionChange={setSelectedIds}
          onBulkAssign={handleBulkAssign}
          onBulkExport={handleBulkExport}
          onBulkDelete={handleBulkDelete}
        />
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={leads ?? []}
          searchKey="email"
        />
      )}

      <Dialog open={importOpen} onOpenChange={(o) => { if (!o) { setImportOpen(false); setImportFile(null); setImportResult(null); } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Import Leads from CSV</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            {importResult ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Import complete</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg border p-3 text-center">
                    <p className="text-2xl font-bold text-green-600">{importResult.success}</p>
                    <p className="text-xs text-muted-foreground">Imported</p>
                  </div>
                  <div className="rounded-lg border p-3 text-center">
                    <p className="text-2xl font-bold text-red-600">{importResult.failed}</p>
                    <p className="text-xs text-muted-foreground">Failed</p>
                  </div>
                  <div className="rounded-lg border p-3 text-center">
                    <p className="text-2xl font-bold text-yellow-600">{importResult.duplicates}</p>
                    <p className="text-xs text-muted-foreground">Duplicates</p>
                  </div>
                </div>
                {importResult.failedRows && importResult.failedRows.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Failed rows:</p>
                    <div className="max-h-[200px] overflow-y-auto rounded border p-2 text-xs">
                      {importResult.failedRows.map((r, i) => (
                        <p key={i} className="text-red-600">
                          Row {r.row}: {r.error}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
                <Button onClick={() => { setImportOpen(false); setImportFile(null); setImportResult(null); }}>
                  Done
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-1.5">
                  <Label className="text-xs">Select CSV file</Label>
                  <Input
                    type="file"
                    accept=".csv"
                    onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  CSV must include at least first_name, last_name, email, and mobile columns.
                </p>
                <Button onClick={handleImport} disabled={!importFile || importing}>
                  {importing ? "Importing..." : "Import"}
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Lead</DialogTitle>
          </DialogHeader>
          <LeadForm
            onSubmit={handleCreateLead}
            onCancel={() => setCreateOpen(false)}
            loading={createLead.isPending}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={(o) => { if (!o) { setEditOpen(false); setEditLead(null); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Lead</DialogTitle>
          </DialogHeader>
          {editLead && (
            <LeadForm
              lead={editLead}
              onSubmit={handleEditLead}
              onCancel={() => { setEditOpen(false); setEditLead(null); }}
              loading={updateLead.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={(o) => { if (!o) { setDeleteOpen(false); setDeleteTarget(null); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Lead</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {deleteTarget?.first_name} {deleteTarget?.last_name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDeleteOpen(false); setDeleteTarget(null); }}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteLead}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={assignOpen} onOpenChange={(o) => { if (!o) { setAssignOpen(false); setAssignTarget(null); setAssignUserId(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Lead</DialogTitle>
            <DialogDescription>
              Assign {assignTarget?.first_name} {assignTarget?.last_name} to a user.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Assign to</Label>
              <Select value={assignUserId} onValueChange={setAssignUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  {profiles.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.full_name} ({p.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setAssignOpen(false); setAssignTarget(null); setAssignUserId(""); }}>
              Cancel
            </Button>
            <Button onClick={handleAssignLead} disabled={!assignUserId}>
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
