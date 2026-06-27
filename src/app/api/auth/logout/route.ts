import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthenticatedUser, successResponse, serverError, logAuditEvent, extractClientInfo } from "@/lib/api/utils";

export async function POST(request: NextRequest) {
  try {
    const { user, supabase } = await getAuthenticatedUser();

    if (user) {
      const clientInfo = extractClientInfo(request);

      const { data: profile } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("id", user.id)
        .single();

      if (profile?.organization_id) {
        await logAuditEvent(supabase, {
          action: "LOGOUT",
          entity_type: "auth",
          entity_id: user.id,
          user_id: user.id,
          changes: clientInfo as unknown as Record<string, unknown>,
          ip_address: clientInfo.ip,
        });
      }

      await supabase.auth.signOut();
    } else {
      const c = await createClient();
      await c.auth.signOut();
    }

    return successResponse({ message: "Signed out successfully" });
  } catch (error) {
    return serverError(error);
  }
}
