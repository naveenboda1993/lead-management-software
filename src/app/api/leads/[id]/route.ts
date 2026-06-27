import { NextRequest } from "next/server";
import { updateLeadSchema } from "@/lib/validations/lead";
import {
  getAuthenticatedUser,
  getOrganizationId,
  logActivity,
  successResponse,
  badRequest,
  notFound,
  forbidden,
  serverError,
} from "@/lib/api/utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { user, supabase } = await getAuthenticatedUser();
    if (!user) return unauthorized();

    const orgId = await getOrganizationId(supabase, user.id);
    if (!orgId) return badRequest("No organization found");

    const { data: lead, error } = await supabase
      .from("leads")
      .select("*")
      .eq("id", id)
      .eq("organization_id", orgId)
      .single();

    if (error || !lead) return notFound("Lead");

    const { count: activitiesCount } = await supabase
      .from("activities")
      .select("*", { count: "exact", head: true })
      .eq("lead_id", id);

    const { count: tasksCount } = await supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .eq("lead_id", id);

    const { count: documentsCount } = await supabase
      .from("documents")
      .select("*", { count: "exact", head: true })
      .eq("lead_id", id);

    return successResponse({
      ...lead,
      activities_count: activitiesCount ?? 0,
      tasks_count: tasksCount ?? 0,
      documents_count: documentsCount ?? 0,
    });
  } catch (error) {
    return serverError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { user, supabase } = await getAuthenticatedUser();
    if (!user) return unauthorized();

    const orgId = await getOrganizationId(supabase, user.id);
    if (!orgId) return badRequest("No organization found");

    const { data: existing } = await supabase
      .from("leads")
      .select("*")
      .eq("id", id)
      .eq("organization_id", orgId)
      .single();

    if (!existing) return notFound("Lead");

    const body = await request.json();
    const parsed = updateLeadSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.issues.map((e: { message: string }) => e.message).join(", "));
    }

    const updates = parsed.data;
    const previousStatus = existing.status;

    const { data: updated, error } = await supabase
      .from("leads")
      .update(updates)
      .eq("id", id)
      .eq("organization_id", orgId)
      .select()
      .single();

    if (error || !updated) return serverError(error ?? "Update failed");

    if (updates.status && updates.status !== previousStatus) {
      await logActivity(supabase, {
        lead_id: id,
        type: "STATUS_CHANGED",
        description: `Status changed from ${previousStatus} to ${updates.status}`,
        created_by: user.id,
        metadata: { from: previousStatus, to: updates.status },
      });
    }

    return successResponse(updated);
  } catch (error) {
    return serverError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { user, supabase } = await getAuthenticatedUser();
    if (!user) return unauthorized();

    const orgId = await getOrganizationId(supabase, user.id);
    if (!orgId) return badRequest("No organization found");

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role as string | undefined;
    const allowedRoles = ["SUPER_ADMIN", "ADMIN", "SALES_MANAGER"];
    if (!role || !allowedRoles.includes(role)) {
      return forbidden("Only super admins, admins, and sales managers can delete leads");
    }

    const { data: existing } = await supabase
      .from("leads")
      .select("id")
      .eq("id", id)
      .eq("organization_id", orgId)
      .single();

    if (!existing) return notFound("Lead");

    const { error } = await supabase
      .from("leads")
      .delete()
      .eq("id", id)
      .eq("organization_id", orgId);

    if (error) return serverError(error);

    return successResponse({ message: "Lead deleted successfully" });
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
