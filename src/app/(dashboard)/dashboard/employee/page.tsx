"use client";

import { useQuery } from "@tanstack/react-query";
import {
  CheckSquare,
  Clock,
  CalendarDays,
  Loader2,
} from "lucide-react";
import { KpiCard } from "@/components/charts/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/utils/format";
import {
  TASK_STATUS_LABELS,
  TASK_STATUS_COLORS,
  TASK_TYPE_LABELS,
  LEAD_STATUS_LABELS,
  LEAD_STATUS_COLORS,
  LEAD_SOURCE_LABELS,
} from "@/lib/constants";
import { TaskStatus, LeadStatus, LeadSource } from "@/types";

interface EmployeeData {
  pendingTasks: number;
  completedTasks: number;
  attendanceThisMonth: number;
  upcomingLeaves: number;
  todaysTasks: {
    id: string;
    title: string;
    task_type: string;
    status: string;
    due_date: string;
    lead_id?: string | null;
  }[];
  recentLeadsAssigned: {
    id: string;
    first_name: string;
    last_name: string;
    status: string;
    lead_source: string;
    created_at: string;
  }[];
}

export default function EmployeeDashboardPage() {
  const { data, isLoading, error } = useQuery<EmployeeData>({
    queryKey: ["dashboard-employee"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/employee");
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    refetchInterval: 60 * 1000,
  });

  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-destructive">Failed to load employee dashboard data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Dashboard</h1>
        <p className="text-muted-foreground">
          Your personal performance overview
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={CheckSquare}
          label="Pending Tasks"
          value={data?.pendingTasks ?? 0}
        />
        <KpiCard
          icon={Clock}
          label="Completed Tasks"
          value={data?.completedTasks ?? 0}
        />
        <KpiCard
          icon={CalendarDays}
          label="Attendance (This Month)"
          value={data?.attendanceThisMonth ?? 0}
        />
        <KpiCard
          icon={CalendarDays}
          label="Upcoming Leaves"
          value={data?.upcomingLeaves ?? 0}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Today&apos;s Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : !data?.todaysTasks?.length ? (
              <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                No tasks for today
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.todaysTasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">{task.title}</TableCell>
                      <TableCell>
                        {TASK_TYPE_LABELS[task.task_type as keyof typeof TASK_TYPE_LABELS] ?? task.task_type}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={TASK_STATUS_COLORS[task.status as TaskStatus]}
                          variant="outline"
                        >
                          {TASK_STATUS_LABELS[task.status as TaskStatus]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {task.due_date ? formatRelativeTime(task.due_date) : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Leads Assigned</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : !data?.recentLeadsAssigned?.length ? (
              <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                No leads assigned
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recentLeadsAssigned.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">
                        {lead.first_name} {lead.last_name}
                      </TableCell>
                      <TableCell>
                        {LEAD_SOURCE_LABELS[lead.lead_source as LeadSource] ?? lead.lead_source}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={LEAD_STATUS_COLORS[lead.status as LeadStatus]}
                          variant="outline"
                        >
                          {LEAD_STATUS_LABELS[lead.status as LeadStatus]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatRelativeTime(lead.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
