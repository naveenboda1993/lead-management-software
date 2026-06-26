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
import { generateCampaign } from "@/agents/marketing-campaign-agent";

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
    const { campaign_goal, target_audience, budget, channel, industry } = body;

    if (!campaign_goal) {
      return badRequest("campaign_goal is required");
    }

    if (!target_audience) {
      return badRequest("target_audience is required");
    }

    const result = await generateCampaign({
      campaignGoal: campaign_goal,
      targetAudience: target_audience,
      budget: budget || 0,
      channel: channel || "email",
      industry: industry || "General",
    });

    await logActivity(supabase, {
      type: "AI_CAMPAIGN_GENERATED",
      description: `AI generated campaign: ${result.campaignName}`,
      created_by: user.id,
      metadata: {
        campaign_name: result.campaignName,
        channels: result.channels,
        budget: result.budget,
        kpis: result.kpis,
      },
    });

    return successResponse({
      campaign_name: result.campaignName,
      target_audience: result.targetAudience,
      channels: result.channels,
      budget: result.budget,
      content: result.content,
      schedule: result.schedule,
      kpis: result.kpis,
    });
  } catch (error) {
    return serverError(error);
  }
}
