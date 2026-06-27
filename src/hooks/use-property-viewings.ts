"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { PropertyViewing, PropertyInterest, Property, Lead } from "@/types";

const supabase = createClient();

export interface PropertyViewingWithRelations extends PropertyViewing {
  property_interest?: PropertyInterest;
  lead?: Lead;
  property?: Property;
}

async function fetchViewingsByInterest(interestId: string): Promise<PropertyViewingWithRelations[]> {
  const { data } = await supabase
    .from("property_viewings")
    .select("*")
    .eq("property_interest_id", interestId)
    .order("scheduled_at", { ascending: false });
  return (data ?? []) as PropertyViewingWithRelations[];
}

async function fetchViewingsByProperty(propertyId: string): Promise<PropertyViewingWithRelations[]> {
  const { data } = await supabase
    .from("property_viewings")
    .select("*, lead:leads!inner(*), property_interest:property_interests!inner(*)")
    .eq("property_id", propertyId)
    .order("scheduled_at", { ascending: false });
  return (data ?? []) as PropertyViewingWithRelations[];
}

async function fetchViewingsByLead(leadId: string): Promise<PropertyViewingWithRelations[]> {
  const { data } = await supabase
    .from("property_viewings")
    .select("*, property:properties!inner(*), property_interest:property_interests!inner(*)")
    .eq("lead_id", leadId)
    .order("scheduled_at", { ascending: false });
  return (data ?? []) as PropertyViewingWithRelations[];
}

async function createPropertyViewing(input: Partial<PropertyViewing>): Promise<PropertyViewing> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", (await supabase.auth.getUser()).data.user?.id)
    .single();
  const { data, error } = await supabase
    .from("property_viewings")
    .insert([{ ...input, organization_id: profile?.organization_id }])
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as PropertyViewing;
}

async function updatePropertyViewing({ id, ...input }: Partial<PropertyViewing> & { id: string }): Promise<PropertyViewing> {
  const { data, error } = await supabase
    .from("property_viewings")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as PropertyViewing;
}

async function deletePropertyViewing(id: string): Promise<void> {
  const { error } = await supabase.from("property_viewings").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export function useViewingsByInterest(interestId: string | undefined) {
  return useQuery({
    queryKey: ["property-viewings", "interest", interestId],
    queryFn: () => fetchViewingsByInterest(interestId!),
    enabled: !!interestId,
  });
}

export function useViewingsByProperty(propertyId: string | undefined) {
  return useQuery({
    queryKey: ["property-viewings", "property", propertyId],
    queryFn: () => fetchViewingsByProperty(propertyId!),
    enabled: !!propertyId,
  });
}

export function useViewingsByLead(leadId: string | undefined) {
  return useQuery({
    queryKey: ["property-viewings", "lead", leadId],
    queryFn: () => fetchViewingsByLead(leadId!),
    enabled: !!leadId,
  });
}

export function useCreatePropertyViewing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPropertyViewing,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["property-viewings"] });
    },
  });
}

export function useUpdatePropertyViewing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updatePropertyViewing,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["property-viewings"] });
    },
  });
}

export function useDeletePropertyViewing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePropertyViewing,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["property-viewings"] });
    },
  });
}
