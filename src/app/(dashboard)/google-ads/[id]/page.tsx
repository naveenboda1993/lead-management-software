"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/format";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
import type { GoogleAdCampaign, GoogleAdGroup, GoogleAdKeyword } from "@/types";

const supabase = createClient();

function useGoogleAdCampaignDetail(id: string) {
  return useQuery({
    queryKey: ["google-ad-campaign", id],
    queryFn: async () => {
      const { data: campaign } = await supabase
        .from("google_ad_campaigns")
        .select("*")
        .eq("id", id)
        .single();
      if (!campaign) return null;

      const { data: adGroups } = await supabase
        .from("google_ad_groups")
        .select("*")
        .eq("campaign_id", campaign.campaign_id);

      const groupIds = (adGroups ?? []).map((g: GoogleAdGroup) => g.ad_group_id);
      const { data: keywords } = groupIds.length > 0
        ? await supabase.from("google_ad_keywords").select("*").in("ad_group_id", groupIds)
        : { data: [] };

      return { campaign: campaign as GoogleAdCampaign, adGroups: (adGroups ?? []) as GoogleAdGroup[], keywords: (keywords ?? []) as GoogleAdKeyword[] };
    },
    enabled: !!id,
  });
}

export default function GoogleAdCampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data, isLoading, error } = useGoogleAdCampaignDetail(id);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-3">
        <p className="text-destructive">Campaign not found</p>
        <Button variant="outline" onClick={() => router.push("/google-ads")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>
    );
  }

  const { campaign, adGroups, keywords } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push("/google-ads")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold">{campaign.name}</h1>
            <Badge variant="outline">{campaign.status}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">Budget: {formatCurrency(campaign.budget)}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Impressions</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{campaign.impressions.toLocaleString()}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Clicks</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{campaign.clicks.toLocaleString()}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Spend</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{formatCurrency(campaign.spend)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Conversions</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{campaign.conversions}</p></CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">CTR</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{(campaign.ctr * 100).toFixed(2)}%</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">CPC</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{formatCurrency(campaign.cpc)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">CPA</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{formatCurrency(campaign.cost_per_conversion)}</p></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Ad Groups ({adGroups.length})</CardTitle></CardHeader>
        <CardContent>
          {adGroups.length === 0 ? (
            <p className="text-sm text-muted-foreground">No ad groups</p>
          ) : (
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-2 text-xs font-medium">Name</th>
                    <th className="text-left p-2 text-xs font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {adGroups.map((g) => (
                    <tr key={g.id} className="border-b">
                      <td className="p-2 text-sm">{g.name}</td>
                      <td className="p-2"><Badge variant="outline">{g.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Keywords ({keywords.length})</CardTitle></CardHeader>
        <CardContent>
          {keywords.length === 0 ? (
            <p className="text-sm text-muted-foreground">No keywords</p>
          ) : (
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-2 text-xs font-medium">Keyword</th>
                    <th className="text-left p-2 text-xs font-medium">Match</th>
                    <th className="text-left p-2 text-xs font-medium">Impressions</th>
                    <th className="text-left p-2 text-xs font-medium">Clicks</th>
                    <th className="text-left p-2 text-xs font-medium">Conversions</th>
                    <th className="text-left p-2 text-xs font-medium">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {keywords.map((k) => (
                    <tr key={k.id} className="border-b">
                      <td className="p-2 text-sm">{k.keyword}</td>
                      <td className="p-2 text-sm">{k.match_type}</td>
                      <td className="p-2 text-sm">{k.impressions.toLocaleString()}</td>
                      <td className="p-2 text-sm">{k.clicks.toLocaleString()}</td>
                      <td className="p-2 text-sm">{k.conversions}</td>
                      <td className="p-2 text-sm">{formatCurrency(k.cost)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
