"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import { useTicket, useUpdateTicket, useTicketMessages, useCreateTicketMessage } from "@/hooks/use-tickets";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/components/ui/toast";
import {
  TICKET_STATUS_LABELS,
  TICKET_STATUS_COLORS,
  TICKET_CHANNEL_LABELS,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
} from "@/lib/constants";
import { formatDate, formatRelativeTime } from "@/lib/utils/format";

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.id as string;

  const { data: ticket, isLoading, error } = useTicket(ticketId);
  const updateTicket = useUpdateTicket();
  const { data: messages, isLoading: messagesLoading } = useTicketMessages(ticketId);
  const createMessage = useCreateTicketMessage();

  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      await createMessage.mutateAsync({
        ticket_id: ticketId,
        message: newMessage,
        sender_type: "AGENT",
        attachments: [],
      });
      setNewMessage("");
      toast.success("Message sent");
    } catch {
      toast.error("Failed to send message");
    }
  };

  const handleStatusChange = async (status: string) => {
    try {
      await updateTicket.mutateAsync({ id: ticketId, status: status as any });
      toast.success(`Status updated to ${TICKET_STATUS_LABELS[status as keyof typeof TICKET_STATUS_LABELS]}`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-3">
        <p className="text-destructive">Ticket not found</p>
        <Button variant="outline" onClick={() => router.push("/tickets")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Tickets
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push("/tickets")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold">{ticket.title}</h1>
            <Badge className={TICKET_STATUS_COLORS[ticket.status]} variant="outline">
              {TICKET_STATUS_LABELS[ticket.status]}
            </Badge>
            <Badge className={PRIORITY_COLORS[ticket.priority]} variant="outline">
              {PRIORITY_LABELS[ticket.priority]}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {TICKET_CHANNEL_LABELS[ticket.channel]} · Created {formatRelativeTime(ticket.created_at)}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Conversation</CardTitle></CardHeader>
            <CardContent>
              {messagesLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : !messages || messages.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No messages yet</p>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender_type === "AGENT" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-lg px-4 py-2 ${
                          msg.sender_type === "AGENT"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                        <p className={`text-xs mt-1 ${
                          msg.sender_type === "AGENT" ? "text-primary-foreground/70" : "text-muted-foreground"
                        }`}>
                          {formatRelativeTime(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Input
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <Button onClick={handleSendMessage} disabled={createMessage.isPending || !newMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div>
                <dt className="text-xs font-medium text-muted-foreground">Description</dt>
                <dd className="text-sm mt-1">{ticket.description}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-muted-foreground">Channel</dt>
                <dd className="text-sm">{TICKET_CHANNEL_LABELS[ticket.channel]}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-muted-foreground">Assigned To</dt>
                <dd className="text-sm">{ticket.assigned_to ?? "Unassigned"}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-muted-foreground">Created</dt>
                <dd className="text-sm">{formatDate(ticket.created_at)}</dd>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Update Status</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {Object.entries(TICKET_STATUS_LABELS).map(([key, label]) => (
                <Button
                  key={key}
                  variant={ticket.status === key ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleStatusChange(key)}
                  disabled={updateTicket.isPending}
                >
                  {label}
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
