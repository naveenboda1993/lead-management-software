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
import { generateFollowUp } from "@/agents/follow-up-agent";

const VALID_CHANNELS = ["whatsapp", "email", "generic"];

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
    const { lead_id, channel = "generic" } = body;

    if (!lead_id) {
      return badRequest("lead_id is required");
    }

    if (!VALID_CHANNELS.includes(channel)) {
      return badRequest(`Invalid channel. Must be one of: ${VALID_CHANNELS.join(", ")}`);
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

    const { data: communications } = await supabase
      .from("activities")
      .select("*")
      .eq("lead_id", lead_id)
      .in("type", ["NOTE", "FOLLOW_UP", "CALL", "MEETING", "EMAIL"])
      .order("created_at", { ascending: false })
      .limit(10);

    const previousCommunication = (communications ?? []).map((c: any) => ({
      type: c.type,
      description: c.description,
      created_at: c.created_at,
    }));

    const result = await generateFollowUp({
      leadProfile: {
        id: lead.id,
        name: `${lead.first_name} ${lead.last_name}`,
        email: lead.email,
        mobile: lead.mobile,
        company: lead.company,
        status: lead.status,
      },
      leadStatus: lead.status,
      previousCommunication,
      industry: lead.industry || "General",
      channel,
    });

    await logActivity(supabase, {
      lead_id,
      type: "AI_FOLLOW_UP_GENERATED",
      description: `AI generated ${channel} follow-up for ${lead.first_name} ${lead.last_name}`,
      created_by: user.id,
      metadata: {
        channel,
        tone: result.tone,
        timing: result.timing,
        messages: result.messages,
      },
    });

    const responseData: any = {
      channel: result.channel,
      tone: result.tone,
      timing: result.timing,
    };

    if (channel === "whatsapp") {
      responseData.message = result.messages.whatsappMessage;
    } else if (channel === "email") {
      responseData.message = result.messages.emailFollowUp;
    } else {
      responseData.messages = result.messages;
    }

    return successResponse(responseData);
  } catch (error) {
    return serverError(error);
  }
}
