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

    let result: any;
    try {
      result = await generateFollowUp({
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
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("401") || msg.includes("Authentication") || msg.includes("API key")) {
        result = generateFallbackFollowUp(lead.first_name ?? "there", lead.status ?? "new", channel);
      } else {
        throw err;
      }
    }

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

function generateFallbackFollowUp(name: string, status: string, channel: string) {
  const templates: Record<string, { tone: string; timing: string; messages: { followUpMessage: string; whatsappMessage: string; emailFollowUp: { subject: string; body: string } } }> = {
    new: {
      tone: "friendly",
      timing: "within_24h",
      messages: {
        followUpMessage: `Hi ${name},\n\nIt was great connecting with you. I wanted to follow up on our conversation and see if you have any questions about our offerings.\n\nLooking forward to hearing from you!\n\nBest regards`,
        whatsappMessage: `Hi ${name}! Just following up on our chat. Let me know if you have any questions. Happy to help!`,
        emailFollowUp: { subject: `Great connecting with you, ${name}!`, body: `<p>Hi ${name},</p><p>It was great connecting with you. I wanted to follow up and see if you have any questions.</p><p>Looking forward to hearing from you!</p><p>Best regards</p>` },
      },
    },
    qualified: {
      tone: "professional",
      timing: "within_24h",
      messages: {
        followUpMessage: `Hi ${name},\n\nThank you for your interest. I've reviewed your requirements and would love to discuss how we can help further.\n\nPlease let me know a convenient time to connect.\n\nBest regards`,
        whatsappMessage: `Hi ${name}! I've looked into your requirements and have some options to share. When's a good time to discuss?`,
        emailFollowUp: { subject: `Following up on your requirements`, body: `<p>Hi ${name},</p><p>Thank you for your interest. I've reviewed your requirements and would love to discuss how we can help further.</p><p>Please let me know a convenient time to connect.</p><p>Best regards</p>` },
      },
    },
    won: {
      tone: "celebratory",
      timing: "within_a_week",
      messages: {
        followUpMessage: `Hi ${name},\n\nThank you for choosing us! We're excited to have you on board.\n\nOur team will be in touch shortly to ensure a smooth onboarding process.\n\nWarm regards`,
        whatsappMessage: `Hi ${name}! Welcome aboard! 🎉 We're thrilled to have you with us. Our team will reach out soon to get you started.`,
        emailFollowUp: { subject: `Welcome aboard, ${name}!`, body: `<p>Hi ${name},</p><p>Thank you for choosing us! We're excited to have you on board.</p><p>Our team will be in touch shortly to ensure a smooth onboarding process.</p><p>Warm regards</p>` },
      },
    },
    lost: {
      tone: "professional",
      timing: "within_a_week",
      messages: {
        followUpMessage: `Hi ${name},\n\nThank you for considering us. We'd love to stay in touch and be here whenever you need us in the future.\n\nWishing you all the best.\n\nBest regards`,
        whatsappMessage: `Hi ${name}! Thanks for your time. We'd love to stay connected — feel free to reach out anytime!`,
        emailFollowUp: { subject: `Keeping in touch`, body: `<p>Hi ${name},</p><p>Thank you for considering us. We'd love to stay in touch and be here whenever you need us in the future.</p><p>Wishing you all the best.</p><p>Best regards</p>` },
      },
    },
  };
  const template = templates[status] ?? templates.new;
  return { ...template, channel };
}
