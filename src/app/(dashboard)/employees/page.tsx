"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { useEmployees } from "@/hooks/use-employees";
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
import { ROLES } from "@/lib/constants";
import { formatDate } from "@/lib/utils/format";
import type { User } from "@/types";
import type { EmployeeFilters } from "@/hooks/use-employees";

export default function EmployeesPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<EmployeeFilters>({});
  const { data: employees, isLoading, error } = useEmployees(filters);

  const handleRowClick = useCallback(
    (employee: User) => {
      router.push(`/employees/${employee.id}`);
    },
    [router]
  );

  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        id: "name",
        header: "Name",
        cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
      },
      {
        accessorKey: "email",
        header: "Email",
      },
      {
        accessorKey: "employee_id",
        header: "Employee ID",
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => <Badge variant="outline">{ROLES[row.original.role]}</Badge>,
      },
      {
        accessorKey: "department",
        header: "Department",
        cell: ({ row }) => row.original.department ?? "-",
      },
      {
        accessorKey: "designation",
        header: "Designation",
        cell: ({ row }) => row.original.designation ?? "-",
      },
      {
        accessorKey: "date_of_joining",
        header: "Joined",
        cell: ({ row }) => row.original.date_of_joining ? formatDate(row.original.date_of_joining) : "-",
      },
    ],
    []
  );

  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-destructive">Failed to load employees</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Employees</h1>
        <p className="text-muted-foreground">Manage your organization employees</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search..."
          className="w-[200px]"
          value={filters.search ?? ""}
          onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value || undefined }))}
        />
        <Select
          value={filters.department ?? ""}
          onValueChange={(v) => setFilters((p) => ({ ...p, department: v || undefined }))}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=" ">All</SelectItem>
            <SelectItem value="Sales">Sales</SelectItem>
            <SelectItem value="Marketing">Marketing</SelectItem>
            <SelectItem value="HR">HR</SelectItem>
            <SelectItem value="Finance">Finance</SelectItem>
            <SelectItem value="Engineering">Engineering</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={employees ?? []}
          searchKey="name"
          onRowClick={handleRowClick}
        />
      )}
    </div>
  );
}
