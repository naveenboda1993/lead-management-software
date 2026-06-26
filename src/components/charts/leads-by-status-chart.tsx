"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LEAD_STATUS_LABELS } from "@/lib/constants";
import type { LeadStatus } from "@/types";

interface LeadsByStatusChartProps {
  data: { status: LeadStatus; count: number }[];
  loading?: boolean;
}

export function LeadsByStatusChart({ data, loading }: LeadsByStatusChartProps) {
  const chartData = data.map((d) => ({
    name: LEAD_STATUS_LABELS[d.status] ?? d.status,
    count: d.count,
    fill:
      d.status === "WON"
        ? "#10b981"
        : d.status === "LOST"
          ? "#ef4444"
          : "#3b82f6",
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Leads by Status</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex h-[300px] items-center justify-center text-muted-foreground text-sm">
            Loading...
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center text-muted-foreground text-sm">
            No data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="name" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
