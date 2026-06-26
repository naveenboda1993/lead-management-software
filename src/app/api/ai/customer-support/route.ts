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
import { resolveSupportTicket } from "@/agents/customer-support-agent";

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
    const { ticket_title, ticket_description, lead_id } = body;

    if (!ticket_title) {
      return badRequest("ticket_title is required");
    }

    if (!ticket_description) {
      return badRequest("ticket_description is required");
    }

    let customerHistory: any[] = [];
    let previousMessages: any[] = [];
    let knowledgeBase: any[] = [];

    if (lead_id) {
      const { data: activities } = await supabase
        .from("activities")
        .select("*")
        .eq("lead_id", lead_id)
        .order("created_at", { ascending: false })
        .limit(20);

      customerHistory = (activities ?? []).map((a: any) => ({
        type: a.type,
        description: a.description,
        created_at: a.created_at,
      }));
    }

    const result = await resolveSupportTicket({
      ticketTitle: ticket_title,
      ticketDescription: ticket_description,
      customerHistory,
      previousMessages,
      knowledgeBase,
    });

    await logActivity(supabase, {
      type: "AI_SUPPORT_RESOLVED",
      description: `AI analyzed support ticket: ${ticket_title}`,
      created_by: user.id,
      metadata: {
        category: result.issueCategory,
        sentiment: result.sentiment,
        priority: result.priority,
        escalate: result.escalate,
      },
    });

    return successResponse({
      issue_category: result.issueCategory,
      sentiment: result.sentiment,
      suggested_response: result.suggestedResponse,
      resolution_steps: result.resolutionSteps,
      priority: result.priority,
      escalate: result.escalate,
    });
  } catch (error) {
    return serverError(error);
  }
}
