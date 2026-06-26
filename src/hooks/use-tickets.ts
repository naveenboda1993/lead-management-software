"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Ticket, TicketMessage } from "@/types";

const supabase = createClient();

export interface TicketFilters {
  search?: string;
  status?: string[];
  priority?: string[];
  channel?: string[];
  assigned_to?: string;
  customer_id?: string;
  lead_id?: string;
  date_from?: string;
  date_to?: string;
}

async function fetchTickets(filters?: TicketFilters): Promise<Ticket[]> {
  let query = supabase.from("tickets").select("*").order("created_at", { ascending: false });

  if (filters?.search) {
    query = query.or(
      `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
    );
  }
  if (filters?.status?.length) {
    query = query.in("status", filters.status);
  }
  if (filters?.priority?.length) {
    query = query.in("priority", filters.priority);
  }
  if (filters?.channel?.length) {
    query = query.in("channel", filters.channel);
  }
  if (filters?.assigned_to) {
    query = query.eq("assigned_to", filters.assigned_to);
  }
  if (filters?.customer_id) {
    query = query.eq("customer_id", filters.customer_id);
  }
  if (filters?.lead_id) {
    query = query.eq("lead_id", filters.lead_id);
  }
  if (filters?.date_from) {
    query = query.gte("created_at", filters.date_from);
  }
  if (filters?.date_to) {
    query = query.lte("created_at", filters.date_to);
  }

  const { data } = await query;
  return (data ?? []) as Ticket[];
}

async function fetchTicket(id: string): Promise<Ticket | null> {
  const { data } = await supabase.from("tickets").select("*").eq("id", id).single();
  return data as Ticket | null;
}

async function createTicket(input: Partial<Ticket>): Promise<Ticket> {
  const { data, error } = await supabase
    .from("tickets")
    .insert([input])
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Ticket;
}

async function updateTicket({ id, ...input }: Partial<Ticket> & { id: string }): Promise<Ticket> {
  const { data, error } = await supabase
    .from("tickets")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Ticket;
}

async function deleteTicket(id: string): Promise<void> {
  const { error } = await supabase.from("tickets").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

async function fetchTicketMessages(ticketId: string): Promise<TicketMessage[]> {
  const { data } = await supabase
    .from("ticket_messages")
    .select("*")
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: true });

  return (data ?? []) as TicketMessage[];
}

async function createTicketMessage(input: Partial<TicketMessage>): Promise<TicketMessage> {
  const { data, error } = await supabase
    .from("ticket_messages")
    .insert([input])
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as TicketMessage;
}

export function useTickets(filters?: TicketFilters) {
  return useQuery({
    queryKey: ["tickets", filters],
    queryFn: () => fetchTickets(filters),
  });
}

export function useTicket(id: string | undefined) {
  return useQuery({
    queryKey: ["ticket", id],
    queryFn: () => fetchTicket(id!),
    enabled: !!id,
  });
}

export function useCreateTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });
}

export function useUpdateTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateTicket,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      queryClient.invalidateQueries({ queryKey: ["ticket", data.id] });
    },
  });
}

export function useDeleteTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });
}

export function useTicketMessages(ticketId: string | undefined) {
  return useQuery({
    queryKey: ["ticket-messages", ticketId],
    queryFn: () => fetchTicketMessages(ticketId!),
    enabled: !!ticketId,
  });
}

export function useCreateTicketMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTicketMessage,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["ticket-messages", data.ticket_id] });
    },
  });
}
