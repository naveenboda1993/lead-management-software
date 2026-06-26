"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Supplier } from "@/types";

const supabase = createClient();

export interface SupplierFilters {
  search?: string;
  company?: string;
}

async function fetchSuppliers(filters?: SupplierFilters): Promise<Supplier[]> {
  let query = supabase.from("suppliers").select("*").order("name", { ascending: true });

  if (filters?.search) {
    query = query.or(
      `name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,company.ilike.%${filters.search}%`
    );
  }
  if (filters?.company) {
    query = query.eq("company", filters.company);
  }

  const { data } = await query;
  return (data ?? []) as Supplier[];
}

async function fetchSupplier(id: string): Promise<Supplier | null> {
  const { data } = await supabase.from("suppliers").select("*").eq("id", id).single();
  return data as Supplier | null;
}

async function createSupplier(input: Partial<Supplier>): Promise<Supplier> {
  const { data, error } = await supabase
    .from("suppliers")
    .insert([input])
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Supplier;
}

async function updateSupplier({ id, ...input }: Partial<Supplier> & { id: string }): Promise<Supplier> {
  const { data, error } = await supabase
    .from("suppliers")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Supplier;
}

async function deleteSupplier(id: string): Promise<void> {
  const { error } = await supabase.from("suppliers").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export function useSuppliers(filters?: SupplierFilters) {
  return useQuery({
    queryKey: ["suppliers", filters],
    queryFn: () => fetchSuppliers(filters),
  });
}

export function useSupplier(id: string | undefined) {
  return useQuery({
    queryKey: ["supplier", id],
    queryFn: () => fetchSupplier(id!),
    enabled: !!id,
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateSupplier,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      queryClient.invalidateQueries({ queryKey: ["supplier", data.id] });
    },
  });
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });
}
