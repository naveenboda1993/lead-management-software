"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send } from "lucide-react";
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
import { TICKET_STATUS_LABELS, TICKET_STATUS_COLORS, PRIORITY_LABELS, PRIORITY_COLORS } from "@/lib/constants";
import type { TicketChannel, LeadPriority } from "@/types";
import { formatRelativeTime } from "@/lib/utils/format";
import type { Ticket } from "@/types";

export default function PortalTicketsPage() {
  const router = useRouter();
  const { data: tickets, isLoading } = useTickets({});
  const createTicket = useCreateTicket();
  const [createOpen, setCreateOpen] = useState(false);
  const [formData, setFormData] = useState<{ title: string; description: string; priority: string }>({ title: "", description: "", priority: "MEDIUM" });

  const handleCreate = async () => {
    try {
      await createTicket.mutateAsync({ ...formData, channel: "WEB_PORTAL" as TicketChannel, priority: formData.priority as LeadPriority });
      toast.success("Ticket created");
      setCreateOpen(false);
      setFormData({ title: "", description: "", priority: "MEDIUM" });
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
        accessorKey: "created_at",
        header: "Created",
        cell: ({ row }) => formatRelativeTime(row.original.created_at),
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Tickets</h1>
          <p className="text-muted-foreground">View and manage your support tickets</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Send className="mr-2 h-4 w-4" />
          New Ticket
        </Button>
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
          <DialogHeader><DialogTitle>Create Support Ticket</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <Input
              placeholder="Title"
              value={formData.title}
              onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
            />
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Describe your issue..."
              value={formData.description}
              onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
            />
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
              {createTicket.isPending ? "Creating..." : "Submit Ticket"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
