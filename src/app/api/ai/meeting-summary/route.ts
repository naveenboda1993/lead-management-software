import { NextRequest } from "next/server";
import {
  getAuthenticatedUser,
  getOrganizationId,
  logActivity,
  successResponse,
  badRequest,
  serverError,
} from "@/lib/api/utils";
import { summarizeMeeting } from "@/agents/meeting-summary-agent";

export async function POST(request: NextRequest) {
  try {
    const { user, supabase } = await getAuthenticatedUser();
    if (!user) {
      return Response.json(
        { data: null, error: "Unauthorized", success: false },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { transcript, lead_id, meeting_context, participants } = body;

    if (!transcript) {
      return badRequest("transcript is required");
    }

    const result = await summarizeMeeting({
      transcript,
      meetingContext: meeting_context || "",
      participants: participants || [],
    });

    if (lead_id) {
      const orgId = await getOrganizationId(supabase, user.id);
      if (orgId) {
        const { data: lead } = await supabase
          .from("leads")
          .select("id")
          .eq("id", lead_id)
          .eq("organization_id", orgId)
          .single();

        if (lead) {
          await logActivity(supabase, {
            lead_id,
            type: "MEETING_SUMMARY",
            description: `Meeting summary generated: ${result.summary.substring(0, 200)}`,
            created_by: user.id,
            metadata: {
              summary: result.summary,
              key_decisions: result.keyDecisions,
              action_items: result.actionItems,
              risks: result.risks,
              next_steps: result.nextSteps,
            },
          });
        }
      }
    }

    return successResponse({
      summary: result.summary,
      key_decisions: result.keyDecisions,
      action_items: result.actionItems,
      risks: result.risks,
      next_steps: result.nextSteps,
    });
  } catch (error) {
    return serverError(error);
  }
}
