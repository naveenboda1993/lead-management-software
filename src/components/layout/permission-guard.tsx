"use client";

import type { ReactNode } from "react";
import { usePermissions } from "@/hooks/use-permissions";
import { AlertCircle } from "lucide-react";

interface PermissionGuardProps {
  children: ReactNode;
  action: string;
  subject: string;
  fallback?: ReactNode;
}

export function PermissionGuard({
  children,
  action,
  subject,
  fallback,
}: PermissionGuardProps) {
  const { can, loading } = usePermissions();

  if (loading) {
    return null;
  }

  if (!can(action, subject)) {
    if (fallback !== undefined) {
      return <>{fallback}</>;
    }

    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">Access Denied</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          You do not have the required permissions to access this section.
          Please contact your administrator if you believe this is a mistake.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
