/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from "next/server";
import {
  getAuthenticatedUser,
  getOrganizationId,
  successResponse,
  badRequest,
  serverError,
} from "@/lib/api/utils";
import { recommendProperties } from "@/agents/property-recommendation-agent";

export async function POST(request: NextRequest) {
  try {
    const { user, supabase } = await getAuthenticatedUser();
    if (!user) {
      return Response.json(
        { data: null, error: "Unauthorized", success: false },
        { status: 401 }
      );
    }

    const orgId = await getOrganizationId(supabase, user.id);
    if (!orgId) {
      return badRequest("No organization found");
    }

    const body = await request.json();
    const { buyer_preferences, lead_ids } = body;

    if (!buyer_preferences) {
      return badRequest("buyer_preferences is required");
    }

    let propertyListings: any[] = [];

    if (lead_ids && Array.isArray(lead_ids) && lead_ids.length > 0) {
      const { data: leads } = await supabase
        .from("leads")
        .select("id, first_name, last_name, company, industry, status, estimated_deal_value, tags, metadata")
        .in("id", lead_ids)
        .eq("organization_id", orgId);

      propertyListings = (leads ?? []).map((l: any) => ({
        property_id: l.id,
        title: `${l.first_name} ${l.last_name}`,
        company: l.company,
        industry: l.industry,
        value: l.estimated_deal_value,
        status: l.status,
        tags: l.tags,
        metadata: l.metadata,
      }));
    }

    const result = await recommendProperties({
      buyerPreferences: buyer_preferences,
      propertyListings,
    });

    return successResponse({
      recommendations: result.recommendations,
      top_match: result.top_match,
    });
  } catch (error) {
    return serverError(error);
  }
}
