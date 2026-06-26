"use client";

import { useQuery } from "@tanstack/react-query";
import {
  DollarSign,
  Users,
  UserCheck,
  TrendingDown,
  Loader2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
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
import { formatCurrency, formatRelativeTime } from "@/lib/utils/format";
import { LEAD_STATUS_LABELS, LEAD_STATUS_COLORS, LEAD_SOURCE_LABELS } from "@/lib/constants";
import { LeadStatus } from "@/types";

const PIE_COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"];

interface EmployerData {
  totalRevenue: number;
  totalLeads: number;
  totalEmployees: number;
  marketingSpend: number;
  leadsBySource: { source: string; count: number }[];
  revenueByMonth: { month: string; revenue: number }[];
  employeePerformance: { name: string; leads: number; conversions: number }[];
  activeCampaigns: number;
  propertiesListed: number;
  ordersPending: number;
  recentLeads: { id: string; first_name: string; last_name: string; email: string; status: string; created_at: string }[];
  activeCampaignsList: { id: string; name: string; sent_count: number; opened_count: number; clicked_count: number; converted_count: number }[];
}

export default function EmployerDashboardPage() {
  const { data, isLoading, error } = useQuery<EmployerData>({
    queryKey: ["dashboard-employer"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/employer");
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    refetchInterval: 60 * 1000,
  });

  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-destructive">Failed to load employer dashboard data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Employer Dashboard</h1>
        <p className="text-muted-foreground">
          High-level overview of your business performance
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={DollarSign}
          label="Total Revenue"
          value={formatCurrency(data?.totalRevenue ?? 0)}
          trend={{ value: 8, positive: true }}
          subtitle="vs last month"
        />
        <KpiCard
          icon={Users}
          label="Total Leads"
          value={data?.totalLeads ?? 0}
          trend={{ value: 12, positive: true }}
          subtitle="vs last month"
        />
        <KpiCard
          icon={UserCheck}
          label="Total Employees"
          value={data?.totalEmployees ?? 0}
        />
        <KpiCard
          icon={TrendingDown}
          label="Marketing Spend"
          value={formatCurrency(data?.marketingSpend ?? 0)}
          subtitle="this month"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue by Month</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.revenueByMonth ?? []}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" tick={{ fontSize: 11 }} />
                    <YAxis className="text-xs" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                    <Tooltip
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      formatter={(value: any) => [formatCurrency(Number(value)), "Revenue"]}
                    />
                    <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Leads by Source</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data?.leadsBySource ?? []}
                      dataKey="count"
                      nameKey="source"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      label={({ source, count }: any) => `${LEAD_SOURCE_LABELS[source as keyof typeof LEAD_SOURCE_LABELS] ?? source} (${count})`}
                    >
                      {(data?.leadsBySource ?? []).map((_, index) => (
                        <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Employee Performance</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.employeePerformance ?? []} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" className="text-xs" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" className="text-xs" tick={{ fontSize: 11 }} width={120} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="leads" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Leads" />
                    <Bar dataKey="conversions" fill="#22c55e" radius={[0, 4, 4, 0]} name="Conversions" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Leads</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : !data?.recentLeads?.length ? (
              <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                No recent leads
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recentLeads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">
                        {lead.first_name} {lead.last_name}
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

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Active Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : !data?.activeCampaignsList?.length ? (
            <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
              No active campaigns
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Sent</TableHead>
                  <TableHead className="text-right">Opened</TableHead>
                  <TableHead className="text-right">Clicked</TableHead>
                  <TableHead className="text-right">Converted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.activeCampaignsList.map((camp) => (
                  <TableRow key={camp.id}>
                    <TableCell className="font-medium">{camp.name}</TableCell>
                    <TableCell className="text-right">{camp.sent_count}</TableCell>
                    <TableCell className="text-right">{camp.opened_count}</TableCell>
                    <TableCell className="text-right">{camp.clicked_count}</TableCell>
                    <TableCell className="text-right">{camp.converted_count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
