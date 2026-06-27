import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { loginSchema } from "@/lib/validations/auth";
import { successResponse, badRequest, serverError, logAuditEvent, extractClientInfo } from "@/lib/api/utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.issues.map((e: { message: string }) => e.message).join(", "));
    }

    const { email, password } = parsed.data;
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return badRequest(error.message);
    }

    const clientInfo = extractClientInfo(request);

    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id")
      .eq("id", data.user.id)
      .single();

    if (profile?.organization_id) {
      await logAuditEvent(supabase, {
        action: "LOGIN",
        entity_type: "auth",
        entity_id: data.user.id,
        user_id: data.user.id,
        organization_id: profile.organization_id,
        changes: clientInfo as unknown as Record<string, unknown>,
        ip_address: clientInfo.ip,
      });
    }

    return successResponse({
      user: data.user,
      session: data.session,
    });
  } catch (error) {
    return serverError(error);
  }
}
