/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from "next/server";
import {
  getAuthenticatedUser,
  getOrganizationId,
  logActivity,
  successResponse,
  badRequest,
  serverError,
} from "@/lib/api/utils";
import { optimizeAds } from "@/agents/ads-optimization-agent";

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
    const { campaign_data, ad_groups, keywords } = body;

    if (!campaign_data) {
      return badRequest("campaign_data is required");
    }

    const result = await optimizeAds({
      campaignData: campaign_data,
      adGroups: ad_groups || [],
      keywords: keywords || [],
    });

    await logActivity(supabase, {
      type: "AI_ADS_OPTIMIZED",
      description: `AI optimized ad campaign: ${result.performance?.overall_rating || "completed"} rating`,
      created_by: user.id,
      metadata: {
        performance: result.performance,
        recommendations: result.recommendations,
      },
    });

    return successResponse({
      performance: result.performance,
      recommendations: result.recommendations,
      budget_allocation: result.budgetAllocation,
      keyword_suggestions: result.keywordSuggestions,
    });
  } catch (error) {
    return serverError(error);
  }
}
