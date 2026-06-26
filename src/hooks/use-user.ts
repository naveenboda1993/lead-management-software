"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/providers/auth-provider";
import { createClient } from "@/lib/supabase/client";
import type { User, Role } from "@/types";

const supabase = createClient();

export function useUser() {
  const { user: authUser, loading: authLoading } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (authLoading) return;
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    if (!authUser) {
      setUser(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    supabase
      .from("profiles")
      .select("*")
      .eq("id", authUser.id)
      .single()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error || !data) {
          setUser({
            id: authUser.id,
            email: authUser.email ?? "",
            name: authUser.user_metadata?.name ?? "",
            role: ((authUser.user_metadata?.role as string) ?? "SALES_EXECUTIVE").toUpperCase() as Role,
            created_at: authUser.created_at,
            updated_at: authUser.last_sign_in_at ?? authUser.created_at,
          });
        } else {
          setUser({
            id: authUser.id,
            email: authUser.email ?? "",
            name: data.full_name ?? authUser.user_metadata?.name ?? "",
            role: (data.role ?? "").toUpperCase() as Role,
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
        }
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [authUser, authLoading]);

  return { user, authUser, loading };
}
