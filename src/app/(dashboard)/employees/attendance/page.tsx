"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useAttendance, useUpdateAttendance } from "@/hooks/use-employees";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { ATTENDANCE_STATUS_LABELS, ATTENDANCE_STATUS_COLORS } from "@/lib/constants";
import { formatDate } from "@/lib/utils/format";

export default function AttendancePage() {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const { data: records, isLoading } = useAttendance({ employee_id: employeeId || undefined, date_from: dateFrom || undefined, date_to: dateTo || undefined });
  const updateAttendance = useUpdateAttendance();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleStatusUpdate = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      await updateAttendance.mutateAsync({ id, status: status as any });
      toast.success("Attendance updated");
    } catch {
      toast.error("Failed to update");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Attendance</h1>
        <p className="text-muted-foreground">Track and manage employee attendance</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input
          type="date"
          className="w-[160px]"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
        />
        <Input
          type="date"
          className="w-[160px]"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
        />
        <Input
          placeholder="Employee ID"
          className="w-[160px]"
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : !records || records.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No attendance records found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 text-sm font-medium">Employee</th>
                <th className="text-left p-3 text-sm font-medium">Date</th>
                <th className="text-left p-3 text-sm font-medium">Status</th>
                <th className="text-left p-3 text-sm font-medium">Check In</th>
                <th className="text-left p-3 text-sm font-medium">Check Out</th>
                <th className="text-left p-3 text-sm font-medium">Late</th>
                <th className="text-left p-3 text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id} className="border-b">
                  <td className="p-3 text-sm">{record.employee_id}</td>
                  <td className="p-3 text-sm">{formatDate(record.date)}</td>
                  <td className="p-3">
                    <Badge className={ATTENDANCE_STATUS_COLORS[record.status]} variant="outline">
                      {ATTENDANCE_STATUS_LABELS[record.status]}
                    </Badge>
                  </td>
                  <td className="p-3 text-sm">{record.check_in ?? "-"}</td>
                  <td className="p-3 text-sm">{record.check_out ?? "-"}</td>
                  <td className="p-3 text-sm">{record.late_minutes > 0 ? `${record.late_minutes}m` : "-"}</td>
                  <td className="p-3">
                    <Select
                      value=""
                      onValueChange={(v) => handleStatusUpdate(record.id, v)}
                    >
                      <SelectTrigger className="w-[130px]" disabled={updatingId === record.id}>
                        <SelectValue placeholder="Update" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(ATTENDANCE_STATUS_LABELS).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
