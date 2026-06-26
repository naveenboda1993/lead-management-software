"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { LeadStatus, type Lead } from "@/types";

const supabase = createClient();

async function fetchPipelineStages() {
  const stages = Object.values(LeadStatus);
  const result: { stage: LeadStatus; leads: Lead[] }[] = [];

  for (const stage of stages) {
    const { data } = await supabase
      .from("leads")
      .select("*")
      .eq("status", stage)
      .order("updated_at", { ascending: false });

    result.push({ stage, leads: (data ?? []) as Lead[] });
  }

  return result;
}

async function updateLeadStage({
  id,
  status,
  priority,
}: {
  id: string;
  status: LeadStatus;
  priority?: number;
}) {
  const updateData: Record<string, unknown> = { status };
  if (priority !== undefined) {
    updateData.priority = priority;
  }

  const { data, error } = await supabase
    .from("leads")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Lead;
}

export function usePipeline() {
  return useQuery({
    queryKey: ["pipeline"],
    queryFn: fetchPipelineStages,
  });
}

export function useUpdateLeadStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateLeadStage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pipeline"] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}
