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
import { predictConversion } from "@/agents/conversion-prediction-agent";

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
      .order("created_at", { ascending: true });

    const { data: tasks } = await supabase
      .from("tasks")
      .select("*")
      .eq("lead_id", lead_id)
      .order("created_at", { ascending: true });

    const dealHistory = [
      ...(activities ?? []).map((a: any) => ({
        type: "activity",
        action: a.type,
        description: a.description,
        timestamp: a.created_at,
        metadata: a.metadata,
      })),
      ...(tasks ?? []).map((t: any) => ({
        type: "task",
        action: t.task_type,
        description: t.title,
        status: t.status,
        timestamp: t.created_at,
        due_date: t.due_date,
      })),
    ].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const createdDate = new Date(lead.created_at);
    const stageDuration = Math.ceil(
      (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    const statusWeights: Record<string, number> = {
      NEW: 20,
      CONTACTED: 30,
      QUALIFIED: 50,
      PROPOSAL_SENT: 60,
      NEGOTIATION: 75,
      WON: 100,
      LOST: 0,
    };

    const engagementScore = Math.min(
      100,
      ((activities?.length ?? 0) * 10) +
        ((tasks?.length ?? 0) * 5) +
        (statusWeights[lead.status as string] ?? 20)
    );

    const result = await predictConversion({
      dealHistory,
      leadProfile: {
        id: lead.id,
        name: `${lead.first_name} ${lead.last_name}`,
        email: lead.email,
        company: lead.company,
        job_title: lead.job_title,
        industry: lead.industry,
        status: lead.status,
        priority: lead.priority,
        tags: lead.tags,
        created_at: lead.created_at,
      },
      industry: lead.industry || "General",
      dealSize: lead.estimated_deal_value || 0,
      stageDuration,
      engagementScore,
    });

    await logActivity(supabase, {
      lead_id,
      type: "AI_PREDICTION",
      description: `AI predicted ${Math.round(result.winProbability * 100)}% win chance for ${lead.first_name} ${lead.last_name}`,
      created_by: user.id,
      metadata: {
        win_probability: result.winProbability,
        expected_revenue: result.expectedRevenue,
        suggested_actions: result.suggestedActions,
        reasoning: result.reasoning,
      },
    });

    return successResponse({
      win_probability: result.winProbability,
      expected_revenue: result.expectedRevenue,
      suggested_actions: result.suggestedActions,
      reasoning: result.reasoning,
    });
  } catch (error) {
    return serverError(error);
  }
}
