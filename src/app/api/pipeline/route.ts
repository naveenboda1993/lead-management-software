import { NextRequest } from "next/server";
import { LeadStatus } from "@/types";
import {
  getAuthenticatedUser,
  getOrganizationId,
  logActivity,
  successResponse,
  badRequest,
  notFound,
  serverError,
} from "@/lib/api/utils";
import { z } from "zod";

const updateStageSchema = z.object({
  lead_id: z.string().uuid(),
  new_status: z.nativeEnum(LeadStatus),
});

export async function GET() {
  try {
    const { user, supabase } = await getAuthenticatedUser();
    if (!user) return unauthorized();

    const orgId = await getOrganizationId(supabase, user.id);
    if (!orgId) return badRequest("No organization found");

    const stages = Object.values(LeadStatus);
    const result: { stage: LeadStatus; leads: unknown[]; count: number; total_value: number }[] = [];

    for (const stage of stages) {
      const { data: leads } = await supabase
        .from("leads")
        .select("*")
        .eq("organization_id", orgId)
        .eq("status", stage)
        .order("updated_at", { ascending: false });

      const leadList = leads ?? [];
      const totalValue = leadList.reduce(
        (sum: number, l: Record<string, unknown>) => sum + ((l.estimated_deal_value as number) ?? 0),
        0
      );

      result.push({
        stage,
        leads: leadList,
        count: leadList.length,
        total_value: totalValue,
      });
    }

    return successResponse(result);
  } catch (error) {
    return serverError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { user, supabase } = await getAuthenticatedUser();
    if (!user) return unauthorized();

    const orgId = await getOrganizationId(supabase, user.id);
    if (!orgId) return badRequest("No organization found");

    const body = await request.json();
    const parsed = updateStageSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.issues.map((e: { message: string }) => e.message).join(", "));
    }

    const { lead_id, new_status } = parsed.data;

    const { data: existing } = await supabase
      .from("leads")
      .select("status, first_name, last_name")
      .eq("id", lead_id)
      .eq("organization_id", orgId)
      .single();

    if (!existing) return notFound("Lead");

    const oldStatus = existing.status;

    const { data: updated, error } = await supabase
      .from("leads")
      .update({ status: new_status })
      .eq("id", lead_id)
      .eq("organization_id", orgId)
      .select()
      .single();

    if (error || !updated) return serverError(error ?? "Update failed");

    await logActivity(supabase, {
      lead_id: lead_id,
      type: "STAGE_CHANGED",
      description: `Lead moved from ${oldStatus} to ${new_status}`,
      created_by: user.id,
      metadata: { from: oldStatus, to: new_status },
    });

    return successResponse(updated);
  } catch (error) {
    return serverError(error);
  }
}

function unauthorized() {
  return Response.json(
    { data: null, error: "Unauthorized", success: false },
    { status: 401 }
  );
}
