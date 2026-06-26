/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from "next/server";
import {
  getAuthenticatedUser,
  getOrganizationId,
  logActivity,
  successResponse,
  badRequest,
  notFound,
  serverError,
} from "@/lib/api/utils";
import { scoreLead } from "@/agents/lead-scoring-agent";

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
    const { lead_id } = body;

    if (!lead_id) {
      return badRequest("lead_id is required");
    }

    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .select("*")
      .eq("id", lead_id)
      .eq("organization_id", orgId)
      .single();

    if (leadError || !lead) {
      return notFound("Lead");
    }

    const { data: activities } = await supabase
      .from("activities")
      .select("*")
      .eq("lead_id", lead_id)
      .order("created_at", { ascending: false })
      .limit(20);

    const interactions = (activities ?? []).map((a: any) => ({
      type: a.type,
      description: a.description,
      created_at: a.created_at,
      metadata: a.metadata,
    }));

    const result = await scoreLead({
      leadProfile: {
        id: lead.id,
        name: `${lead.first_name} ${lead.last_name}`,
        email: lead.email,
        company: lead.company,
        job_title: lead.job_title,
        status: lead.status,
        priority: lead.priority,
        estimated_deal_value: lead.estimated_deal_value,
        tags: lead.tags,
      },
      source: lead.lead_source || "MANUAL_ENTRY",
      industry: lead.industry || "Unknown",
      companySize: lead.company ? (lead.employees_count ? `${lead.employees_count} employees` : "Unknown") : "Unknown",
      interactionHistory: interactions,
    });

    await logActivity(supabase, {
      lead_id,
      type: "AI_SCORED",
      description: `AI scored lead: ${result.score}/100 - ${result.recommendation}`,
      created_by: user.id,
      metadata: {
        score: result.score,
        conversion_probability: result.conversionProbability,
        recommendation: result.recommendation,
        reasoning: result.reasoning,
      },
    });

    return successResponse({
      score: result.score,
      conversion_probability: result.conversionProbability,
      recommendation: result.recommendation,
      reasoning: result.reasoning,
    });
  } catch (error) {
    return serverError(error);
  }
}
