import { NextRequest } from "next/server";
import {
  getAuthenticatedUser,
  getOrganizationId,
  successResponse,
  badRequest,
  notFound,
  serverError,
} from "@/lib/api/utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { user, supabase } = await getAuthenticatedUser();
    if (!user) return unauthorized();

    const orgId = await getOrganizationId(supabase, user.id);
    if (!orgId) return badRequest("No organization found");

    const { data, error } = await supabase
      .from("call_logs")
      .select("*")
      .eq("id", id)
      .eq("organization_id", orgId)
      .single();

    if (error || !data) return notFound("Call log");

    return successResponse(data);
  } catch (error) {
    return serverError(error);
  }
}

function unauthorized() {
  return Response.json(
    { data: null, error: "Unauthorized", success: false },
    { status: 401 }
  );
}
