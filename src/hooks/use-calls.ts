"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { CallLog, VirtualNumber } from "@/types";

const supabase = createClient();

async function getOrgId() {
  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", (await supabase.auth.getUser()).data.user?.id)
    .single();
  return profile?.organization_id;
}

export interface CallLogFilters {
  search?: string;
  direction?: string[];
  status?: string[];
  agent_id?: string;
  lead_id?: string;
  date_from?: string;
  date_to?: string;
}

async function fetchCallLogs(filters?: CallLogFilters): Promise<CallLog[]> {
  let query = supabase.from("call_logs").select("*").order("created_at", { ascending: false });

  if (filters?.search) {
    query = query.or(
      `from_number.ilike.%${filters.search}%,to_number.ilike.%${filters.search}%,notes.ilike.%${filters.search}%`
    );
  }
  if (filters?.direction?.length) {
    query = query.in("direction", filters.direction);
  }
  if (filters?.status?.length) {
    query = query.in("status", filters.status);
  }
  if (filters?.agent_id) {
    query = query.eq("agent_id", filters.agent_id);
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
  return (data ?? []) as CallLog[];
}

async function fetchCallLog(id: string): Promise<CallLog | null> {
  const { data } = await supabase.from("call_logs").select("*").eq("id", id).single();
  return data as CallLog | null;
}

async function createCallLog(input: Partial<CallLog>): Promise<CallLog> {
  const { data, error } = await supabase
    .from("call_logs")
    .insert([{ ...input, organization_id: await getOrgId() }])
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as CallLog;
}

async function fetchVirtualNumbers(): Promise<VirtualNumber[]> {
  const { data } = await supabase.from("virtual_numbers").select("*").order("number", { ascending: true });
  return (data ?? []) as VirtualNumber[];
}

async function createVirtualNumber(input: Partial<VirtualNumber>): Promise<VirtualNumber> {
  const { data, error } = await supabase
    .from("virtual_numbers")
    .insert([{ ...input, organization_id: await getOrgId() }])
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as VirtualNumber;
}

export function useCallLogs(filters?: CallLogFilters) {
  return useQuery({
    queryKey: ["call-logs", filters],
    queryFn: () => fetchCallLogs(filters),
  });
}

export function useCallLog(id: string | undefined) {
  return useQuery({
    queryKey: ["call-log", id],
    queryFn: () => fetchCallLog(id!),
    enabled: !!id,
  });
}

export function useCreateCallLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCallLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["call-logs"] });
    },
  });
}

export function useVirtualNumbers() {
  return useQuery({
    queryKey: ["virtual-numbers"],
    queryFn: fetchVirtualNumbers,
  });
}

export function useCreateVirtualNumber() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createVirtualNumber,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["virtual-numbers"] });
    },
  });
}
