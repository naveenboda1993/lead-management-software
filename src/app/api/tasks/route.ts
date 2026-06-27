import { NextRequest } from "next/server";
import { createTaskSchema } from "@/lib/validations/task";
import {
  getAuthenticatedUser,
  getOrganizationId,
  logActivity,
  successResponse,
  badRequest,
  serverError,
  paginatedResponse,
  parseNumericParam,
} from "@/lib/api/utils";

export async function GET(request: NextRequest) {
  try {
    const { user, supabase } = await getAuthenticatedUser();
    if (!user) return unauthorized();

    const orgId = await getOrganizationId(supabase, user.id);
    if (!orgId) return badRequest("No organization found");

    const { searchParams } = new URL(request.url);
    const page = parseNumericParam(searchParams.get("page"), 1);
    const limit = parseNumericParam(searchParams.get("limit"), 20);
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const assignedTo = searchParams.get("assigned_to");
    const leadId = searchParams.get("lead_id");
    const dueBefore = searchParams.get("due_before");
    const dueAfter = searchParams.get("due_after");

    let query = supabase
      .from("tasks")
      .select("*", { count: "exact" })
      .eq("organization_id", orgId);

    if (status) {
      const statuses = status.split(",");
      query = query.in("status", statuses);
    }

    if (type) {
      const types = type.split(",");
      query = query.in("task_type", types);
    }

    if (assignedTo) {
      query = query.eq("assigned_to", assignedTo);
    }

    if (leadId) {
      query = query.eq("lead_id", leadId);
    }

    if (dueBefore) {
      query = query.lte("due_date", dueBefore);
    }

    if (dueAfter) {
      query = query.gte("due_date", dueAfter);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, count, error } = await query
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) return serverError(error);

    return paginatedResponse(data ?? [], count ?? 0, page, limit);
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, supabase } = await getAuthenticatedUser();
    if (!user) return unauthorized();

    const orgId = await getOrganizationId(supabase, user.id);
    if (!orgId) return badRequest("No organization found");

    const body = await request.json();
    const parsed = createTaskSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.issues.map((e: { message: string }) => e.message).join(", "));
    }

    const taskData = parsed.data;

    if (taskData.lead_id) {
      const { data: lead } = await supabase
        .from("leads")
        .select("id")
        .eq("id", taskData.lead_id)
        .eq("organization_id", orgId)
        .single();

      if (!lead) return badRequest("Lead not found in your organization");
    }

    if (taskData.assigned_to) {
      const { data: assignee } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", taskData.assigned_to)
        .eq("organization_id", orgId)
        .single();

      if (!assignee) return badRequest("Assignee not found in your organization");
    }

    const { data: task, error } = await supabase
      .from("tasks")
      .insert({
        ...taskData,
        organization_id: orgId,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) return serverError(error);

    if (taskData.lead_id) {
      await logActivity(supabase, {
        lead_id: taskData.lead_id,
        type: "TASK_CREATED",
        description: `Task "${taskData.title}" was created`,
        created_by: user.id,
        metadata: { task_id: task.id, task_type: taskData.task_type },
      });
    }

    return successResponse(task, 201);
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
