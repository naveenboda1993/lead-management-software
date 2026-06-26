"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Property, Broker } from "@/types";

const supabase = createClient();

export interface PropertyFilters {
  search?: string;
  type?: string[];
  status?: string[];
  city?: string;
  min_price?: number;
  max_price?: number;
  bedrooms?: number;
}

async function fetchProperties(filters?: PropertyFilters): Promise<Property[]> {
  let query = supabase.from("properties").select("*").order("created_at", { ascending: false });

  if (filters?.search) {
    query = query.or(
      `property_name.ilike.%${filters.search}%,location.ilike.%${filters.search}%,city.ilike.%${filters.search}%`
    );
  }
  if (filters?.type?.length) {
    query = query.in("property_type", filters.type);
  }
  if (filters?.status?.length) {
    query = query.in("status", filters.status);
  }
  if (filters?.city) {
    query = query.eq("city", filters.city);
  }
  if (filters?.min_price !== undefined) {
    query = query.gte("price", filters.min_price);
  }
  if (filters?.max_price !== undefined) {
    query = query.lte("price", filters.max_price);
  }
  if (filters?.bedrooms !== undefined) {
    query = query.eq("bedrooms", filters.bedrooms);
  }

  const { data } = await query;
  return (data ?? []) as Property[];
}

async function fetchProperty(id: string): Promise<Property | null> {
  const { data } = await supabase.from("properties").select("*").eq("id", id).single();
  return data as Property | null;
}

async function createProperty(input: Partial<Property>): Promise<Property> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", (await supabase.auth.getUser()).data.user?.id)
    .single();

  const { data, error } = await supabase
    .from("properties")
    .insert([{ ...input, organization_id: profile?.organization_id }])
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Property;
}

async function updateProperty({ id, ...input }: Partial<Property> & { id: string }): Promise<Property> {
  const { data, error } = await supabase
    .from("properties")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Property;
}

async function deleteProperty(id: string): Promise<void> {
  const { error } = await supabase.from("properties").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

async function fetchBrokers(): Promise<Broker[]> {
  const { data } = await supabase.from("brokers").select("*").order("name", { ascending: true });
  return (data ?? []) as Broker[];
}

export function useProperties(filters?: PropertyFilters) {
  return useQuery({
    queryKey: ["properties", filters],
    queryFn: () => fetchProperties(filters),
  });
}

export function useProperty(id: string | undefined) {
  return useQuery({
    queryKey: ["property", id],
    queryFn: () => fetchProperty(id!),
    enabled: !!id,
  });
}

export function useCreateProperty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProperty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });
}

export function useUpdateProperty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProperty,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      queryClient.invalidateQueries({ queryKey: ["property", data.id] });
    },
  });
}

export function useDeleteProperty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteProperty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });
}

export function useBrokers() {
  return useQuery({
    queryKey: ["brokers"],
    queryFn: fetchBrokers,
  });
}
