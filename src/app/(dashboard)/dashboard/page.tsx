"use client";

import { useMemo } from "react";
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
import { LeadStatus } from "@/types";
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
          data={[]}
          loading={isLoading}
        />
        <SalesFunnelChart
          data={metrics?.leadsByStatus ?? []}
          loading={isLoading}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <TeamPerformanceChart
          data={[]}
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
