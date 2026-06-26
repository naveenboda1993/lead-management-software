"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useCallback, useMemo } from "react";
import type { Notification } from "@/types";

const supabase = createClient();

async function fetchNotifications(): Promise<Notification[]> {
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  return (data ?? []) as Notification[];
}

async function markNotificationRead(id: string): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", id);

  if (error) throw new Error(error.message);
}

async function markAllNotificationsRead(): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("read", false);

  if (error) throw new Error(error.message);
}

async function deleteNotification(id: string): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
}

export function useNotifications() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    refetchInterval: 30_000,
  });

  const unreadCount = useMemo(
    () => (query.data ?? []).filter((n) => !n.read).length,
    [query.data]
  );

  const markAsRead = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const remove = useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const recentUnread = useMemo(
    () =>
      (query.data ?? [])
        .filter((n) => !n.read)
        .slice(0, 5),
    [query.data]
  );

  return {
    notifications: query.data ?? [],
    unreadCount,
    recentUnread,
    isLoading: query.isLoading,
    markAsRead: useCallback(
      (id: string) => markAsRead.mutate(id),
      [markAsRead]
    ),
    markAllAsRead: useCallback(
      () => markAllAsRead.mutate(),
      [markAllAsRead]
    ),
    deleteNotification: useCallback(
      (id: string) => remove.mutate(id),
      [remove]
    ),
  };
}
