"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Product, Inventory } from "@/types";

const supabase = createClient();

export interface ProductFilters {
  search?: string;
  category?: string[];
  size?: string;
  color?: string;
  min_price?: number;
  max_price?: number;
  is_active?: boolean;
}

async function fetchProducts(filters?: ProductFilters): Promise<Product[]> {
  let query = supabase.from("products").select("*").order("created_at", { ascending: false });

  if (filters?.search) {
    query = query.or(
      `name.ilike.%${filters.search}%,sku.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
    );
  }
  if (filters?.category?.length) {
    query = query.in("category", filters.category);
  }
  if (filters?.size) {
    query = query.eq("size", filters.size);
  }
  if (filters?.color) {
    query = query.eq("color", filters.color);
  }
  if (filters?.min_price !== undefined) {
    query = query.gte("price", filters.min_price);
  }
  if (filters?.max_price !== undefined) {
    query = query.lte("price", filters.max_price);
  }
  if (filters?.is_active !== undefined) {
    query = query.eq("is_active", filters.is_active);
  }

  const { data } = await query;
  return (data ?? []) as Product[];
}

async function fetchProduct(id: string): Promise<Product | null> {
  const { data } = await supabase.from("products").select("*").eq("id", id).single();
  return data as Product | null;
}

async function createProduct(input: Partial<Product>): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .insert([input])
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Product;
}

async function updateProduct({ id, ...input }: Partial<Product> & { id: string }): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Product;
}

async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

async function fetchInventory(filters?: { low_stock?: boolean }): Promise<Inventory[]> {
  let query = supabase.from("inventory").select("*, products(*)");
  if (filters?.low_stock) {
    query = query.lte("quantity", supabase.rpc("get_reorder_level", { product_id: "id" }));
  }
  const { data } = await query;
  return (data ?? []) as unknown as Inventory[];
}

async function updateInventory({ product_id, ...input }: Partial<Inventory> & { product_id: string }): Promise<Inventory> {
  const { data, error } = await supabase
    .from("inventory")
    .update(input)
    .eq("product_id", product_id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Inventory;
}

export function useProducts(filters?: ProductFilters) {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: () => fetchProducts(filters),
  });
}

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => fetchProduct(id!),
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProduct,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", data.id] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useInventory(filters?: { low_stock?: boolean }) {
  return useQuery({
    queryKey: ["inventory", filters],
    queryFn: () => fetchInventory(filters),
  });
}

export function useUpdateInventory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateInventory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
}
