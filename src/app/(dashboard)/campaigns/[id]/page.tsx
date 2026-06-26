"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useCampaign } from "@/hooks/use-campaigns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CAMPAIGN_TYPE_LABELS, CAMPAIGN_STATUS_LABELS, CAMPAIGN_STATUS_COLORS } from "@/lib/constants";
import { formatDate } from "@/lib/utils/format";

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;
  const { data: campaign, isLoading, error } = useCampaign(campaignId);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-3">
        <p className="text-destructive">Campaign not found</p>
        <Button variant="outline" onClick={() => router.push("/campaigns")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>
    );
  }

  const total = campaign.sent_count || 1;
  const openRate = ((campaign.opened_count / total) * 100).toFixed(1);
  const clickRate = ((campaign.clicked_count / total) * 100).toFixed(1);
  const convertRate = ((campaign.converted_count / total) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push("/campaigns")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">{campaign.name}</h1>
            <Badge className={CAMPAIGN_STATUS_COLORS[campaign.status]} variant="outline">
              {CAMPAIGN_STATUS_LABELS[campaign.status]}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {CAMPAIGN_TYPE_LABELS[campaign.type]} · Created {formatDate(campaign.created_at)}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Sent</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{campaign.sent_count.toLocaleString()}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Opened</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{campaign.opened_count.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">{openRate}% open rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Clicked</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{campaign.clicked_count.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">{clickRate}% click rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Converted</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{campaign.converted_count.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">{convertRate}% conversion rate</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Campaign Details</CardTitle></CardHeader>
          <CardContent>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type</span>
                <span>{CAMPAIGN_TYPE_LABELS[campaign.type]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge className={CAMPAIGN_STATUS_COLORS[campaign.status]} variant="outline">
                  {CAMPAIGN_STATUS_LABELS[campaign.status]}
                </Badge>
              </div>
              {campaign.subject && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subject</span>
                  <span>{campaign.subject}</span>
                </div>
              )}
              {campaign.scheduled_at && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Scheduled</span>
                  <span>{formatDate(campaign.scheduled_at)}</span>
                </div>
              )}
              {campaign.sent_at && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sent At</span>
                  <span>{formatDate(campaign.sent_at)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span>{formatDate(campaign.created_at)}</span>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Content</CardTitle></CardHeader>
          <CardContent>
            <div className="rounded-md bg-muted p-4">
              <p className="text-sm whitespace-pre-wrap">{campaign.content}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Recipients ({campaign.recipient_list.length})</CardTitle></CardHeader>
        <CardContent>
          {campaign.recipient_list.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recipients</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {campaign.recipient_list.map((r, i) => (
                <Badge key={i} variant="secondary">{r}</Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
