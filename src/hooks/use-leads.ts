"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Lead, LeadFilters, Activity } from "@/types";
import type { CreateLeadInput, UpdateLeadInput } from "@/lib/validations/lead";

const supabase = createClient();

async function fetchLeads(filters?: LeadFilters): Promise<Lead[]> {
  let query = supabase.from("leads").select("*").order("created_at", { ascending: false });

  if (filters?.search) {
    query = query.or(
      `first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,company.ilike.%${filters.search}%`
    );
  }
  if (filters?.status?.length) {
    query = query.in("status", filters.status);
  }
  if (filters?.source?.length) {
    query = query.in("lead_source", filters.source);
  }
  if (filters?.priority?.length) {
    query = query.in("priority", filters.priority);
  }
  if (filters?.assigned_to) {
    query = query.eq("assigned_to", filters.assigned_to);
  }
  if (filters?.owner_id) {
    query = query.eq("owner_id", filters.owner_id);
  }
  if (filters?.date_from) {
    query = query.gte("created_at", filters.date_from);
  }
  if (filters?.date_to) {
    query = query.lte("created_at", filters.date_to);
  }
  if (filters?.min_value !== undefined) {
    query = query.gte("estimated_deal_value", filters.min_value);
  }
  if (filters?.max_value !== undefined) {
    query = query.lte("estimated_deal_value", filters.max_value);
  }
  if (filters?.tags?.length) {
    query = query.contains("tags", filters.tags);
  }

  const { data } = await query;
  return (data ?? []) as Lead[];
}

async function fetchLead(id: string): Promise<Lead | null> {
  const { data } = await supabase.from("leads").select("*").eq("id", id).single();
  return data as Lead | null;
}

async function createLead(input: CreateLeadInput): Promise<Lead> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", (await supabase.auth.getUser()).data.user?.id)
    .single();
  const { data, error } = await supabase
    .from("leads")
    .insert([{ ...input, organization_id: profile?.organization_id }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Lead;
}

async function updateLead({ id, ...input }: UpdateLeadInput & { id: string }): Promise<Lead> {
  const { data: oldLead } = await supabase
    .from("leads")
    .select("*")
    .eq("id", id)
    .single();

  const { data, error } = await supabase
    .from("leads")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  if (oldLead) {
    const trackedFields = ["first_name", "last_name", "email", "mobile", "company", "job_title", "industry", "notes", "estimated_deal_value", "priority", "lead_source", "tags"];
    const changedFields = trackedFields.filter((f) => {
      const oldVal = JSON.stringify((oldLead as Record<string, unknown>)[f]);
      const newVal = JSON.stringify((input as Record<string, unknown>)[f]);
      return oldVal !== newVal;
    });

    if (changedFields.length > 0) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const description = `Updated ${changedFields.map((f) => f.replace(/_/g, " ")).join(", ")}`;
        await supabase.from("activities").insert({
          lead_id: id,
          type: "lead_updated",
          description,
          created_by: user.id,
          organization_id: (oldLead as Record<string, unknown>).organization_id,
          metadata: { changed_fields: changedFields },
        });
      }
    }
  }

  return data as Lead;
}

async function deleteLead(id: string): Promise<void> {
  const { error } = await supabase.from("leads").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

async function fetchLeadActivities(leadId: string): Promise<Activity[]> {
  const { data } = await supabase
    .from("activities")
    .select("*, profiles:created_by(full_name)")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });

  return ((data ?? []) as unknown[]).map((item) => {
    const row = item as Activity & { profiles?: { full_name: string } | null };
    return {
      ...row,
      profiles: undefined,
      created_by: row.profiles?.full_name ?? row.created_by,
    } as Activity;
  });
}

export function useLeads(filters?: LeadFilters) {
  return useQuery({
    queryKey: ["leads", filters],
    queryFn: () => fetchLeads(filters),
  });
}

export function useLead(id: string | undefined) {
  return useQuery({
    queryKey: ["lead", id],
    queryFn: () => fetchLead(id!),
    enabled: !!id,
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createLead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}

export function useUpdateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateLead,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["lead", data.id] });
      queryClient.invalidateQueries({ queryKey: ["lead-activities", data.id] });
    },
  });
}

export function useDeleteLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteLead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}

export function useLeadActivities(leadId: string | undefined) {
  return useQuery({
    queryKey: ["lead-activities", leadId],
    queryFn: () => fetchLeadActivities(leadId!),
    enabled: !!leadId,
  });
}
