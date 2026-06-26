"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { useCampaigns } from "@/hooks/use-campaigns";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CAMPAIGN_TYPE_LABELS, CAMPAIGN_STATUS_LABELS, CAMPAIGN_STATUS_COLORS } from "@/lib/constants";
import { formatDate } from "@/lib/utils/format";
import type { Campaign } from "@/types";
import type { CampaignFilters } from "@/hooks/use-campaigns";

export default function CampaignsPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<CampaignFilters>({});
  const { data: campaigns, isLoading, error } = useCampaigns(filters);

  const handleRowClick = useCallback(
    (campaign: Campaign) => {
      router.push(`/campaigns/${campaign.id}`);
    },
    [router]
  );

  const columns = useMemo<ColumnDef<Campaign>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => CAMPAIGN_TYPE_LABELS[row.original.type],
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge className={CAMPAIGN_STATUS_COLORS[row.original.status]} variant="outline">
            {CAMPAIGN_STATUS_LABELS[row.original.status]}
          </Badge>
        ),
      },
      {
        accessorKey: "sent_count",
        header: "Sent",
      },
      {
        accessorKey: "opened_count",
        header: "Opened",
      },
      {
        accessorKey: "clicked_count",
        header: "Clicked",
      },
      {
        accessorKey: "converted_count",
        header: "Converted",
      },
      {
        accessorKey: "created_at",
        header: "Created",
        cell: ({ row }) => formatDate(row.original.created_at),
      },
    ],
    []
  );

  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-destructive">Failed to load campaigns</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Campaigns</h1>
          <p className="text-muted-foreground">Marketing automation campaigns</p>
        </div>
        <Button onClick={() => router.push("/campaigns/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Create Campaign
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select
          value={filters.type?.[0] ?? ""}
          onValueChange={(v) => setFilters((p) => ({ ...p, type: v ? [v] : undefined }))}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=" ">All</SelectItem>
            {Object.entries(CAMPAIGN_TYPE_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.status?.[0] ?? ""}
          onValueChange={(v) => setFilters((p) => ({ ...p, status: v ? [v] : undefined }))}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=" ">All</SelectItem>
            {Object.entries(CAMPAIGN_STATUS_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
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
