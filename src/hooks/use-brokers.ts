"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Broker } from "@/types";

const supabase = createClient();

export interface BrokerFilters {
  search?: string;
}

async function fetchBrokers(filters?: BrokerFilters): Promise<Broker[]> {
  let query = supabase.from("brokers").select("*").order("name", { ascending: true });

  if (filters?.search) {
    query = query.or(
      `name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,company.ilike.%${filters.search}%`
    );
  }

  const { data } = await query;
  return (data ?? []) as Broker[];
}

async function fetchBroker(id: string): Promise<Broker | null> {
  const { data } = await supabase.from("brokers").select("*").eq("id", id).single();
  return data as Broker | null;
}

async function createBroker(input: Partial<Broker>): Promise<Broker> {
  const { data, error } = await supabase
    .from("brokers")
    .insert([input])
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Broker;
}

async function updateBroker({ id, ...input }: Partial<Broker> & { id: string }): Promise<Broker> {
  const { data, error } = await supabase
    .from("brokers")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Broker;
}

async function deleteBroker(id: string): Promise<void> {
  const { error } = await supabase.from("brokers").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export function useBrokers(filters?: BrokerFilters) {
  return useQuery({
    queryKey: ["brokers", filters],
    queryFn: () => fetchBrokers(filters),
  });
}

export function useBroker(id: string | undefined) {
  return useQuery({
    queryKey: ["broker", id],
    queryFn: () => fetchBroker(id!),
    enabled: !!id,
  });
}

export function useCreateBroker() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBroker,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brokers"] });
    },
  });
}

export function useUpdateBroker() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateBroker,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["brokers"] });
      queryClient.invalidateQueries({ queryKey: ["broker", data.id] });
    },
  });
}

export function useDeleteBroker() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteBroker,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brokers"] });
    },
  });
}
