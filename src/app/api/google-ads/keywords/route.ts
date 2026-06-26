import { NextRequest } from "next/server";
import {
  getAuthenticatedUser,
  getOrganizationId,
  successResponse,
  badRequest,
  serverError,
} from "@/lib/api/utils";

export async function GET(request: NextRequest) {
  try {
    const { user, supabase } = await getAuthenticatedUser();
    if (!user) return unauthorized();

    const orgId = await getOrganizationId(supabase, user.id);
    if (!orgId) return badRequest("No organization found");

    const { searchParams } = new URL(request.url);
    const adGroupId = searchParams.get("ad_group_id");

    let query = supabase
      .from("google_ad_keywords")
      .select("*")
      .eq("organization_id", orgId);

    if (adGroupId) {
      query = query.eq("ad_group_id", adGroupId);
    }

    const { data, error } = await query.order("keyword", { ascending: true });
    if (error) return serverError(error);

    return successResponse(data ?? []);
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
