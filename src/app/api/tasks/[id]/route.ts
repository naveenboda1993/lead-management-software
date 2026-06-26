import { NextRequest } from "next/server";
import { updateTaskSchema } from "@/lib/validations/task";
import {
  getAuthenticatedUser,
  getOrganizationId,
  logActivity,
  logAuditEvent,
  successResponse,
  badRequest,
  notFound,
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

    const { data: task, error } = await supabase
      .from("tasks")
      .select("*, leads!inner(organization_id)")
      .eq("id", id)
      .single();

    if (error || !task) return notFound("Task");

    const lead = (task as Record<string, unknown>).leads as Record<string, unknown> | undefined;
    if (lead?.organization_id !== orgId) return notFound("Task");

    const { leads: _unused, ...taskData } = task as Record<string, unknown>;
    void _unused;

    return successResponse(taskData);
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
      .from("tasks")
      .select("*, leads!inner(organization_id)")
      .eq("id", id)
      .single();

    if (!existing) return notFound("Task");

    const existingLead = existing.leads as Record<string, unknown> | undefined;
    if (existingLead?.organization_id !== orgId) return notFound("Task");

    const body = await request.json();
    const parsed = updateTaskSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.issues.map((e: { message: string }) => e.message).join(", "));
    }

    const { data: updated, error } = await supabase
      .from("tasks")
      .update(parsed.data)
      .eq("id", id)
      .select()
      .single();

    if (error || !updated) return serverError(error ?? "Update failed");

    if (parsed.data.status && parsed.data.status !== existing.status) {
      const desc = `Task "${existing.title}" status changed from ${existing.status} to ${parsed.data.status}`;
      if (existing.lead_id) {
        await logActivity(supabase, {
          lead_id: existing.lead_id,
          type: "TASK_STATUS_CHANGED",
          description: desc,
          created_by: user.id,
          metadata: { task_id: id, from: existing.status, to: parsed.data.status },
        });
      }
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

    const { data: existing } = await supabase
      .from("tasks")
      .select("*, leads!inner(organization_id)")
      .eq("id", id)
      .single();

    if (!existing) return notFound("Task");

    const existingLead = existing.leads as Record<string, unknown> | undefined;
    if (existingLead?.organization_id !== orgId) return notFound("Task");

    const { error } = await supabase.from("tasks").delete().eq("id", id);

    if (error) return serverError(error);

    if (existing.lead_id) {
      await logActivity(supabase, {
        lead_id: existing.lead_id,
        type: "TASK_DELETED",
        description: `Task "${existing.title}" was deleted`,
        created_by: user.id,
        metadata: { task_id: id },
      });
    }

    await logAuditEvent(supabase, {
      action: "DELETE",
      entity_type: "task",
      entity_id: id,
      user_id: user.id,
    });

    return successResponse({ message: "Task deleted successfully" });
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
