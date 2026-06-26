"use client";

import { useQuery } from "@tanstack/react-query";
import {
  DollarSign,
  Trophy,
  Frown,
  TrendingUp,
  Percent,
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
  Legend,
  LineChart,
  Line,
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
import { LEAD_STATUS_LABELS, LEAD_STATUS_COLORS } from "@/lib/constants";
import { LeadStatus } from "@/types";

interface SalesData {
  pipelineValue: number;
  wonDeals: number;
  lostDeals: number;
  avgDealSize: number;
  conversionRate: number;
  pipelineByStage: { stage: string; count: number; value: number }[];
  monthlyRevenue: { month: string; revenue: number }[];
  topPerformers: { name: string; deals: number; revenue: number }[];
  recentDeals: {
    id: string;
    first_name: string;
    last_name: string;
    status: string;
    estimated_deal_value: number;
    updated_at: string;
  }[];
}

export default function SalesDashboardPage() {
  const { data, isLoading, error } = useQuery<SalesData>({
    queryKey: ["dashboard-sales"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/sales");
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    refetchInterval: 60 * 1000,
  });

  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-destructive">Failed to load sales dashboard data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Sales Dashboard</h1>
        <p className="text-muted-foreground">
          Pipeline and deal performance overview
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard
          icon={DollarSign}
          label="Pipeline Value"
          value={formatCurrency(data?.pipelineValue ?? 0)}
        />
        <KpiCard
          icon={Trophy}
          label="Won Deals"
          value={data?.wonDeals ?? 0}
          trend={{ value: 10, positive: true }}
          subtitle="vs last month"
        />
        <KpiCard
          icon={Frown}
          label="Lost Deals"
          value={data?.lostDeals ?? 0}
        />
        <KpiCard
          icon={TrendingUp}
          label="Avg Deal Size"
          value={formatCurrency(data?.avgDealSize ?? 0)}
        />
        <KpiCard
          icon={Percent}
          label="Conversion Rate"
          value={data?.conversionRate != null ? `${data.conversionRate}%` : "0%"}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pipeline by Stage</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.pipelineByStage ?? []} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" className="text-xs" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="stage" className="text-xs" tick={{ fontSize: 11 }} width={100} />
                    <Tooltip
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      formatter={(value: any, name: any) =>
                        name === "value" ? [formatCurrency(Number(value)), "Value"] : [Number(value), "Count"]
                      }
                    />
                    <Legend />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Count" />
                    <Bar dataKey="value" fill="#22c55e" radius={[0, 4, 4, 0]} name="Value" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data?.monthlyRevenue ?? []}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" tick={{ fontSize: 11 }} />
                    <YAxis className="text-xs" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                    <Tooltip
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      formatter={(value: any) => [formatCurrency(Number(value)), "Revenue"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Performers</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.topPerformers ?? []} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" className="text-xs" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" className="text-xs" tick={{ fontSize: 11 }} width={120} />
                    <Tooltip
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      formatter={(value: any, name: any) =>
                        name === "revenue" ? [formatCurrency(Number(value)), "Revenue"] : [Number(value), "Deals"]
                      }
                    />
                    <Legend />
                    <Bar dataKey="deals" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Deals" />
                    <Bar dataKey="revenue" fill="#22c55e" radius={[0, 4, 4, 0]} name="Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Deals</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : !data?.recentDeals?.length ? (
              <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                No recent deals
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recentDeals.map((deal) => (
                    <TableRow key={deal.id}>
                      <TableCell className="font-medium">
                        {deal.first_name} {deal.last_name}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={LEAD_STATUS_COLORS[deal.status as LeadStatus]}
                          variant="outline"
                        >
                          {LEAD_STATUS_LABELS[deal.status as LeadStatus]}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(deal.estimated_deal_value ?? 0)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatRelativeTime(deal.updated_at)}
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
