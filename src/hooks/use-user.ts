"use client";

import { useAuth } from "@/providers/auth-provider";
import type { User } from "@/types";

export function useUser() {
  const { user: authUser, loading } = useAuth();

  return {
    user: authUser as User | null,
    authUser,
    loading,
  };
}
