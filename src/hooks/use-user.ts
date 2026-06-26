"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@/types";

const supabase = createClient();

export function useUser() {
  const { user: authUser, loading: authLoading } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!authUser) {
      setUser(null);
      setLoading(false);
      return;
    }
    supabase
      .from("profiles")
      .select("*")
      .eq("id", authUser.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setUser({
            id: authUser.id,
            email: authUser.email ?? "",
            name: data.full_name ?? authUser.user_metadata?.name ?? "",
            role: data.role,
            avatar_url: data.avatar_url ?? null,
            phone: data.phone ?? null,
            department: data.department ?? null,
            designation: data.designation ?? null,
            employee_id: data.employee_id ?? null,
            date_of_joining: data.date_of_joining ?? null,
            mfa_enabled: false,
            created_at: data.created_at,
            updated_at: data.updated_at,
          });
        } else {
          setUser({
            id: authUser.id,
            email: authUser.email ?? "",
            name: authUser.user_metadata?.name ?? "",
            role: authUser.user_metadata?.role ?? "SALES_EXECUTIVE",
            created_at: authUser.created_at,
            updated_at: authUser.last_sign_in_at ?? authUser.created_at,
          });
        }
        setLoading(false);
      });
  }, [authUser, authLoading]);

  return { user, authUser, loading };
}
