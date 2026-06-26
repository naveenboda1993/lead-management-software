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
import { writeEmail } from "@/agents/email-writer-agent";

const VALID_EMAIL_TYPES = [
  "cold_outreach",
  "proposal",
  "meeting_reminder",
  "thank_you",
];

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
    const { lead_id, email_type, additional_context } = body;

    if (!lead_id) {
      return badRequest("lead_id is required");
    }

    if (!email_type || !VALID_EMAIL_TYPES.includes(email_type)) {
      return badRequest(
        `Invalid email_type. Must be one of: ${VALID_EMAIL_TYPES.join(", ")}`
      );
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
      .limit(5);

    const recentActivity = (activities ?? [])
      .map((a: any) => a.description)
      .join(". ");

    const result = await writeEmail({
      leadProfile: {
        id: lead.id,
        name: `${lead.first_name} ${lead.last_name}`,
        email: lead.email,
        company: lead.company,
        job_title: lead.job_title,
        industry: lead.industry,
        status: lead.status,
        estimated_deal_value: lead.estimated_deal_value,
      },
      emailType: email_type,
      companyContext: lead.company
        ? `${lead.company} - ${lead.industry || "Unknown industry"}`
        : "Individual lead",
      additionalContext: additional_context || recentActivity,
    });

    await logActivity(supabase, {
      lead_id,
      type: "AI_EMAIL_WRITTEN",
      description: `AI wrote ${email_type} email for ${lead.first_name} ${lead.last_name}`,
      created_by: user.id,
      metadata: {
        email_type,
        subject: result.subject,
      },
    });

    return successResponse({
      subject: result.subject,
      body: result.body,
      email_type: result.emailType,
    });
  } catch (error) {
    return serverError(error);
  }
}
