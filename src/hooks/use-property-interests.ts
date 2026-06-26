"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { PropertyInterest, Lead, Property } from "@/types";

const supabase = createClient();

export interface PropertyInterestWithRelations extends PropertyInterest {
  lead?: Lead;
  property?: Property;
}

async function fetchPropertyInterestsByLead(leadId: string): Promise<PropertyInterestWithRelations[]> {
  const { data } = await supabase
    .from("property_interests")
    .select("*, property:properties(*)")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });
  return (data ?? []) as PropertyInterestWithRelations[];
}

async function fetchPropertyInterestsByProperty(propertyId: string): Promise<PropertyInterestWithRelations[]> {
  const { data } = await supabase
    .from("property_interests")
    .select("*, lead:leads!inner(*)")
    .eq("property_id", propertyId)
    .order("created_at", { ascending: false });
  return (data ?? []) as PropertyInterestWithRelations[];
}

async function createPropertyInterest(input: Partial<PropertyInterest>): Promise<PropertyInterest> {
  const { data, error } = await supabase
    .from("property_interests")
    .insert([input])
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as PropertyInterest;
}

async function updatePropertyInterest({ id, ...input }: Partial<PropertyInterest> & { id: string }): Promise<PropertyInterest> {
  const { data, error } = await supabase
    .from("property_interests")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as PropertyInterest;
}

async function deletePropertyInterest(id: string): Promise<void> {
  const { error } = await supabase.from("property_interests").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export function usePropertyInterestsByLead(leadId: string | undefined) {
  return useQuery({
    queryKey: ["property-interests", "lead", leadId],
    queryFn: () => fetchPropertyInterestsByLead(leadId!),
    enabled: !!leadId,
  });
}

export function usePropertyInterestsByProperty(propertyId: string | undefined) {
  return useQuery({
    queryKey: ["property-interests", "property", propertyId],
    queryFn: () => fetchPropertyInterestsByProperty(propertyId!),
    enabled: !!propertyId,
  });
}

export function useCreatePropertyInterest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPropertyInterest,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["property-interests"] });
      queryClient.invalidateQueries({ queryKey: ["property-interests", "lead", data.lead_id] });
      queryClient.invalidateQueries({ queryKey: ["property-interests", "property", data.property_id] });
    },
  });
}

export function useUpdatePropertyInterest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updatePropertyInterest,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["property-interests"] });
      queryClient.invalidateQueries({ queryKey: ["property-interests", "lead", data.lead_id] });
      queryClient.invalidateQueries({ queryKey: ["property-interests", "property", data.property_id] });
    },
  });
}

export function useDeletePropertyInterest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePropertyInterest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["property-interests"] });
    },
  });
}
