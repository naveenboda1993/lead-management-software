"use client";

import { useUser } from "./use-user";
import { PERMISSIONS } from "@/lib/constants";
import type { Permission } from "@/types";

export function usePermissions() {
  const { user, loading } = useUser();

  const role = user?.role ?? null;
  const permissions: Permission[] = role ? PERMISSIONS[role] ?? [] : [];

  function can(action: string, subject: string): boolean {
    return permissions.some(
      (p) => p.action === action && p.subject === subject
    );
  }

  function cannot(action: string, subject: string): boolean {
    return !can(action, subject);
  }

  function canAny(actions: { action: string; subject: string }[]): boolean {
    return actions.some(({ action, subject }) => can(action, subject));
  }

  function canAll(actions: { action: string; subject: string }[]): boolean {
    return actions.every(({ action, subject }) => can(action, subject));
  }

  return {
    role,
    permissions,
    loading,
    can,
    cannot,
    canAny,
    canAll,
  };
}
