"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Coupon } from "@/types";

const supabase = createClient();

async function fetchCoupons(): Promise<Coupon[]> {
  const { data } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
  return (data ?? []) as Coupon[];
}

async function fetchCoupon(id: string): Promise<Coupon | null> {
  const { data } = await supabase.from("coupons").select("*").eq("id", id).single();
  return data as Coupon | null;
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

async function updateCoupon({ id, ...input }: Partial<Coupon> & { id: string }): Promise<Coupon> {
  const { data, error } = await supabase
    .from("coupons")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Coupon;
}

async function deleteCoupon(id: string): Promise<void> {
  const { error } = await supabase.from("coupons").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export function useCoupons() {
  return useQuery({
    queryKey: ["coupons"],
    queryFn: fetchCoupons,
  });
}

export function useCoupon(id: string | undefined) {
  return useQuery({
    queryKey: ["coupon", id],
    queryFn: () => fetchCoupon(id!),
    enabled: !!id,
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

export function useUpdateCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateCoupon,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      queryClient.invalidateQueries({ queryKey: ["coupon", data.id] });
    },
  });
}

export function useDeleteCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCoupon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
    },
  });
}
