"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Order, Coupon } from "@/types";

const supabase = createClient();

export interface OrderFilters {
  search?: string;
  status?: string[];
  customer_id?: string;
  date_from?: string;
  date_to?: string;
  payment_status?: string;
}

async function fetchOrders(filters?: OrderFilters): Promise<Order[]> {
  let query = supabase.from("orders").select("*").order("created_at", { ascending: false });

  if (filters?.search) {
    query = query.or(
      `order_number.ilike.%${filters.search}%`
    );
  }
  if (filters?.status?.length) {
    query = query.in("status", filters.status);
  }
  if (filters?.customer_id) {
    query = query.eq("customer_id", filters.customer_id);
  }
  if (filters?.date_from) {
    query = query.gte("created_at", filters.date_from);
  }
  if (filters?.date_to) {
    query = query.lte("created_at", filters.date_to);
  }
  if (filters?.payment_status) {
    query = query.eq("payment_status", filters.payment_status);
  }

  const { data } = await query;
  return (data ?? []) as Order[];
}

async function fetchOrder(id: string): Promise<Order | null> {
  const { data } = await supabase.from("orders").select("*").eq("id", id).single();
  return data as Order | null;
}

async function createOrder(input: Partial<Order>): Promise<Order> {
  const { data, error } = await supabase
    .from("orders")
    .insert([input])
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Order;
}

async function updateOrder({ id, ...input }: Partial<Order> & { id: string }): Promise<Order> {
  const { data, error } = await supabase
    .from("orders")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Order;
}

async function deleteOrder(id: string): Promise<void> {
  const { error } = await supabase.from("orders").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

async function fetchCoupons(): Promise<Coupon[]> {
  const { data } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
  return (data ?? []) as Coupon[];
}

async function createCoupon(input: Partial<Coupon>): Promise<Coupon> {
  const { data, error } = await supabase
    .from("coupons")
    .insert([input])
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Coupon;
}

export function useOrders(filters?: OrderFilters) {
  return useQuery({
    queryKey: ["orders", filters],
    queryFn: () => fetchOrders(filters),
  });
}

export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: ["order", id],
    queryFn: () => fetchOrder(id!),
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useUpdateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateOrder,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", data.id] });
    },
  });
}

export function useDeleteOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useCoupons() {
  return useQuery({
    queryKey: ["coupons"],
    queryFn: fetchCoupons,
  });
}

export function useCreateCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCoupon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
    },
  });
}
