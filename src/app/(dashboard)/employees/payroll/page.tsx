"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { usePayroll, useUpdatePayroll } from "@/hooks/use-employees";
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
} from "@/components/ui/card";
import { toast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/utils/format";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function PayrollPage() {
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const { data: records, isLoading } = usePayroll({ month, year });
  const updatePayroll = useUpdatePayroll();

  const handleMarkPaid = async (id: string) => {
    try {
      await updatePayroll.mutateAsync({ id, payment_status: "PAID", paid_at: new Date().toISOString() });
      toast.success("Payroll marked as paid");
    } catch {
      toast.error("Failed to update");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Payroll</h1>
        <p className="text-muted-foreground">Manage employee payroll</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select
          value={String(month)}
          onValueChange={(v) => setMonth(Number(v))}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map((m, i) => (
              <SelectItem key={i + 1} value={String(i + 1)}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="number"
          className="w-[100px]"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : !records || records.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No payroll records for {MONTHS[month - 1]} {year}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 text-sm font-medium">Employee</th>
                <th className="text-left p-3 text-sm font-medium">Basic</th>
                <th className="text-left p-3 text-sm font-medium">Allowances</th>
                <th className="text-left p-3 text-sm font-medium">Deductions</th>
                <th className="text-left p-3 text-sm font-medium">Bonus</th>
                <th className="text-left p-3 text-sm font-medium">Tax</th>
                <th className="text-left p-3 text-sm font-medium">Net Salary</th>
                <th className="text-left p-3 text-sm font-medium">Status</th>
                <th className="text-left p-3 text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id} className="border-b">
                  <td className="p-3 text-sm">{record.employee_id}</td>
                  <td className="p-3 text-sm">{formatCurrency(record.basic_salary)}</td>
                  <td className="p-3 text-sm">{formatCurrency(record.allowances)}</td>
                  <td className="p-3 text-sm">{formatCurrency(record.deductions)}</td>
                  <td className="p-3 text-sm">{formatCurrency(record.bonus)}</td>
                  <td className="p-3 text-sm">{formatCurrency(record.tax_amount)}</td>
                  <td className="p-3 text-sm font-medium">{formatCurrency(record.net_salary)}</td>
                  <td className="p-3">
                    <Badge variant={record.payment_status === "PAID" ? "default" : "secondary"}>
                      {record.payment_status}
                    </Badge>
                  </td>
                  <td className="p-3">
                    {record.payment_status !== "PAID" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMarkPaid(record.id)}
                        disabled={updatePayroll.isPending}
                      >
                        Mark Paid
                      </Button>
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
