"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { useTickets, useCreateTicket } from "@/hooks/use-tickets";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";
import {
  TICKET_STATUS_LABELS,
  TICKET_STATUS_COLORS,
  TICKET_CHANNEL_LABELS,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
} from "@/lib/constants";
import { formatDate, formatRelativeTime } from "@/lib/utils/format";
import type { Ticket } from "@/types";
import type { TicketFilters } from "@/hooks/use-tickets";
import type { TicketChannel } from "@/types";

export default function TicketsPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<TicketFilters>({});
  const { data: tickets, isLoading, error } = useTickets(filters);
  const createTicket = useCreateTicket();
  const [createOpen, setCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    channel: "WEB_PORTAL",
    priority: "MEDIUM",
  });

  const handleCreate = async () => {
    try {
      await createTicket.mutateAsync(formData as any);
      toast.success("Ticket created");
      setCreateOpen(false);
      setFormData({ title: "", description: "", channel: "WEB_PORTAL", priority: "MEDIUM" });
    } catch {
      toast.error("Failed to create ticket");
    }
  };

  const handleRowClick = useCallback(
    (ticket: Ticket) => {
      router.push(`/tickets/${ticket.id}`);
    },
    [router]
  );

  const columns = useMemo<ColumnDef<Ticket>[]>(
    () => [
      {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => <span className="font-medium">{row.original.title}</span>,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge className={TICKET_STATUS_COLORS[row.original.status]} variant="outline">
            {TICKET_STATUS_LABELS[row.original.status]}
          </Badge>
        ),
      },
      {
        accessorKey: "priority",
        header: "Priority",
        cell: ({ row }) => (
          <Badge className={PRIORITY_COLORS[row.original.priority]} variant="outline">
            {PRIORITY_LABELS[row.original.priority]}
          </Badge>
        ),
      },
      {
        accessorKey: "channel",
        header: "Channel",
        cell: ({ row }) => TICKET_CHANNEL_LABELS[row.original.channel],
      },
      {
        id: "assigned_to",
        header: "Assigned To",
        cell: ({ row }) => row.original.assigned_to ?? <span className="text-muted-foreground">Unassigned</span>,
      },
      {
        accessorKey: "created_at",
        header: "Created",
        cell: ({ row }) => (
          <span title={formatDate(row.original.created_at)}>
            {formatRelativeTime(row.original.created_at)}
          </span>
        ),
      },
    ],
    []
  );

  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-destructive">Failed to load tickets</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tickets</h1>
          <p className="text-muted-foreground">Manage support tickets</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Ticket
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select
          value={filters.status?.[0] ?? ""}
          onValueChange={(v) => setFilters((p) => ({ ...p, status: v ? [v] : undefined }))}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=" ">All</SelectItem>
            {Object.entries(TICKET_STATUS_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.priority?.[0] ?? ""}
          onValueChange={(v) => setFilters((p) => ({ ...p, priority: v ? [v] : undefined }))}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=" ">All</SelectItem>
            {Object.entries(PRIORITY_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.channel?.[0] ?? ""}
          onValueChange={(v) => setFilters((p) => ({ ...p, channel: v ? [v] : undefined }))}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Channel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=" ">All</SelectItem>
            {Object.entries(TICKET_CHANNEL_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          placeholder="Assigned to..."
          className="w-[150px]"
          value={filters.assigned_to ?? ""}
          onChange={(e) => setFilters((p) => ({ ...p, assigned_to: e.target.value || undefined }))}
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={tickets ?? []}
          searchKey="title"
          onRowClick={handleRowClick}
        />
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Ticket</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <Input
              placeholder="Title"
              value={formData.title}
              onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
            />
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
            />
            <Select
              value={formData.channel}
              onValueChange={(v) => setFormData((p) => ({ ...p, channel: v }))}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(TICKET_CHANNEL_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={formData.priority}
              onValueChange={(v) => setFormData((p) => ({ ...p, priority: v }))}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(PRIORITY_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleCreate} disabled={createTicket.isPending}>
              {createTicket.isPending ? "Creating..." : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
