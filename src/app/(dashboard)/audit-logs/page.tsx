"use client";

import { useState, useMemo, useCallback } from "react";
import { Loader2, Download } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import { formatDate, formatRelativeTime } from "@/lib/utils/format";
import type { AuditLog } from "@/types";

const supabase = createClient();

interface AuditLogFilters {
  action: string;
  entityType: string;
  userId: string;
  dateFrom: string;
  dateTo: string;
}

const defaultFilters: AuditLogFilters = {
  action: "ALL",
  entityType: "ALL",
  userId: "",
  dateFrom: "",
  dateTo: "",
};

async function fetchAuditLogs(): Promise<AuditLog[]> {
  const { data } = await supabase
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  return (data ?? []) as AuditLog[];
}

export default function AuditLogsPage() {
  const { data: logs, isLoading, error } = useQuery({
    queryKey: ["audit-logs"],
    queryFn: fetchAuditLogs,
    refetchInterval: 30 * 1000,
  });

  const [filters, setFilters] = useState<AuditLogFilters>(defaultFilters);

  const filteredLogs = useMemo(() => {
    if (!logs) return [];
    return logs.filter((log) => {
      if (filters.action !== "ALL" && log.action !== filters.action) return false;
      if (filters.entityType !== "ALL" && log.entity_type !== filters.entityType) return false;
      if (filters.userId && log.user_id !== filters.userId) {
        if (!log.user_id?.toLowerCase().includes(filters.userId.toLowerCase())) return false;
      }
      if (filters.dateFrom && new Date(log.created_at) < new Date(filters.dateFrom)) return false;
      if (filters.dateTo && new Date(log.created_at) > new Date(filters.dateTo + "T23:59:59")) return false;
      return true;
    });
  }, [logs, filters]);

  const actions = useMemo(() => {
    if (!logs) return [];
    return Array.from(new Set(logs.map((l) => l.action))).sort();
  }, [logs]);

  const entityTypes = useMemo(() => {
    if (!logs) return [];
    return Array.from(new Set(logs.map((l) => l.entity_type))).sort();
  }, [logs]);

  const handleExport = useCallback(() => {
    if (!filteredLogs.length) {
      toast.error("No logs to export");
      return;
    }

    const headers = ["Timestamp", "User", "Action", "Entity Type", "Entity ID", "Details"];
    const rows = filteredLogs.map((l) => [
      l.created_at,
      l.user_id ?? "",
      l.action,
      l.entity_type,
      l.entity_id,
      l.changes ? JSON.stringify(l.changes) : "",
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((r) =>
        r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-logs-export-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success("Audit logs exported");
  }, [filteredLogs]);

  const columns = useMemo<ColumnDef<AuditLog>[]>(
    () => [
      {
        accessorKey: "created_at",
        header: "Timestamp",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="text-sm">{formatDate(row.original.created_at)}</span>
            <span className="text-xs text-muted-foreground">
              {formatRelativeTime(row.original.created_at)}
            </span>
          </div>
        ),
      },
      {
        id: "user",
        header: "User",
        cell: ({ row }) => (
          <span className="text-sm">{row.original.user_id ?? "-"}</span>
        ),
      },
      {
        accessorKey: "action",
        header: "Action",
        cell: ({ row }) => (
          <Badge variant="outline" className="text-xs">
            {row.original.action}
          </Badge>
        ),
      },
      {
        accessorKey: "entity_type",
        header: "Entity Type",
        cell: ({ row }) => (
          <span className="text-sm capitalize">{row.original.entity_type}</span>
        ),
      },
      {
        accessorKey: "entity_id",
        header: "Entity ID",
        cell: ({ row }) => (
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
            {row.original.entity_id.slice(0, 8)}...
          </code>
        ),
      },
      {
        accessorKey: "changes",
        header: "Details",
        cell: ({ row }) => {
          const changes = row.original.changes;
          return changes ? (
            <span className="text-xs text-muted-foreground truncate max-w-[200px] block">
              {JSON.stringify(changes).slice(0, 80)}
              {JSON.stringify(changes).length > 80 ? "..." : ""}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">-</span>
          );
        },
      },
    ],
    []
  );

  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-destructive">Failed to load audit logs</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Audit Logs</h1>
          <p className="text-muted-foreground">
            Track changes and actions across the system
          </p>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Action</Label>
          <Select
            value={filters.action}
            onValueChange={(v) =>
              setFilters((prev) => ({ ...prev, action: v }))
            }
          >
            <SelectTrigger className="h-8 w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Actions</SelectItem>
              {actions.map((a) => (
                <SelectItem key={a} value={a}>
                  {a}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Entity Type</Label>
          <Select
            value={filters.entityType}
            onValueChange={(v) =>
              setFilters((prev) => ({ ...prev, entityType: v }))
            }
          >
            <SelectTrigger className="h-8 w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              {entityTypes.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">User</Label>
          <Input
            placeholder="Filter by user..."
            value={filters.userId}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, userId: e.target.value }))
            }
            className="h-8 w-[150px]"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">From</Label>
          <Input
            type="date"
            value={filters.dateFrom}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))
            }
            className="h-8 w-[140px]"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">To</Label>
          <Input
            type="date"
            value={filters.dateTo}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, dateTo: e.target.value }))
            }
            className="h-8 w-[140px]"
          />
        </div>

        {(filters.action !== "ALL" ||
          filters.entityType !== "ALL" ||
          filters.userId ||
          filters.dateFrom ||
          filters.dateTo) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFilters(defaultFilters)}
            className="h-8"
          >
            Clear
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredLogs}
          pageSize={20}
        />
      )}
    </div>
  );
}
