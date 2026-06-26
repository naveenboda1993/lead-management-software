"use client";

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TeamMemberData {
  name: string;
  leads: number;
  won: number;
}

interface TeamPerformanceChartProps {
  data: TeamMemberData[];
  loading?: boolean;
}

export function TeamPerformanceChart({ data, loading }: TeamPerformanceChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Team Performance</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex h-[300px] items-center justify-center text-muted-foreground text-sm">
            Loading...
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center text-muted-foreground text-sm">
            No data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="name" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="leads"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
                name="Total Leads"
              />
              <Bar
                dataKey="won"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
                name="Won"
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
