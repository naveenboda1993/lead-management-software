"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Campaign } from "@/types";

const supabase = createClient();

export interface CampaignFilters {
  search?: string;
  type?: string[];
  status?: string[];
  created_by?: string;
  date_from?: string;
  date_to?: string;
}

async function fetchCampaigns(filters?: CampaignFilters): Promise<Campaign[]> {
  let query = supabase.from("campaigns").select("*").order("created_at", { ascending: false });

  if (filters?.search) {
    query = query.or(
      `name.ilike.%${filters.search}%,subject.ilike.%${filters.search}%`
    );
  }
  if (filters?.type?.length) {
    query = query.in("type", filters.type);
  }
  if (filters?.status?.length) {
    query = query.in("status", filters.status);
  }
  if (filters?.created_by) {
    query = query.eq("created_by", filters.created_by);
  }
  if (filters?.date_from) {
    query = query.gte("created_at", filters.date_from);
  }
  if (filters?.date_to) {
    query = query.lte("created_at", filters.date_to);
  }

  const { data } = await query;
  return (data ?? []) as Campaign[];
}

async function fetchCampaign(id: string): Promise<Campaign | null> {
  const { data } = await supabase.from("campaigns").select("*").eq("id", id).single();
  return data as Campaign | null;
}

async function createCampaign(input: Partial<Campaign>): Promise<Campaign> {
  const { data, error } = await supabase
    .from("campaigns")
    .insert([input])
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Campaign;
}

async function updateCampaign({ id, ...input }: Partial<Campaign> & { id: string }): Promise<Campaign> {
  const { data, error } = await supabase
    .from("campaigns")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Campaign;
}

async function deleteCampaign(id: string): Promise<void> {
  const { error } = await supabase.from("campaigns").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export function useCampaigns(filters?: CampaignFilters) {
  return useQuery({
    queryKey: ["campaigns", filters],
    queryFn: () => fetchCampaigns(filters),
  });
}

export function useCampaign(id: string | undefined) {
  return useQuery({
    queryKey: ["campaign", id],
    queryFn: () => fetchCampaign(id!),
    enabled: !!id,
  });
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },
  });
}

export function useUpdateCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateCampaign,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["campaign", data.id] });
    },
  });
}

export function useDeleteCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },
  });
}
