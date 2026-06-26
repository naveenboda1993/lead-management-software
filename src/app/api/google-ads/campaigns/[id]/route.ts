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

    const { data: campaign, error } = await supabase
      .from("google_ad_campaigns")
      .select("*")
      .eq("id", id)
      .eq("organization_id", orgId)
      .single();

    if (error || !campaign) return notFound("Campaign");

    const { data: adGroups } = await supabase
      .from("google_ad_groups")
      .select("*")
      .eq("campaign_id", campaign.campaign_id)
      .eq("organization_id", orgId);

    const { data: keywords } = await supabase
      .from("google_ad_keywords")
      .select("*")
      .eq("organization_id", orgId)
      .in("ad_group_id", adGroups?.map((g: { ad_group_id: string }) => g.ad_group_id) ?? []);

    return successResponse({ ...campaign, ad_groups: adGroups ?? [], keywords: keywords ?? [] });
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
