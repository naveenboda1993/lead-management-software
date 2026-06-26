"use client";

import { useState } from "react";
import { Loader2, Check, X } from "lucide-react";
import { useLeaves, useUpdateLeave } from "@/hooks/use-employees";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/components/ui/toast";
import { LEAVE_STATUS_LABELS, LEAVE_STATUS_COLORS, LEAVE_TYPE_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils/format";

export default function LeavesPage() {
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const { data: leaves, isLoading } = useLeaves({
    status: statusFilter.length > 0 ? statusFilter : undefined,
  });
  const updateLeave = useUpdateLeave();

  const handleApproval = async (id: string, status: "APPROVED" | "REJECTED") => {
    try {
      await updateLeave.mutateAsync({ id, status } as any);
      toast.success(`Leave ${status.toLowerCase()}`);
    } catch {
      toast.error("Failed to update leave");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Leave Requests</h1>
        <p className="text-muted-foreground">Approve or reject employee leave requests</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select
          value={statusFilter[0] ?? ""}
          onValueChange={(v) => setStatusFilter(v ? [v] : [])}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=" ">All</SelectItem>
            {Object.entries(LEAVE_STATUS_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : !leaves || leaves.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No leave requests found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 text-sm font-medium">Employee</th>
                <th className="text-left p-3 text-sm font-medium">Type</th>
                <th className="text-left p-3 text-sm font-medium">From</th>
                <th className="text-left p-3 text-sm font-medium">To</th>
                <th className="text-left p-3 text-sm font-medium">Days</th>
                <th className="text-left p-3 text-sm font-medium">Reason</th>
                <th className="text-left p-3 text-sm font-medium">Status</th>
                <th className="text-left p-3 text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map((leave) => (
                <tr key={leave.id} className="border-b">
                  <td className="p-3 text-sm">{leave.employee_id}</td>
                  <td className="p-3 text-sm">{LEAVE_TYPE_LABELS[leave.leave_type]}</td>
                  <td className="p-3 text-sm">{formatDate(leave.start_date)}</td>
                  <td className="p-3 text-sm">{formatDate(leave.end_date)}</td>
                  <td className="p-3 text-sm">{leave.total_days}</td>
                  <td className="p-3 text-sm max-w-[200px] truncate">{leave.reason}</td>
                  <td className="p-3">
                    <Badge className={LEAVE_STATUS_COLORS[leave.status]} variant="outline">
                      {LEAVE_STATUS_LABELS[leave.status]}
                    </Badge>
                  </td>
                  <td className="p-3">
                    {leave.status === "PENDING" && (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 text-green-600"
                          onClick={() => handleApproval(leave.id, "APPROVED")}
                          disabled={updateLeave.isPending}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 text-red-600"
                          onClick={() => handleApproval(leave.id, "REJECTED")}
                          disabled={updateLeave.isPending}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
