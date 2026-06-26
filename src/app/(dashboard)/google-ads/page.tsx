"use client";

import { useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import type { GoogleAdCampaign } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

const supabase = createClient();

function useGoogleAdCampaigns() {
  return useQuery({
    queryKey: ["google-ad-campaigns"],
    queryFn: async () => {
      const { data } = await supabase.from("google_ad_campaigns").select("*").order("created_at", { ascending: false });
      return (data ?? []) as GoogleAdCampaign[];
    },
  });
}

export default function GoogleAdsPage() {
  const router = useRouter();
  const { data: campaigns, isLoading } = useGoogleAdCampaigns();

  const totals = useMemo(() => {
    if (!campaigns) return { impressions: 0, clicks: 0, spend: 0, conversions: 0 };
    return {
      impressions: campaigns.reduce((s, c) => s + c.impressions, 0),
      clicks: campaigns.reduce((s, c) => s + c.clicks, 0),
      spend: campaigns.reduce((s, c) => s + c.spend, 0),
      conversions: campaigns.reduce((s, c) => s + c.conversions, 0),
    };
  }, [campaigns]);

  const handleRowClick = useCallback(
    (campaign: GoogleAdCampaign) => {
      router.push(`/google-ads/${campaign.id}`);
    },
    [router]
  );

  const columns = useMemo<ColumnDef<GoogleAdCampaign>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Campaign",
        cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <Badge variant="outline">{row.original.status}</Badge>,
      },
      {
        accessorKey: "impressions",
        header: "Impressions",
      },
      {
        accessorKey: "clicks",
        header: "Clicks",
      },
      {
        accessorKey: "ctr",
        header: "CTR",
        cell: ({ row }) => `${(row.original.ctr * 100).toFixed(2)}%`,
      },
      {
        accessorKey: "cpc",
        header: "CPC",
        cell: ({ row }) => formatCurrency(row.original.cpc),
      },
      {
        accessorKey: "spend",
        header: "Spend",
        cell: ({ row }) => formatCurrency(row.original.spend),
      },
      {
        accessorKey: "conversions",
        header: "Conversions",
      },
      {
        accessorKey: "cost_per_conversion",
        header: "CPA",
        cell: ({ row }) => formatCurrency(row.original.cost_per_conversion),
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Google Ads</h1>
        <p className="text-muted-foreground">Manage your Google Ads campaigns</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Impressions</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{totals.impressions.toLocaleString()}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Clicks</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{totals.clicks.toLocaleString()}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Spend</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{formatCurrency(totals.spend)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Conversions</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{totals.conversions.toLocaleString()}</p></CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={campaigns ?? []}
          searchKey="name"
          onRowClick={handleRowClick}
        />
      )}
    </div>
  );
}
