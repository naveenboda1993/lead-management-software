"use client";

import { useMemo } from "react";
import { Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils/format";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
import type { AdSenseUnit, AdSenseStats } from "@/types";

const supabase = createClient();

function useAdSenseData() {
  const units = useQuery({
    queryKey: ["adsense-units"],
    queryFn: async () => {
      const { data } = await supabase.from("adsense_units").select("*").order("name");
      return (data ?? []) as AdSenseUnit[];
    },
  });

  const stats = useQuery({
    queryKey: ["adsense-stats"],
    queryFn: async () => {
      const { data } = await supabase.from("adsense_stats").select("*").order("date", { ascending: false });
      return (data ?? []) as AdSenseStats[];
    },
  });

  return { units, stats };
}

export default function AdSensePage() {
  const { units, stats } = useAdSenseData();

  const totals = useMemo(() => {
    const s = stats.data ?? [];
    return {
      impressions: s.reduce((a, b) => a + b.impressions, 0),
      clicks: s.reduce((a, b) => a + b.clicks, 0),
      earnings: s.reduce((a, b) => a + b.earnings, 0),
      pageViews: s.reduce((a, b) => a + b.page_views, 0),
    };
  }, [stats.data]);

  const isLoading = units.isLoading || stats.isLoading;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AdSense</h1>
        <p className="text-muted-foreground">Ad revenue and ad unit management</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Impressions</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{totals.impressions.toLocaleString()}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Clicks</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{totals.clicks.toLocaleString()}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Earnings</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{formatCurrency(totals.earnings)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Page Views</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{totals.pageViews.toLocaleString()}</p></CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-base">Ad Units</CardTitle></CardHeader>
            <CardContent>
              {!units.data || units.data.length === 0 ? (
                <p className="text-sm text-muted-foreground">No ad units configured</p>
              ) : (
                <div className="rounded-md border">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left p-2 text-xs font-medium">Name</th>
                        <th className="text-left p-2 text-xs font-medium">Type</th>
                        <th className="text-left p-2 text-xs font-medium">Size</th>
                        <th className="text-left p-2 text-xs font-medium">Status</th>
                        <th className="text-left p-2 text-xs font-medium">Earnings</th>
                      </tr>
                    </thead>
                    <tbody>
                      {units.data.map((unit) => (
                        <tr key={unit.id} className="border-b">
                          <td className="p-2 text-sm">{unit.name}</td>
                          <td className="p-2 text-sm">{unit.type}</td>
                          <td className="p-2 text-sm">{unit.size}</td>
                          <td className="p-2">
                            <Badge variant={unit.status === "ACTIVE" ? "default" : "secondary"}>
                              {unit.status}
                            </Badge>
                          </td>
                          <td className="p-2 text-sm">{formatCurrency(unit.earnings)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Recent Stats</CardTitle></CardHeader>
            <CardContent>
              {!stats.data || stats.data.length === 0 ? (
                <p className="text-sm text-muted-foreground">No stats available</p>
              ) : (
                <div className="rounded-md border">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left p-2 text-xs font-medium">Date</th>
                        <th className="text-left p-2 text-xs font-medium">Impressions</th>
                        <th className="text-left p-2 text-xs font-medium">Clicks</th>
                        <th className="text-left p-2 text-xs font-medium">Earnings</th>
                        <th className="text-left p-2 text-xs font-medium">RPM</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.data.slice(0, 20).map((s) => (
                        <tr key={s.id} className="border-b">
                          <td className="p-2 text-sm">{s.date}</td>
                          <td className="p-2 text-sm">{s.impressions.toLocaleString()}</td>
                          <td className="p-2 text-sm">{s.clicks.toLocaleString()}</td>
                          <td className="p-2 text-sm">{formatCurrency(s.earnings)}</td>
                          <td className="p-2 text-sm">{formatCurrency(s.rpm)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
