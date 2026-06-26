"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

function useRealtimeSubscription({
  table,
  queryKey,
  organizationId,
}: {
  table: string;
  queryKey: string;
  organizationId?: string;
}) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`${table}-changes`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table,
          filter: organizationId
            ? `organization_id=eq.${organizationId}`
            : undefined,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: [queryKey] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, queryKey, organizationId, queryClient]);
}

export function useRealtimeLeads(organizationId?: string) {
  useRealtimeSubscription({
    table: "leads",
    queryKey: "leads",
    organizationId,
  });
}

export function useRealtimeTasks(organizationId?: string) {
  useRealtimeSubscription({
    table: "tasks",
    queryKey: "tasks",
    organizationId,
  });
}

export function useRealtimeNotifications(organizationId?: string) {
  useRealtimeSubscription({
    table: "notifications",
    queryKey: "notifications",
    organizationId,
  });
}

export function useRealtimeDashboard(organizationId?: string) {
  useRealtimeSubscription({
    table: "leads",
    queryKey: "dashboard",
    organizationId,
  });
  useRealtimeSubscription({
    table: "tasks",
    queryKey: "dashboard",
    organizationId,
  });
}
