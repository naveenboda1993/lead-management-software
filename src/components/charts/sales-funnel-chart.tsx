"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Cell,
  LabelList,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LEAD_STATUS_LABELS } from "@/lib/constants";
import { LeadStatus } from "@/types";

const FUNNEL_ORDER = [
  LeadStatus.NEW,
  LeadStatus.CONTACTED,
  LeadStatus.QUALIFIED,
  LeadStatus.PROPOSAL_SENT,
  LeadStatus.NEGOTIATION,
  LeadStatus.WON,
];

interface SalesFunnelChartProps {
  data: { status: LeadStatus; count: number }[];
  loading?: boolean;
}

export function SalesFunnelChart({ data, loading }: SalesFunnelChartProps) {
  const dataMap = new Map(data.map((d) => [d.status, d.count]));

  const funnelData = FUNNEL_ORDER.map((status, index) => {
    const count = dataMap.get(status) ?? 0;
    const opacity = 1 - index * 0.1;
    return {
      name: LEAD_STATUS_LABELS[status],
      value: count,
      fill: `hsl(var(--primary) / ${opacity})`,
      opacity,
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Sales Funnel</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex h-[300px] items-center justify-center text-muted-foreground text-sm">
            Loading...
          </div>
        ) : funnelData.every((d) => d.value === 0) ? (
          <div className="flex h-[300px] items-center justify-center text-muted-foreground text-sm">
            No data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={funnelData}
              layout="vertical"
              margin={{ left: 120, right: 40, top: 10, bottom: 10 }}
            >
              <XAxis type="number" className="text-xs" />
              <YAxis
                type="category"
                dataKey="name"
                className="text-xs"
                width={110}
              />
              <Tooltip />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={40}>
                {funnelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
                <LabelList
                  dataKey="value"
                  position="right"
                  className="text-xs font-medium"
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
