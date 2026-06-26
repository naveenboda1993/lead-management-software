"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { useCallLogs } from "@/hooks/use-calls";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CALL_DIRECTION_LABELS, CALL_STATUS_LABELS, CALL_STATUS_COLORS } from "@/lib/constants";
import { formatDate, formatRelativeTime } from "@/lib/utils/format";
import type { CallLog } from "@/types";

export default function CallLogsPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<{
    direction?: string[];
    status?: string[];
    date_from?: string;
    date_to?: string;
  }>({});
  const { data: callLogs, isLoading, error } = useCallLogs();

  const filteredLogs = useMemo(() => {
    if (!callLogs) return [];
    return callLogs.filter((log) => {
      if (filters.direction?.length && !filters.direction.includes(log.direction)) return false;
      if (filters.status?.length && !filters.status.includes(log.status)) return false;
      if (filters.date_from && new Date(log.created_at) < new Date(filters.date_from)) return false;
      if (filters.date_to && new Date(log.created_at) > new Date(filters.date_to)) return false;
      return true;
    });
  }, [callLogs, filters]);

  const handleRowClick = useCallback(
    (log: CallLog) => {
      router.push(`/calls/${log.id}`);
    },
    [router]
  );

  const columns = useMemo<ColumnDef<CallLog>[]>(
    () => [
      {
        accessorKey: "call_id",
        header: "Call ID",
      },
      {
        accessorKey: "direction",
        header: "Direction",
        cell: ({ row }) => (
          <Badge variant="outline">
            {CALL_DIRECTION_LABELS[row.original.direction]}
          </Badge>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge className={CALL_STATUS_COLORS[row.original.status]} variant="outline">
            {CALL_STATUS_LABELS[row.original.status]}
          </Badge>
        ),
      },
      {
        accessorKey: "from_number",
        header: "From",
      },
      {
        accessorKey: "to_number",
        header: "To",
      },
      {
        accessorKey: "duration_seconds",
        header: "Duration",
        cell: ({ row }) => {
          const secs = row.original.duration_seconds;
          if (secs < 60) return `${secs}s`;
          return `${Math.floor(secs / 60)}m ${secs % 60}s`;
        },
      },
      {
        accessorKey: "created_at",
        header: "Time",
        cell: ({ row }) => (
          <span title={formatDate(row.original.created_at)}>
            {formatRelativeTime(row.original.created_at)}
          </span>
        ),
      },
    ],
    []
  );

  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-destructive">Failed to load call logs</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Call Logs</h1>
        <p className="text-muted-foreground">Track and manage IVR call records</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select
          value={filters.direction?.[0] ?? ""}
          onValueChange={(v) => setFilters((p) => ({ ...p, direction: v ? [v] : undefined }))}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Direction" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=" ">All</SelectItem>
            {Object.entries(CALL_DIRECTION_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.status?.[0] ?? ""}
          onValueChange={(v) => setFilters((p) => ({ ...p, status: v ? [v] : undefined }))}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=" ">All</SelectItem>
            {Object.entries(CALL_STATUS_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="date"
          className="w-[150px]"
          value={filters.date_from ?? ""}
          onChange={(e) => setFilters((p) => ({ ...p, date_from: e.target.value || undefined }))}
        />
        <Input
          type="date"
          className="w-[150px]"
          value={filters.date_to ?? ""}
          onChange={(e) => setFilters((p) => ({ ...p, date_to: e.target.value || undefined }))}
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredLogs}
          searchKey="call_id"
          onRowClick={handleRowClick}
        />
      )}
    </div>
  );
}
