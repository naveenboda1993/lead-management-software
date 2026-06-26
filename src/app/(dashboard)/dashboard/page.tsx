"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  UserPlus,
  Target,
  Trophy,
  TrendingUp,
  DollarSign,
  Loader2,
} from "lucide-react";
import { useDashboard } from "@/hooks/use-dashboard";
import { useLeads } from "@/hooks/use-leads";
import { LeadStatus, type User } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils/format";
import { KpiCard } from "@/components/charts/kpi-card";
import { LeadsBySourceChart } from "@/components/charts/leads-by-source-chart";
import { LeadsByStatusChart } from "@/components/charts/leads-by-status-chart";
import { MonthlyConversionsChart } from "@/components/charts/monthly-conversions-chart";
import { SalesFunnelChart } from "@/components/charts/sales-funnel-chart";
import { TeamPerformanceChart } from "@/components/charts/team-performance-chart";
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
import { LEAD_STATUS_LABELS, LEAD_STATUS_COLORS } from "@/lib/constants";
import { formatRelativeTime } from "@/lib/utils/format";

const supabase = createClient();

export default function DashboardPage() {
  const { data: metrics, isLoading, error } = useDashboard();
  const { data: allLeads } = useLeads();

  const newLeadsThisMonth = useMemo(() => {
    if (!allLeads) return 0;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return allLeads.filter(
      (l) => new Date(l.created_at) >= startOfMonth
    ).length;
  }, [allLeads]);

  const qualifiedLeads = useMemo(
    () =>
      allLeads?.filter((l) => l.status === LeadStatus.QUALIFIED).length ?? 0,
    [allLeads]
  );

  const wonLeads = useMemo(
    () => allLeads?.filter((l) => l.status === LeadStatus.WON).length ?? 0,
    [allLeads]
  );

  const revenueForecast = useMemo(
    () =>
      allLeads?.reduce(
        (sum, l) => sum + (l.estimated_deal_value ?? 0),
        0
      ) ?? 0,
    [allLeads]
  );

  const { data: profiles } = useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("id,name");
      return (data ?? []) as Pick<User, "id" | "name">[];
    },
  });

  const profileMap = useMemo(() => {
    const map = new Map<string, string>();
    if (profiles) {
      for (const p of profiles) {
        map.set(p.id, p.name);
      }
    }
    return map;
  }, [profiles]);

  const monthlyConversions = useMemo(() => {
    if (!allLeads) return [];
    const monthly = new Map<string, { won: number; lost: number }>();
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleString("en-US", { month: "short", year: "numeric" });
      monthly.set(key, { won: 0, lost: 0 });
    }
    for (const lead of allLeads) {
      const d = new Date(lead.created_at);
      const key = d.toLocaleString("en-US", { month: "short", year: "numeric" });
      const entry = monthly.get(key);
      if (entry) {
        if (lead.status === LeadStatus.WON) entry.won++;
        else if (lead.status === LeadStatus.LOST) entry.lost++;
      }
    }
    return Array.from(monthly.entries()).map(([month, data]) => ({
      month,
      won: data.won,
      lost: data.lost,
    }));
  }, [allLeads]);

  const teamPerformance = useMemo(() => {
    if (!allLeads) return [];
    const grouped = new Map<string, { leads: number; won: number }>();
    for (const lead of allLeads) {
      const assignee = lead.assigned_to ?? "unassigned";
      if (!grouped.has(assignee)) {
        grouped.set(assignee, { leads: 0, won: 0 });
      }
      const entry = grouped.get(assignee)!;
      entry.leads++;
      if (lead.status === LeadStatus.WON) entry.won++;
    }
    return Array.from(grouped.entries()).map(([id, data]) => ({
      name: id === "unassigned" ? "Unassigned" : (profileMap.get(id) ?? "Unknown"),
      leads: data.leads,
      won: data.won,
    }));
  }, [allLeads, profileMap]);

  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-destructive">Failed to load dashboard data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your lead management performance
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard
          icon={Users}
          label="Total Leads"
          value={metrics?.totalLeads ?? 0}
          trend={{ value: 12, positive: true }}
          subtitle="last month"
        />
        <KpiCard
          icon={UserPlus}
          label="New Leads (This Month)"
          value={newLeadsThisMonth}
          trend={{ value: 8, positive: true }}
          subtitle="last month"
        />
        <KpiCard
          icon={Target}
          label="Qualified Leads"
          value={qualifiedLeads}
        />
        <KpiCard
          icon={Trophy}
          label="Won Leads"
          value={wonLeads}
          trend={{ value: 5, positive: true }}
          subtitle="last month"
        />
        <KpiCard
          icon={TrendingUp}
          label="Conversion Rate"
          value={metrics ? `${metrics.conversionRate}%` : "0%"}
        />
        <KpiCard
          icon={DollarSign}
          label="Revenue Forecast"
          value={formatCurrency(revenueForecast)}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <LeadsBySourceChart
          data={metrics?.leadsBySource ?? []}
          loading={isLoading}
        />
        <LeadsByStatusChart
          data={metrics?.leadsByStatus ?? []}
          loading={isLoading}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <MonthlyConversionsChart
          data={monthlyConversions}
          loading={isLoading}
        />
        <SalesFunnelChart
          data={metrics?.leadsByStatus ?? []}
          loading={isLoading}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <TeamPerformanceChart
          data={teamPerformance}
          loading={isLoading}
        />
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Leads</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : !metrics?.recentLeads?.length ? (
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
                  {metrics.recentLeads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">
                        {lead.first_name} {lead.last_name}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            LEAD_STATUS_COLORS[lead.status as LeadStatus]
                          }
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
