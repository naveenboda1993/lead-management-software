"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Megaphone,
  PlayCircle,
  DollarSign,
  Target,
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
import { formatCurrency } from "@/lib/utils/format";
import {
  CAMPAIGN_STATUS_LABELS,
  CAMPAIGN_STATUS_COLORS,
} from "@/lib/constants";

interface CampaignPerf {
  name: string;
  sent: number;
  opened: number;
  clicked: number;
  converted: number;
}

interface AdPerf {
  campaign: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
}

interface DailyAdsense {
  date: string;
  earnings: number;
  impressions: number;
}

interface MarketingData {
  totalCampaigns: number;
  activeCampaigns: number;
  totalSpend: number;
  totalConversions: number;
  costPerConversion: number;
  googleAdsCpc: number;
  facebookCtr: number;
  adsenseEarnings: number;
  campaignPerformance: CampaignPerf[];
  adPerformance: AdPerf[];
  dailyAdsenseStats: DailyAdsense[];
}

export default function MarketingDashboardPage() {
  const { data, isLoading, error } = useQuery<MarketingData>({
    queryKey: ["dashboard-marketing"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/marketing");
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    refetchInterval: 60 * 1000,
  });

  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-destructive">Failed to load marketing dashboard data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Marketing Dashboard</h1>
        <p className="text-muted-foreground">
          Campaign and ad performance overview
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={Megaphone}
          label="Total Campaigns"
          value={data?.totalCampaigns ?? 0}
        />
        <KpiCard
          icon={PlayCircle}
          label="Active Campaigns"
          value={data?.activeCampaigns ?? 0}
        />
        <KpiCard
          icon={DollarSign}
          label="Total Spend"
          value={formatCurrency(data?.totalSpend ?? 0)}
        />
        <KpiCard
          icon={Target}
          label="Cost per Conversion"
          value={data?.costPerConversion != null ? formatCurrency(data.costPerConversion) : "$0"}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Campaign Performance</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.campaignPerformance ?? []}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" tick={{ fontSize: 10 }} />
                    <YAxis className="text-xs" tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="sent" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Sent" />
                    <Bar dataKey="opened" fill="#22c55e" radius={[4, 4, 0, 0]} name="Opened" />
                    <Bar dataKey="clicked" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Clicked" />
                    <Bar dataKey="converted" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Converted" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Google Ads CPC &amp; Facebook CTR</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6">
                <div className="flex flex-col items-center gap-2 rounded-lg border p-6">
                  <DollarSign className="h-8 w-8 text-primary" />
                  <span className="text-3xl font-bold">
                    ${data?.googleAdsCpc?.toFixed(2) ?? "0.00"}
                  </span>
                  <span className="text-sm text-muted-foreground">Google Ads CPC</span>
                </div>
                <div className="flex flex-col items-center gap-2 rounded-lg border p-6">
                  <Target className="h-8 w-8 text-emerald-500" />
                  <span className="text-3xl font-bold">
                    {data?.facebookCtr?.toFixed(1) ?? "0.0"}%
                  </span>
                  <span className="text-sm text-muted-foreground">Facebook CTR</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ad Performance</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.adPerformance ?? []}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="campaign" className="text-xs" tick={{ fontSize: 10 }} />
                    <YAxis className="text-xs" tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="impressions" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Impressions" />
                    <Bar dataKey="clicks" fill="#22c55e" radius={[4, 4, 0, 0]} name="Clicks" />
                    <Bar dataKey="conversions" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Conversions" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">AdSense Earnings (30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.dailyAdsenseStats ?? []}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" tick={{ fontSize: 9 }} />
                    <YAxis className="text-xs" tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="earnings" fill="#22c55e" radius={[4, 4, 0, 0]} name="Earnings" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Campaign List</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : !data?.campaignPerformance?.length ? (
            <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
              No campaigns found
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
                {(data.campaignPerformance ?? []).map((camp, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{camp.name}</TableCell>
                    <TableCell className="text-right">{camp.sent}</TableCell>
                    <TableCell className="text-right">{camp.opened}</TableCell>
                    <TableCell className="text-right">{camp.clicked}</TableCell>
                    <TableCell className="text-right">{camp.converted}</TableCell>
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
